import os
import argparse
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig
)
from trl import SFTTrainer, SFTConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from huggingface_hub import login, HfApi

def train_and_upload(args):
    print(f"=== 1. Logging into Hugging Face ===")
    if args.hf_token:
        login(token=args.hf_token)
    else:
        # Fallback to token from environment variable or cached credentials
        print("HF token not provided. Ensure you are logged in via 'huggingface-cli login' or HF_TOKEN env var.")

    print(f"\n=== 2. Loading Dataset ===")
    # Loading everyday conversations dataset
    dataset_name = "HuggingFaceTB/everyday-conversations-llama3.1-2k"
    print(f"Loading dataset: {dataset_name}")
    dataset = load_dataset(dataset_name, split="train_sft")

    print(f"\n=== 3. Loading Model & Tokenizer ===")
    print(f"Base model: {args.base_model}")
    
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Configure Quantization (QLoRA) to save memory on free tier GPUs (T4)
    bnb_config = None
    if args.use_qlora:
        print("Configuring QLoRA 4-bit quantization...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True
        )

    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        quantization_config=bnb_config,
        device_map="auto" if args.use_qlora else None,
        torch_dtype=torch.float16,
        trust_remote_code=True
    )

    if args.use_qlora:
        model = prepare_model_for_kbit_training(model)
        # Configure LoRA
        peft_config = LoraConfig(
            r=16,
            lora_alpha=32,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM"
        )
        model = get_peft_model(model, peft_config)
        print("LoRA adapter prepared.")

    # Format dataset to match chat template
    # Dataset contains list of messages under 'messages' column
    # Formatting helper to convert messages to appropriate format
    def format_chat_template(example):
        # Format the chat into model's expected prompt
        # We also enforce system prompt to generate the structured JSON
        # containing "reply" and "hintForUser"
        messages = example["messages"]
        
        # In everyday-conversations-llama3.1-2k dataset:
        # Each sample is a list of dialogues like:
        # [{'role': 'user', 'content': 'Hello'}, {'role': 'assistant', 'content': 'Hi there...'}]
        
        # Inject standard JSON output instruction to the system prompt
        system_instruction = (
            "You are an AI conversation partner. You MUST respond strictly in valid JSON format. "
            "The JSON must have two keys:\n"
            '- "reply": Your conversational, full-length response.\n'
            '- "hintForUser": An example of what the user could say next.\n'
            "Do not output any text before or after the JSON."
        )
        
        formatted_messages = []
        # Add system prompt at the beginning
        formatted_messages.append({"role": "system", "content": system_instruction})
        
        for msg in messages:
            content = msg["content"]
            # If assistant response is not in JSON, wrap it in JSON format to train the model to output JSON
            if msg["role"] == "assistant" and not content.strip().startswith("{"):
                # Clean content of quotes
                clean_reply = content.replace('"', '\\"').replace('\n', ' ')
                hint_suggestion = "Tell me more about it."
                content = f'{{"reply": "{clean_reply}", "hintForUser": "{hint_suggestion}"}}'
            
            formatted_messages.append({"role": msg["role"], "content": content})
            
        return {"text": tokenizer.apply_chat_template(formatted_messages, tokenize=False)}

    print("Formatting dataset with Chat Template and JSON constraints...")
    formatted_dataset = dataset.map(format_chat_template)

    print(f"\n=== 4. Setting Up Training Arguments ===")
    training_args = SFTConfig(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        learning_rate=args.lr,
        logging_steps=10,
        save_strategy="epoch",
        fp16=True,
        optim="paged_adamw_8bit" if args.use_qlora else "adamw_torch",
        report_to="none",
        dataset_text_field="text",
        max_length=args.max_seq_length,
    )

    print(f"\n=== 5. Starting Training ===")
    trainer = SFTTrainer(
        model=model,
        train_dataset=formatted_dataset,
        processing_class=tokenizer,
        args=training_args,
    )
    
    trainer.train()
    print("Training completed successfully!")

    print(f"\n=== 6. Saving Model Locally ===")
    trainer.model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"Model saved locally to: {args.output_dir}")

    # If LoRA was used, we should ideally merge the weights before uploading to Hugging Face
    # so that Serverless Inference API can run the base model directly.
    # Hugging Face Serverless API runs base models directly, it doesn't support dynamically loading custom LoRA adapters on the fly.
    if args.use_qlora and args.upload_repo:
        print("\n=== 7. Merging LoRA Weights ===")
        print("Loading base model in FP16 to merge LoRA adapter...")
        # Free memory first
        import gc
        import torch
        del model
        del trainer
        gc.collect()
        torch.cuda.empty_cache()
        
        from peft import PeftModel
        base_model = AutoModelForCausalLM.from_pretrained(
            args.base_model,
            torch_dtype=torch.float16,
            device_map="cpu"  # Load in CPU to merge, then push
        )
        peft_model = PeftModel.from_pretrained(base_model, args.output_dir)
        merged_model = peft_model.merge_and_unload()
        
        merged_dir = f"{args.output_dir}_merged"
        merged_model.save_pretrained(merged_dir)
        tokenizer.save_pretrained(merged_dir)
        upload_path = merged_dir
        print(f"Merged model saved to: {merged_dir}")
    else:
        upload_path = args.output_dir

    if args.upload_repo:
        print(f"\n=== 8. Uploading to Hugging Face Hub ===")
        repo_id = args.upload_repo
        print(f"Uploading model from '{upload_path}' to HF Hub repository: '{repo_id}'")
        
        # Create repo if not exists
        api = HfApi()
        api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True)
        
        # Upload folder
        api.upload_folder(
            folder_path=upload_path,
            repo_id=repo_id,
            repo_type="model"
        )
        print(f"Model successfully uploaded! Access it here: https://huggingface.co/{repo_id}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune and upload a small LLM for everyday conversations.")
    parser.add_argument("--base_model", type=str, default="HuggingFaceTB/SmolLM2-1.7B-Instruct", 
                        help="Base model to fine-tune (e.g. HuggingFaceTB/SmolLM2-1.7B-Instruct or meta-llama/Llama-3.2-1B-Instruct)")
    parser.add_argument("--output_dir", type=str, default="./results", 
                        help="Local directory to save training checkpoints and model")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Training batch size per device")
    parser.add_argument("--gradient_accumulation_steps", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--max_seq_length", type=int, default=512, help="Maximum sequence length")
    parser.add_argument("--use_qlora", action="store_true", default=True, help="Use QLoRA for training (strongly recommended for T4 GPU)")
    parser.add_argument("--no_qlora", action="store_false", dest="use_qlora", help="Disable QLoRA and train in full precision")
    parser.add_argument("--hf_token", type=str, default=None, help="Hugging Face Write Token")
    parser.add_argument("--upload_repo", type=str, default=None, 
                        help="Hugging Face repo ID to upload to (e.g. 'your-username/meupakat-llama3.1-2k')")

    args = parser.parse_args()
    train_and_upload(args)
