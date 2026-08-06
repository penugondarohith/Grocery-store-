'use client';

import { useRef, KeyboardEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import SearchDropdown from './SearchDropdown';

export default function SearchBar() {
  const {
    query, results, loading, open, recentSearches,
    handleChange, handleFocus, handleClose, handleSubmit, handleSelect, clearRecent, setOpen,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      handleClose();
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && (
    query.trim().length >= 1 ||
    recentSearches.length > 0
  );

  return (
    <div className="flex-1 relative max-w-xl">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={onKeyDown}
          placeholder="Search groceries, brands, categories..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          role="combobox"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { handleChange(''); inputRef.current?.focus(); }}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <SearchDropdown
            query={query}
            results={results}
            loading={loading}
            recentSearches={recentSearches}
            onSelect={handleSelect}
            onClearRecent={clearRecent}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
