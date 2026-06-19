import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { DynamicChatMessage } from '@/types';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentAuthUser } from '@/app/actions/auth';
import { getDifficultyInstructions, getLevelInfoByXp } from '@/lib/utils/xp';


// Helper to safely parse JSON response even if the model outputs markdown wrapper or extra text
function parseRobustJson(text: string): any {
  const cleanedText = text.trim();
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    // Try to extract JSON between { and }
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.error("Failed to parse extracted JSON block:", innerError);
      }
    }
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, context, level } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    // Query user's current XP from database
    let userXp = 0;
    try {
      const authUser = await getCurrentAuthUser();
      if (authUser) {
        const userProfile = await db
          .select({ currentXp: users.currentXp })
          .from(users)
          .where(eq(users.id, authUser.id))
          .limit(1);
        if (userProfile.length > 0) {
          userXp = userProfile[0].currentXp;
        }
      }
    } catch (dbError) {
      console.error('Error fetching user XP in chat API:', dbError);
      // fallback based on level string
      if (level === 'advanced') userXp = 1250;
      else if (level === 'intermediate') userXp = 650;
      else userXp = 50;
    }

    const rankInfo = getLevelInfoByXp(userXp);
    const difficultyInstructions = getDifficultyInstructions(userXp);

    // Prepare system prompt based on scenario context and user's rank difficulty
    const systemPrompt = `You are an AI acting as a conversation partner in a spoken English learning app.
The user is practicing their spoken English.
Current Rank: "${rankInfo.label}"
Scenario Context: "${context}"

${difficultyInstructions}

INSTRUCTIONS FOR OUTPUT FORMAT:
1. Respond to the user's last message naturally and engagingly, continuing the roleplay scenario.
2. Provide a full, natural response. Feel free to use longer sentences and add rich context to make the conversation feel like a real-life interaction. Do not limit yourself to short sentences.
3. Provide a short "hint" for what the user could say next. The hint should be a natural example sentence the user could use to reply.
4. You MUST return your response strictly as a JSON object with two keys:
   - "reply": Your conversational, full-length response.
   - "hintForUser": An example of what the user could say next.

DO NOT return anything other than the JSON object. Output ONLY valid JSON.`;

    // ─── GROQ API CALL ────────────────────────────────────────────────────────
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'No API key configured (Groq is not configured)' },
        { status: 503 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages as any,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const resultText = response.choices[0]?.message?.content || '{}';
      const resultJson = parseRobustJson(resultText);

      return NextResponse.json({
        reply: resultJson.reply || "I didn't quite catch that. Could you repeat?",
        hintForUser: resultJson.hintForUser || "Could you repeat that?",
      });
    } catch (error: any) {
      console.error('Groq API Call Error:', error);
      // Check for rate limit error (429)
      if (
        error?.status === 429 || 
        error?.statusCode === 429 || 
        error?.message?.includes('429') ||
        error?.code === 'rate_limit_exceeded'
      ) {
        return NextResponse.json(
          { 
            error: 'rate_limit', 
            message: 'System is temporarily busy. Please wait a moment.',
            retryAfterSeconds: 15 
          },
          { status: 429 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
