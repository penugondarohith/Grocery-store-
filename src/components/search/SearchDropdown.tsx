'use client';

import { useRef, useEffect, KeyboardEvent, Fragment } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, TrendingUp, Tag, Package, ChevronRight } from 'lucide-react';
import { SearchResult, highlightText } from '@/services/searchService';
import { formatPrice } from '@/lib/utils';

interface Props {
  query: string;
  results: SearchResult | null;
  loading: boolean;
  recentSearches: string[];
  onSelect: (term: string, href?: string) => void;
  onClearRecent: () => void;
  onClose: () => void;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const parts = highlightText(text, query).split('|||');
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase().trim() ? (
          <mark key={i} className="bg-green-100 text-green-800 rounded-sm px-0.5 not-italic font-semibold">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </span>
  );
}

export default function SearchDropdown({
  query, results, loading, recentSearches, onSelect, onClearRecent, onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const hasResults = results && results.total > 0;
  const showRecent = !query.trim() && recentSearches.length > 0;
  const showNoResults = query.trim().length >= 2 && !loading && results && results.total === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[520px] overflow-y-auto"
    >
      {/* Loading */}
      {loading && (
        <div className="px-5 py-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-center animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent searches */}
      {!loading && showRecent && (
        <div className="p-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Recent
            </span>
            <button onClick={onClearRecent} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
              Clear all
            </button>
          </div>
          {recentSearches.map((s) => (
            <button
              key={s}
              onClick={() => onSelect(s)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left group"
            >
              <Clock className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
              <span className="text-sm text-gray-700">{s}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="p-3 space-y-1">
          {/* Products */}
          {results.products.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Products
              </p>
              {results.products.slice(0, 5).map(({ product }) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product.name, `/product/${product.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group text-left"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      <HighlightedText text={product.name} query={query} />
                    </p>
                    <p className="text-xs text-gray-400">
                      <HighlightedText text={product.brand} query={query} />
                      {' · '}{product.weight}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-700">{formatPrice(product.price)}</p>
                    {product.discount > 0 && (
                      <p className="text-xs text-orange-500 font-medium">{product.discount}% off</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Categories
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {results.categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => onSelect(c.name, `/category/${c.slug}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-700 border border-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                  >
                    <span>{c.icon}</span>
                    <HighlightedText text={c.name} query={query} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {results.brands.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Brands
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {results.brands.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => onSelect(b.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full text-sm font-medium text-blue-700 transition-colors"
                  >
                    <HighlightedText text={b.name} query={query} />
                    <span className="text-blue-400 text-xs">({b.productCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View all results */}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <button
              onClick={() => onSelect(query)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 rounded-xl transition-colors"
            >
              See all results for &ldquo;{query}&rdquo; <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && showNoResults && (
        <div className="py-10 text-center px-4">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-semibold text-gray-700">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories</p>
        </div>
      )}

      {/* Prompt to type more */}
      {!loading && !hasResults && !showRecent && !showNoResults && query.trim().length > 0 && query.trim().length < 2 && (
        <div className="py-6 text-center">
          <p className="text-xs text-gray-400">Type at least 2 characters to search…</p>
        </div>
      )}
    </motion.div>
  );
}
