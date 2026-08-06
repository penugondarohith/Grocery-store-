'use client';

import { useRef, KeyboardEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import SearchDropdown from './SearchDropdown';

export default function SearchBar() {
  const {
    query, results, loading, open, recentSearches,
    handleChange, handleFocus, handleClose, handleSubmit, handleSelect, clearRecent, setOpen,
  } = useSearch();

  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFocus = () => {
    setFocused(true);
    handleFocus();
  };

  const onBlur = () => {
    // Small delay so dropdown click still fires first
    setTimeout(() => setFocused(false), 200);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      handleClose();
      inputRef.current?.blur();
      setFocused(false);
    }
  };

  const handleClear = () => {
    handleChange('');
    inputRef.current?.focus();
  };

  const showDropdown = open && (
    query.trim().length >= 1 || recentSearches.length > 0
  );

  return (
    <motion.div
      className="relative"
      animate={{
        flexGrow: focused ? 2 : 1,
        maxWidth: focused ? '680px' : '480px',
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ minWidth: 0 }}
    >
      {/* Input wrapper */}
      <motion.div
        className="relative flex items-center"
        animate={{
          boxShadow: focused
            ? '0 0 0 3px rgba(22,163,74,0.18), 0 4px 20px rgba(0,0,0,0.08)'
            : '0 0 0 0px transparent',
        }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: '12px' }}
      >
        <Search
          className={`absolute left-3 w-4 h-4 pointer-events-none z-10 transition-colors duration-200 ${
            focused ? 'text-green-600' : 'text-gray-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder="Search groceries, brands, categories..."
          className="w-full pl-9 pr-20 py-2.5 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white border-gray-200 focus:border-green-400"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          role="combobox"
          autoComplete="off"
        />

        {/* Right-side buttons */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Search submit button (visible on focus) */}
          <AnimatePresence>
            {focused && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleSubmit}
                className="flex items-center gap-1 pl-2 pr-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors overflow-hidden whitespace-nowrap"
                aria-label="Search"
              >
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Search</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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
    </motion.div>
  );
}
