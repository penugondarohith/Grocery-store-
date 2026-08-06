'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { search, SearchResult } from '@/services/searchService';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Best Discount' },
  { value: 'newest', label: 'Newest' },
];

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [sort, setSort] = useState('relevance');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(search(q));
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  const sortedProducts = useMemo(() => {
    if (!results) return [];
    let list = results.products.map((m) => m.product);
    switch (sort) {
      case 'price_asc': return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating': return [...list].sort((a, b) => b.rating - a.rating);
      case 'discount': return [...list].sort((a, b) => b.discount - a.discount);
      default: return list;
    }
  }, [results, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Search</span>
        </div>
        {q ? (
          <h1 className="text-2xl font-bold text-gray-900">
            Results for &ldquo;<span className="text-green-600">{q}</span>&rdquo;
            {!loading && results && (
              <span className="text-base font-normal text-gray-400 ml-2">
                {results.total} results
              </span>
            )}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">Search Products</h1>
        )}
      </div>

      {/* No query state */}
      {!q && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-green-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">What are you looking for?</p>
          <p className="text-gray-400 text-sm mt-1">Use the search bar above to find products</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Results */}
      {!loading && results && q && (
        <>
          {/* Category + Brand chips */}
          {(results.categories.length > 0 || results.brands.length > 0) && (
            <div className="mb-6 space-y-3">
              {results.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Categories:</span>
                  {results.categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full text-sm font-medium text-green-700 transition-colors"
                    >
                      {c.icon} {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {results.brands.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Brands:</span>
                  {results.brands.map((b) => (
                    <span
                      key={b.name}
                      className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700"
                    >
                      {b.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sort + count bar */}
          {sortedProducts.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-800">{sortedProducts.length}</span> products
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                No products found for &ldquo;{q}&rdquo;
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Try checking the spelling or use more general terms
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors"
                >
                  Browse All Products
                </Link>
                <Link
                  href="/category/groceries"
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  Shop Groceries
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    }>
      <SearchResultsInner />
    </Suspense>
  );
}
