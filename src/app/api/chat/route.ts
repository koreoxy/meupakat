import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { DynamicChatMessage } from '@/types';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, context, level } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    // Prepare system prompt based on scenario context
    const systemPrompt = `You are an AI acting as a conversation partner in a spoken English learning app.
The user is practicing their spoken English at a "${level}" level.
Scenario Context: "${context}"

INSTRUCTIONS:
1. Respond to the user's last message naturally and engagingly, continuing the roleplay scenario.
2. Provide a full, natural response. Feel free to use longer sentences and add rich context to make the conversation feel like a real-life interaction. Do not limit yourself to short sentences.
3. Use vocabulary appropriate for the user's level (${level}).
4. Provide a short "hint" for what the user could say next. The hint should be a natural example sentence the user could use to reply.
5. You MUST return your response strictly as a JSON object with two keys:
   - "reply": Your conversational, full-length response.
   - "hintForUser": An example of what the user could say next.

DO NOT return anything other than the JSON object. Output ONLY valid JSON.`;

    // ─── GEMINI DIRECT FETCH (To bypass OpenAI SDK compatibility bugs) ──────────
    if (process.env.GEMINI_API_KEY) {
      const geminiMessages = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          }
        })
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error('Gemini API Error:', errText);
        throw new Error(`Gemini API Error: ${geminiRes.status}`);
      }

      const geminiData = await geminiRes.json();
      const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const resultJson = JSON.parse(resultText);

      return NextResponse.json({
        reply: resultJson.reply || "I didn't quite catch that. Could you repeat?",
        hintForUser: resultJson.hintForUser || "Could you repeat that?",
      });
    }

    // ─── OPENAI / GROQ (Using OpenAI SDK) ──────────────────────────────────────
    let client: OpenAI;
    let modelName: string;

    if (process.env.GROQ_API_KEY) {
      client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      modelName = 'llama-3.3-70b-versatile';
    } else if (process.env.OPENAI_API_KEY) {
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      modelName = 'gpt-4o-mini';
    } else {
      return NextResponse.json(
        { error: 'No API key configured' },
        { status: 503 }
      );
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await client.chat.completions.create({
      model: modelName,
      messages: apiMessages as any,
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const resultJson = JSON.parse(resultText);

    return NextResponse.json({
      reply: resultJson.reply || "I didn't quite catch that. Could you repeat?",
      hintForUser: resultJson.hintForUser || "Could you repeat that?",
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
