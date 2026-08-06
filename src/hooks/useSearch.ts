'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { search, SearchResult } from '@/services/searchService';

const RECENT_KEY = 'vlgs_recent_searches';
const MAX_RECENT = 6;
const DEBOUNCE_MS = 350;

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
}

export function useSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(loadRecent());
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const res = search(query);
      setResults(res);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const addToRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
      saveRecent(updated);
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    saveRecent([]);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    addToRecent(trimmed);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, addToRecent, router]);

  const handleSelect = useCallback(
    (term: string, href?: string) => {
      addToRecent(term);
      setQuery(term);
      setOpen(false);
      if (href) {
        router.push(href);
      } else {
        router.push(`/search?q=${encodeURIComponent(term)}`);
      }
    },
    [addToRecent, router]
  );

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setOpen(true);
  }, []);

  const handleFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    query,
    results,
    loading,
    open,
    recentSearches,
    handleChange,
    handleFocus,
    handleClose,
    handleSubmit,
    handleSelect,
    clearRecent,
    setOpen,
  };
}
