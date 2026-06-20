'use server';
// src/app/actions/vocabulary.ts
// Server Actions untuk manajemen kosakata user yang di-bookmark

import { db } from '@/db';
import { userVocabularies } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentAuthUser } from './auth';
import { revalidatePath } from 'next/cache';

export interface VocabEntry {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  createdAt: string;
}

// ─── Simpan Kosakata ──────────────────────────────────────────────────────────

export async function saveVocabulary(entry: {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
}): Promise<{ success: boolean; error?: string; alreadyExists?: boolean }> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return { success: false, error: 'Not authenticated.' };

  // Cek apakah kata sudah ada
  const existing = await db
    .select({ id: userVocabularies.id })
    .from(userVocabularies)
    .where(
      and(
        eq(userVocabularies.userId, authUser.id),
        eq(userVocabularies.word, entry.word.toLowerCase())
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: true, alreadyExists: true };
  }

  await db.insert(userVocabularies).values({
    userId: authUser.id,
    word: entry.word.toLowerCase(),
    phonetic: entry.phonetic ?? null,
    partOfSpeech: entry.partOfSpeech ?? null,
    definition: entry.definition,
    example: entry.example ?? null,
  });

  revalidatePath('/dashboard/vocabulary');
  return { success: true };
}

// ─── Ambil Semua Kosakata User ────────────────────────────────────────────────

export async function getMyVocabularies(): Promise<VocabEntry[]> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return [];

  const rows = await db
    .select()
    .from(userVocabularies)
    .where(eq(userVocabularies.userId, authUser.id))
    .orderBy(userVocabularies.createdAt);

  return rows.map((r) => ({
    id: r.id,
    word: r.word,
    phonetic: r.phonetic ?? '',
    partOfSpeech: r.partOfSpeech ?? 'word',
    definition: r.definition,
    example: r.example ?? '',
    createdAt: r.createdAt.toISOString(),
  }));
}

// ─── Hapus Kosakata ───────────────────────────────────────────────────────────

export async function removeVocabulary(id: string): Promise<{ success: boolean }> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return { success: false };

  await db
    .delete(userVocabularies)
    .where(
      and(eq(userVocabularies.id, id), eq(userVocabularies.userId, authUser.id))
    );

  revalidatePath('/dashboard/vocabulary');
  return { success: true };
}

// ─── Kamus / Dictionary Search ────────────────────────────────────────────────
import { offlineDictionary } from '@/lib/dictionary';
import type { DictionaryEntry } from '@/lib/dictionary';
import OpenAI from 'openai';

// Helper to robustly parse JSON from AI response
function parseRobustJson(text: string): any {
  const cleanedText = text.trim();
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
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

export async function searchDictionaryWord(query: string): Promise<{
  results: DictionaryEntry[];
  fromAi: boolean;
  error?: string;
}> {
  const trimmed = query.trim().toLowerCase();

  // If query is empty, return a default list from A-Z (e.g. one word per letter to show A-Z preview)
  if (!trimmed) {
    // Collect one word for each letter from A to Z that exists in our offline dictionary
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const defaultList: DictionaryEntry[] = [];
    for (const letter of alphabet) {
      const match = offlineDictionary.find((entry) => entry.word.startsWith(letter));
      if (match) {
        defaultList.push(match);
      }
    }
    return { results: defaultList.slice(0, 26), fromAi: false };
  }

  // 1. Search in offline dictionary
  const offlineMatches = offlineDictionary.filter(
    (entry) =>
      entry.word.toLowerCase() === trimmed ||
      entry.indonesianWord.toLowerCase() === trimmed ||
      entry.word.toLowerCase().includes(trimmed) ||
      entry.indonesianWord.toLowerCase().includes(trimmed)
  );

  // If exact or strong matches are found offline, return them
  const exactMatch = offlineMatches.find(
    (entry) => entry.word.toLowerCase() === trimmed || entry.indonesianWord.toLowerCase() === trimmed
  );

  if (exactMatch) {
    // Put the exact match first
    const sorted = [exactMatch, ...offlineMatches.filter((m) => m !== exactMatch)];
    return { results: sorted.slice(0, 10), fromAi: false };
  }

  if (offlineMatches.length >= 2) {
    return { results: offlineMatches.slice(0, 10), fromAi: false };
  }

  // 2. If no offline matches, or only partial matches, and AI key is configured, perform AI dictionary lookup
  if (process.env.GROQ_API_KEY) {
    try {
      const client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const systemPrompt = `You are a professional bilingual English-Indonesian dictionary database.
Your task is to translate and define the word provided by the user.
The word may be in English OR Indonesian.
1. If the input is in English, find its Indonesian equivalent and translate/define it.
2. If the input is in Indonesian, find its English equivalent and translate/define it.
You MUST output your response strictly as a JSON object with the following keys:
- "word": The English word (lowercase)
- "indonesianWord": The Indonesian equivalent word (lowercase)
- "phonetic": The IPA phonetic spelling of the English word (e.g. "/əˈbaʊt/")
- "partOfSpeech": The grammatical category (e.g. "noun", "verb", "adjective", "adverb", "preposition")
- "definitionEn": The English definition of the word (concise, clear)
- "definitionId": The Indonesian translation of the definition (concise, clear)
- "exampleEn": A natural English sentence showing the word's usage
- "exampleId": The Indonesian translation of that example sentence

Do not output any markdown formatting, preamble, or notes. Output ONLY a valid JSON object.`;

      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Word to define: "${trimmed}"` }
        ],
        temperature: 0.2, // Low temperature for factual definitions
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '';
      const parsed = parseRobustJson(content);

      if (parsed && parsed.word && parsed.indonesianWord) {
        const aiEntry: DictionaryEntry = {
          word: parsed.word,
          indonesianWord: parsed.indonesianWord,
          phonetic: parsed.phonetic || '',
          partOfSpeech: parsed.partOfSpeech || 'word',
          definitionEn: parsed.definitionEn || '',
          definitionId: parsed.definitionId || '',
          exampleEn: parsed.exampleEn || '',
          exampleId: parsed.exampleId || '',
        };

        // Combine with any partial offline matches
        const combined = [aiEntry, ...offlineMatches.filter(m => m.word.toLowerCase() !== aiEntry.word.toLowerCase())];
        return { results: combined, fromAi: true };
      }
    } catch (aiError) {
      console.error('AI Dictionary Lookup Error:', aiError);
    }
  }

  // 3. Fallback to Free Dictionary API & MyMemory API
  const freeApiEntry = await fetchFreeDictionaryEntry(trimmed);
  if (freeApiEntry) {
    const combined = [freeApiEntry, ...offlineMatches.filter(m => m.word.toLowerCase() !== freeApiEntry.word.toLowerCase())];
    return { results: combined, fromAi: true };
  }

  // Fallback to offline matches if both AI and free API fail or are missing
  return { results: offlineMatches, fromAi: false };
}

// ─── Free API Dictionary Fallback Helper ──────────────────────────────────────
async function fetchFreeDictionaryEntry(query: string): Promise<DictionaryEntry | null> {
  const trimmed = query.trim().toLowerCase();
  try {
    // 1. Translate from ID to EN first to see if input is Indonesian
    const myMemoryUrlIdToEn = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=id|en`;
    const resTranslation = await fetch(myMemoryUrlIdToEn);
    const dataTranslation = await resTranslation.json();
    let englishWord = dataTranslation.responseData?.translatedText?.toLowerCase() || trimmed;
    
    if (englishWord) {
      englishWord = englishWord.replace(/["']/g, '').trim();
    } else {
      englishWord = trimmed;
    }

    // 2. Fetch details from Free Dictionary API using the English word
    let dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(englishWord)}`);
    let dictData;
    if (dictRes.ok) {
      dictData = await dictRes.json();
    } else {
      // If lookup failed, try looking up original query directly
      dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`);
      if (dictRes.ok) {
        dictData = await dictRes.json();
        englishWord = trimmed;
      }
    }

    if (!dictData || !dictData[0]) {
      return null;
    }

    const entryData = dictData[0];
    const phonetic = entryData.phonetic || (entryData.phonetics?.[0]?.text) || '';
    const meaning = entryData.meanings?.[0];
    const partOfSpeech = meaning?.partOfSpeech || 'word';
    const definitionEn = meaning?.definitions?.[0]?.definition || '';
    const exampleEn = meaning?.definitions?.[0]?.example || '';

    // 3. Translate the English word back to Indonesian
    const myMemoryUrlEnToId = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishWord)}&langpair=en|id`;
    const resIndoWord = await fetch(myMemoryUrlEnToId);
    const dataIndoWord = await resIndoWord.json();
    let indonesianWord = dataIndoWord.responseData?.translatedText?.toLowerCase() || trimmed;
    if (indonesianWord) {
      indonesianWord = indonesianWord.replace(/["']/g, '').trim();
    }

    // 4. Translate English definition to Indonesian
    let definitionId = '';
    if (definitionEn) {
      const resDefId = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(definitionEn)}&langpair=en|id`);
      const dataDefId = await resDefId.json();
      definitionId = dataDefId.responseData?.translatedText || '';
    }

    // 5. Translate English example to Indonesian
    let exampleId = '';
    if (exampleEn) {
      const resExId = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(exampleEn)}&langpair=en|id`);
      const dataExId = await resExId.json();
      exampleId = dataExId.responseData?.translatedText || '';
    }

    return {
      word: englishWord,
      indonesianWord: indonesianWord,
      phonetic: phonetic,
      partOfSpeech: partOfSpeech,
      definitionEn: definitionEn,
      definitionId: definitionId,
      exampleEn: exampleEn,
      exampleId: exampleId,
    };
  } catch (err) {
    console.error('Free dictionary fallback error:', err);
    return null;
  }
}

