'use server';
// src/app/actions/materials.ts
// Server Actions untuk mengambil data Speaking Materials

import { db } from '@/db';
import { speakingMaterials } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentAuthUser } from './auth';
import type { DbSpeakingMaterial } from '@/db/schema';

import { format } from 'date-fns';

export type SpeakingMaterialCategory = 'quote' | 'movie_script' | 'song_lyrics';

/**
 * Mengambil materi latihan berbicara berdasarkan kategori (type).
 * Menyajikan 5 kartu yang dirotasi secara deterministik setiap harinya.
 */
export async function getSpeakingMaterials(
  type: SpeakingMaterialCategory
): Promise<DbSpeakingMaterial[]> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    throw new Error('Not authenticated.');
  }

  try {
    const results = await db
      .select()
      .from(speakingMaterials)
      .where(eq(speakingMaterials.type, type));

    if (results.length <= 5) {
      return results;
    }

    // Buat seed deterministik berdasarkan tanggal hari ini
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) {
      seed = (seed << 5) - seed + todayStr.charCodeAt(i);
      seed |= 0;
    }

    // LCG (Linear Congruential Generator) helper
    let state = Math.abs(seed || 1);
    const nextRandom = () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };

    // Lakukan shuffle deterministik
    const shuffled = results
      .map((item) => ({ item, rand: nextRandom() }))
      .sort((a, b) => a.rand - b.rand)
      .map((x) => x.item);

    return shuffled.slice(0, 5);
  } catch (err) {
    console.error('Gagal mengambil data materi speaking:', err);
    return [];
  }
}

