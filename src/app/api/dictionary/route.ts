// src/app/api/dictionary/route.ts
// Free Dictionary API proxy + cache
// Request:  GET /api/dictionary?word=comfortable
// Response: { word, phonetic, partOfSpeech, definition, example }

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

// In-memory cache to avoid repeated calls for the same word
const dictCache = new Map<string, DictionaryEntry>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')?.trim().toLowerCase();

  if (!word || word.length === 0) {
    return NextResponse.json({ error: 'word parameter is required' }, { status: 400 });
  }

  // Check cache first
  if (dictCache.has(word)) {
    return NextResponse.json(dictCache.get(word));
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { next: { revalidate: 86400 } } // cache for 24h at CDN level
    );

    if (!res.ok) {
      // Word not found — return minimal fallback
      const fallback: DictionaryEntry = {
        word,
        phonetic: '',
        partOfSpeech: 'word',
        definition: `No definition found for "${word}".`,
        example: '',
      };
      return NextResponse.json(fallback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json();
    const entry = data[0];

    // Extract first available meaning
    const meaning = entry?.meanings?.[0];
    const def = meaning?.definitions?.[0];

    const result: DictionaryEntry = {
      word: entry?.word ?? word,
      phonetic: entry?.phonetic ?? entry?.phonetics?.[0]?.text ?? '',
      partOfSpeech: meaning?.partOfSpeech ?? 'word',
      definition: def?.definition ?? 'No definition available.',
      example: def?.example ?? '',
    };

    // Store in local cache (max 200 entries — LRU style)
    if (dictCache.size >= 200) {
      const firstKey = dictCache.keys().next().value;
      if (firstKey) dictCache.delete(firstKey);
    }
    dictCache.set(word, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Dictionary] Fetch error:', error);
    const fallback: DictionaryEntry = {
      word,
      phonetic: '',
      partOfSpeech: 'word',
      definition: 'Could not load definition. Check your connection.',
      example: '',
    };
    return NextResponse.json(fallback);
  }
}
