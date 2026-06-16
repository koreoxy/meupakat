// src/app/api/evaluate/route.ts
// AI evaluation API route for conversation grading

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    const conversationText = messages
      .map((m: any) => `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an expert English language assessor.
Evaluate the user's performance in the provided conversation history.
Grade their English proficiency in two areas:
1. "grammarScore": Rate their grammar correctness from 0 to 15.
2. "vocabularyScore": Rate their vocabulary range, appropriateness, and usage from 0 to 15.

Also provide a short, encouraging summary of feedback ("feedback") in 1-2 sentences in Indonesian.

You MUST return your evaluation strictly as a JSON object with three keys:
- "grammarScore": integer between 0 and 15.
- "vocabularyScore": integer between 0 and 15.
- "feedback": string.

DO NOT return anything other than the JSON object. Output ONLY valid JSON.`;

    // ─── GEMINI DIRECT FETCH ──────────────────────────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `Evaluate this conversation:\n\n${conversationText}` }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const resultJson = JSON.parse(resultText);
        return NextResponse.json({
          grammarScore: resultJson.grammarScore ?? 10,
          vocabularyScore: resultJson.vocabularyScore ?? 10,
          feedback: resultJson.feedback || 'Bagus sekali! Tetap semangat berlatih.',
        });
      }
    }

    // ─── OPENAI / GROQ ──────────────────────────────────────────────────────
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
        { error: 'No API key configured for evaluation' },
        { status: 503 }
      );
    }

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Evaluate this conversation:\n\n${conversationText}` }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const resultJson = JSON.parse(resultText);

    return NextResponse.json({
      grammarScore: resultJson.grammarScore ?? 10,
      vocabularyScore: resultJson.vocabularyScore ?? 10,
      feedback: resultJson.feedback || 'Bagus sekali! Tetap semangat berlatih.',
    });
  } catch (error: any) {
    console.error('Evaluation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
