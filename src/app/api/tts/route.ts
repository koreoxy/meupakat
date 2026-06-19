// src/app/api/tts/route.ts
// OpenAI Text-to-Speech API route
//
// Kenapa perlu route terpisah (tidak langsung di client)?
// → API key OPENAI_API_KEY harus disimpan di server, tidak boleh terekspos ke browser.
//
// Request:  POST /api/tts  { text: string, voice?: string }
// Response: audio/mpeg stream langsung dari OpenAI

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported voices dari OpenAI TTS API (Hanya suara perempuan/female)
export type TTSVoice = 'nova' | 'shimmer';

const DEFAULT_VOICE: TTSVoice = 'nova'; // Nova: suara perempuan, natural untuk English tutor

export async function POST(request: NextRequest) {
  // Validasi API key tersedia
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-proj-YOUR')) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY belum dikonfigurasi di .env.local' },
      { status: 503 }
    );
  }

  // Parse request body
  let text: string;
  let voice: TTSVoice;

  try {
    const body = await request.json();
    text = body.text?.trim();
    const requestedVoice = body.voice;
    
    // Paksa agar hanya menggunakan suara perempuan (nova atau shimmer)
    voice = (requestedVoice === 'nova' || requestedVoice === 'shimmer') 
      ? requestedVoice 
      : DEFAULT_VOICE;

    if (!text || text.length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // Batasi panjang teks untuk menghindari biaya berlebihan
    if (text.length > 4096) {
      text = text.slice(0, 4096);
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    // Panggil OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',           // tts-1 = standard speed, tts-1-hd = higher quality
        input: text,
        voice,
        response_format: 'mp3',   // mp3 paling kompatibel dengan browser
        speed: 0.95,              // Sedikit lebih lambat untuk pembelajaran
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[TTS] OpenAI API error:', response.status, errorBody);
      return NextResponse.json(
        { error: 'OpenAI TTS request failed', detail: errorBody },
        { status: response.status }
      );
    }

    // Stream audio langsung ke client
    const audioData = await response.arrayBuffer();

    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
        // Cache TTS response — teks yang sama hasilkan audio sama
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('[TTS] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error during TTS generation' },
      { status: 500 }
    );
  }
}

// Reject GET requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
