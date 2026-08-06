'use client';

import { useRef, KeyboardEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import SearchDropdown from './SearchDropdown';

export default function SearchBar() {
  const {
    query, results, loading, open, recentSearches,
    handleChange, handleFocus, handleClose, handleSubmit, handleSelect, clearRecent,
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
    query.trim().length >= 1 || recentSearches.length > 0
  );

  return (
    <div className="relative w-full">
      {/* Search input — full width, prominent */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none z-10" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={onKeyDown}
          placeholder="Search for Products, Brands and More"
          className="w-full h-11 pl-11 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all duration-200"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          role="combobox"
          autoComplete="off"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { handleChange(''); inputRef.current?.focus(); }}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
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
