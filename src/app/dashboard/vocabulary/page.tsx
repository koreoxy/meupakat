'use client';

import { useState, useEffect, useTransition } from 'react';
import { getMyVocabularies, removeVocabulary, saveVocabulary, searchDictionaryWord } from '@/app/actions/vocabulary';
import type { VocabEntry } from '@/app/actions/vocabulary';
import type { DictionaryEntry } from '@/lib/dictionary';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<'collection' | 'dictionary'>('collection');
  
  // Tab 1: Collection States
  const [words, setWords] = useState<VocabEntry[]>([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Tab 2: Dictionary States
  const [dictSearch, setDictSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [dictResults, setDictResults] = useState<DictionaryEntry[]>([]);
  const [isLoadingDict, setIsLoadingDict] = useState(false);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [bookmarkingWord, setBookmarkingWord] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const { t, language } = useTranslation();

  // Load user vocabulary collection
  useEffect(() => {
    getMyVocabularies().then((data) => {
      setWords(data);
      setIsLoadingCollection(false);
    });
  }, []);

  // Sync dictionary page list based on search query or letter filter
  useEffect(() => {
    if (activeTab === 'dictionary') {
      setIsLoadingDict(true);
      // If we have a query, use search action
      if (dictSearch.trim()) {
        const delayDebounce = setTimeout(() => {
          searchDictionaryWord(dictSearch).then((res) => {
            setDictResults(res.results);
            setIsAiSearch(res.fromAi);
            setIsLoadingDict(false);
          });
        }, 400); // Debounce AI / search lookups
        return () => clearTimeout(delayDebounce);
      } else {
        // If query is empty, load all or filter by letter from static list
        searchDictionaryWord('').then((res) => {
          let list = res.results;
          if (selectedLetter !== 'ALL') {
            list = list.filter((item) => item.word.toLowerCase().startsWith(selectedLetter.toLowerCase()));
          }
          setDictResults(list);
          setIsAiSearch(false);
          setIsLoadingDict(false);
        });
      }
    }
  }, [activeTab, dictSearch, selectedLetter]);

  // Toast helper is now handled by global useToast hook

  // Speaks a word using SpeechSynthesis
  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel ongoing speeches
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add word to user vocabulary from dictionary view
  const handleBookmark = async (entry: DictionaryEntry) => {
    setBookmarkingWord(entry.word);
    try {
      const res = await saveVocabulary({
        word: entry.word,
        phonetic: entry.phonetic,
        partOfSpeech: entry.partOfSpeech,
        definition: `${entry.indonesianWord} - ${entry.definitionId}`,
        example: entry.exampleEn,
      });

      if (res.success) {
        if (res.alreadyExists) {
          showToast(
            language === 'id' ? `"${entry.word}" sudah ada di koleksi Anda.` : `"${entry.word}" is already in your collection.`,
            'info'
          );
        } else {
          showToast(
            language === 'id' ? `Berhasil menyimpan "${entry.word}" ke koleksi!` : `Successfully saved "${entry.word}" to collection!`
          );
          // Reload collection state
          const updated = await getMyVocabularies();
          setWords(updated);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(language === 'id' ? 'Gagal menyimpan kosakata.' : 'Failed to save vocabulary.', 'info');
    } finally {
      setBookmarkingWord(null);
    }
  };

  // Remove word from user collection
  const handleDelete = (id: string, wordText: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await removeVocabulary(id);
      setWords((prev) => prev.filter((w) => w.id !== id));
      setDeletingId(null);
      if (flippedId === id) setFlippedId(null);
      showToast(
        language === 'id' ? `Berhasil menghapus "${wordText}"` : `Successfully removed "${wordText}"`
      );
    });
  };

  // Search filter for Tab 1 (Collection)
  const filteredCollection = words.filter(
    (w) =>
      w.word.toLowerCase().includes(collectionSearch.toLowerCase()) ||
      w.definition.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="px-0 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10 space-y-5 animate-fade-in max-w-5xl mx-auto w-full relative">
      


      {/* ── Header ─────────────────────────────────── */}
      <div className="px-4 sm:px-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-md text-[var(--color-ink)]">
            {language === 'id' ? 'Kamus & Kosakata' : 'Dictionary & Vocabulary'}
          </h1>
          <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
            {activeTab === 'collection'
              ? `${words.length} ${t('vc_subtitle')}`
              : (language === 'id' ? 'Kamus lengkap A-Z bahasa Inggris-Indonesia & AI Translator' : 'Complete A-Z English-Indonesian dictionary & AI Translator')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--color-surface-soft)] p-1 rounded-lg border border-[var(--color-hairline)] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('collection')}
            className={cn(
              "px-4 py-1.5 rounded-md text-[12px] font-bold transition-all flex items-center gap-1.5",
              activeTab === 'collection'
                ? "bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            📂 {language === 'id' ? 'Koleksi Saya' : 'My Collection'}
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={cn(
              "px-4 py-1.5 rounded-md text-[12px] font-bold transition-all flex items-center gap-1.5",
              activeTab === 'dictionary'
                ? "bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            📖 Kamus A-Z
          </button>
        </div>
      </div>

      {/* ── TAB 1: COLLECTION VIEW ─────────────────── */}
      {activeTab === 'collection' && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="px-4 sm:px-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] text-sm">🔍</span>
              <input
                type="text"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                placeholder={t('vc_search')}
                className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all outline-none"
                style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-hairline)',
                  color: 'var(--color-ink)',
                }}
              />
            </div>
          </div>

          {/* Flash Cards Grid */}
          {isLoadingCollection ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : filteredCollection.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-[48px] mb-4">📭</p>
              <p className="text-[16px] font-semibold text-[var(--color-ink)]">
                {collectionSearch ? (language === 'id' ? 'Tidak ada kata yang cocok' : 'No words match your search') : t('vc_empty')}
              </p>
              <p className="text-[13px] text-[var(--color-ink-muted)] mt-2 max-w-xs mx-auto">
                {collectionSearch
                  ? (language === 'id' ? 'Coba cari kata kunci lain.' : 'Try a different search term.')
                  : t('vc_empty_desc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-0">
              {filteredCollection.map((w, i) => {
                const isFlipped = flippedId === w.id;
                return (
                  <div
                    key={w.id}
                    className="relative animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.04}s`, perspective: '800px', height: '140px' }}
                    onClick={() => setFlippedId(isFlipped ? null : w.id)}
                  >
                    <div
                      className="w-full h-full cursor-pointer"
                      style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        position: 'relative',
                      }}
                    >
                      {/* Front — Word */}
                      <div
                        className="absolute inset-0 rounded-[var(--radius-xl)] flex flex-col items-center justify-center p-4"
                        style={{
                          backfaceVisibility: 'hidden',
                          background: 'var(--color-surface-card)',
                          border: '1px solid var(--color-hairline)',
                        }}
                      >
                        <button
                          onClick={(e) => handleSpeak(e, w.word)}
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[var(--color-surface-active)] hover:bg-[var(--color-hairline)] flex items-center justify-center text-xs transition-colors"
                          title="Dengarkan pengucapan"
                        >
                          🔊
                        </button>
                        <p className="text-[20px] font-black text-[var(--color-ink)] text-center capitalize leading-tight px-3">
                          {w.word}
                        </p>
                        {w.phonetic && (
                          <p className="text-[11px] text-[var(--color-ink-muted)] font-mono mt-1">{w.phonetic}</p>
                        )}
                        {w.partOfSpeech && (
                          <span
                            className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(58,134,255,0.15)', color: 'var(--color-primary)' }}
                          >
                            {w.partOfSpeech}
                          </span>
                        )}
                        <p className="text-[10px] text-[var(--color-ink-muted)] mt-2.5">{t('vc_tap_reveal')}</p>
                      </div>

                      {/* Back — Definition */}
                      <div
                        className="absolute inset-0 rounded-[var(--radius-xl)] flex flex-col justify-between p-4"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          background: 'linear-gradient(135deg, rgba(58,134,255,0.12) 0%, var(--color-surface-card) 100%)',
                          border: '1px solid rgba(58,134,255,0.2)',
                        }}
                      >
                        <p className="text-[12px] text-[var(--color-ink)] leading-snug flex-1 overflow-y-auto pr-1">
                          {w.definition}
                        </p>
                        {w.example && (
                          <p className="text-[10.5px] italic text-[var(--color-ink-muted)] leading-tight mt-1 border-t border-[var(--color-hairline)] pt-1 truncate">
                            Ex: "{w.example}"
                          </p>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(w.id, w.word); }}
                          disabled={deletingId === w.id}
                          className="mt-2 text-[10px] text-[var(--color-error)] hover:opacity-80 transition-opacity font-semibold self-end"
                        >
                          {deletingId === w.id ? '...' : `🗑 ${t('vc_remove')}`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats bar */}
          {!isLoadingCollection && words.length > 0 && (
            <div
              className="mx-4 sm:mx-0 p-4 rounded-[var(--radius-xl)] flex items-center gap-4"
              style={{
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-hairline)',
              }}
            >
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                  {words.length} {language === 'id' ? 'kata dalam koleksi Anda' : 'words in your collection'}
                </p>
                <p className="text-[12px] text-[var(--color-ink-muted)]">
                  {language === 'id'
                    ? 'Terus tingkatkan! Penelitian menunjukkan 3.000+ kata = kelancaran berbicara.'
                    : 'Keep expanding! Research shows 3,000+ words = conversational fluency.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DICTIONARY VIEW ─────────────────── */}
      {activeTab === 'dictionary' && (
        <div className="space-y-5">
          {/* A-Z Letter Filter Bar */}
          <div className="px-4 sm:px-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 custom-scrollbar">
              <button
                onClick={() => { setSelectedLetter('ALL'); setDictSearch(''); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0",
                  selectedLetter === 'ALL' && !dictSearch
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-card)] text-[var(--color-ink-secondary)] border border-[var(--color-hairline)] hover:bg-[var(--color-surface-active)]"
                )}
              >
                {language === 'id' ? 'Semua' : 'All'}
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => { setSelectedLetter(letter); setDictSearch(''); }}
                  className={cn(
                    "w-8 h-8 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center justify-center",
                    selectedLetter === letter && !dictSearch
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-card)] text-[var(--color-ink-secondary)] border border-[var(--color-hairline)] hover:bg-[var(--color-surface-active)]"
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 sm:px-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] text-sm">🔍</span>
              <input
                type="text"
                value={dictSearch}
                onChange={(e) => { setDictSearch(e.target.value); setSelectedLetter('ALL'); }}
                placeholder={language === 'id' ? 'Cari kata Inggris atau Indonesia...' : 'Search English or Indonesian words...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all outline-none"
                style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-hairline)',
                  color: 'var(--color-ink)',
                }}
              />
            </div>
          </div>

          {/* Results Area */}
          {isLoadingDict ? (
            <div className="space-y-4 px-4 sm:px-0">
              <div className="p-8 rounded-[var(--radius-xl)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mb-4" />
                <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                  {dictSearch.trim() ? (language === 'id' ? 'Mencari di kamus...' : 'Searching dictionary...') : (language === 'id' ? 'Memuat kamus...' : 'Loading dictionary...')}
                </p>
                {dictSearch.trim() && (
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                    {language === 'id' ? 'Mencari di database lokal & menyiapkan penerjemah AI...' : 'Searching local database & preparing AI translator...'}
                  </p>
                )}
              </div>
            </div>
          ) : dictResults.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[var(--color-surface-card)] rounded-[var(--radius-xl)] border border-[var(--color-hairline)] mx-4 sm:mx-0">
              <p className="text-[48px] mb-4">📖</p>
              <p className="text-[16px] font-semibold text-[var(--color-ink)]">
                {language === 'id' ? 'Kata tidak ditemukan di database offline' : 'Word not found in offline database'}
              </p>
              <p className="text-[13px] text-[var(--color-ink-muted)] mt-2 max-w-sm mx-auto">
                {language === 'id'
                  ? `Kata "${dictSearch}" tidak ada di modul bawaan A-Z. Silakan tekan tombol di bawah untuk mencari dan menerjemahkannya secara cerdas dengan AI Translator.`
                  : `The word "${dictSearch}" is not in our offline database. Tap below to translate and define it dynamically with our AI Translator.`}
              </p>
              {dictSearch.trim() && (
                <div className="mt-5 flex justify-center">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setIsLoadingDict(true);
                      // This forces a re-trigger, the hook handles Groq AI lookup automatically since it searches
                      searchDictionaryWord(dictSearch).then((res) => {
                        setDictResults(res.results);
                        setIsAiSearch(res.fromAi);
                        setIsLoadingDict(false);
                        if (res.results.length === 0) {
                          showToast(language === 'id' ? 'AI tidak dapat mendefinisikan kata tersebut.' : 'AI could not define that word.', 'info');
                        }
                      });
                    }}
                  >
                    🤖 Terjemahkan dengan AI
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 px-4 sm:px-0">
              {isAiSearch && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[var(--radius-lg)] p-3 flex items-center gap-2.5">
                  <span className="text-base">✨</span>
                  <p className="text-[12px] text-indigo-700 dark:text-indigo-300 font-semibold">
                    {language === 'id'
                      ? 'Hasil terjemahan di bawah dihasilkan secara dinamis menggunakan AI Kamus Ace!'
                      : 'The translation below was dynamically compiled using Ace AI Dictionary!'}
                  </p>
                </div>
              )}

              {/* Dictionary List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dictResults.map((entry) => {
                  const alreadySaved = words.some((w) => w.word.toLowerCase() === entry.word.toLowerCase());
                  return (
                    <div
                      key={entry.word}
                      className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] hover:shadow-md transition-all flex flex-col justify-between gap-4 animate-fade-in-up"
                    >
                      <div>
                        {/* Word Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[20px] font-black text-[var(--color-ink)] capitalize leading-tight">
                              {entry.word}
                            </h3>
                            <button
                              onClick={(e) => handleSpeak(e, entry.word)}
                              className="w-6 h-6 rounded-full bg-[var(--color-surface-active)] hover:bg-[var(--color-hairline)] flex items-center justify-center text-xs transition-colors shrink-0"
                              title="Dengarkan pengucapan"
                            >
                              🔊
                            </button>
                            <span className="text-[11px] font-mono text-[var(--color-ink-muted)] shrink-0">
                              {entry.phonetic}
                            </span>
                          </div>

                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                            style={{
                              background: entry.partOfSpeech.includes('verb')
                                ? 'rgba(58,134,255,0.15)'
                                : entry.partOfSpeech.includes('noun')
                                ? 'rgba(16,185,129,0.15)'
                                : 'rgba(245,158,11,0.15)',
                              color: entry.partOfSpeech.includes('verb')
                                ? 'var(--color-primary)'
                                : entry.partOfSpeech.includes('noun')
                                ? '#10b981'
                                : '#f59e0b',
                            }}
                          >
                            {entry.partOfSpeech}
                          </span>
                        </div>

                        {/* Translation / Equivalents */}
                        <div className="mt-3.5 space-y-2">
                          <div>
                            <p className="text-[11px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                              🇮🇩 {language === 'id' ? 'Terjemahan' : 'Indonesian Translation'}
                            </p>
                            <p className="text-[14px] font-extrabold text-[var(--color-ink)] capitalize mt-0.5">
                              {entry.indonesianWord}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                              💡 {language === 'id' ? 'Definisi' : 'Definition'}
                            </p>
                            <p className="text-[12.5px] text-[var(--color-ink-secondary)] leading-relaxed mt-0.5">
                              <span className="font-semibold text-[var(--color-ink)]">ID:</span> {entry.definitionId}
                            </p>
                            <p className="text-[12.5px] text-[var(--color-ink-secondary)] leading-relaxed mt-0.5">
                              <span className="font-semibold text-[var(--color-ink)]">EN:</span> {entry.definitionEn}
                            </p>
                          </div>

                          {/* Examples */}
                          {(entry.exampleEn || entry.exampleId) && (
                            <div className="mt-3 pt-2 border-t border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-2.5 rounded-lg">
                              <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                                💬 {language === 'id' ? 'Contoh Kalimat' : 'Example Sentences'}
                              </p>
                              {entry.exampleEn && (
                                <p className="text-[11.5px] italic text-[var(--color-ink)] font-medium">
                                  "{entry.exampleEn}"
                                </p>
                              )}
                              {entry.exampleId && (
                                <p className="text-[11.5px] italic text-[var(--color-ink-muted)] mt-0.5">
                                  ({entry.exampleId})
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bookmark button */}
                      <div className="mt-3 flex justify-end">
                        {alreadySaved ? (
                          <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                            <span>✓</span> {language === 'id' ? 'Tersimpan' : 'Saved'}
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={bookmarkingWord === entry.word}
                            onClick={() => handleBookmark(entry)}
                            className="text-[11px] font-bold flex items-center gap-1"
                          >
                            ⭐ {language === 'id' ? 'Simpan ke Koleksi' : 'Save to Collection'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
