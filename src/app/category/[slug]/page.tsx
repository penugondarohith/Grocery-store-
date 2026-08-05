"use client";

import { useState, useMemo, use } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/ui/ProductCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { getProductsByCategory } from "@/data/products";
import { getCategoryBySlug } from "@/data/categories";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Best Discount" },
];

const BRANDS_MAP: Record<string, string[]> = {
  groceries: ["India Gate", "Fortune", "Aashirvaad", "Tata"],
  "vijaya-milk-products": ["Vijaya"],
  snacks: ["Lays", "Kurkure", "Haldiram's", "Bingo"],
  "cool-drinks": ["Coca-Cola", "Sprite", "Tropicana", "Pepsi"],
};

const PAGE_SIZE = 8;

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = getCategoryBySlug(slug);
  const allProducts = getProductsByCategory(slug);

  const [sort, setSort] = useState("relevance");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = BRANDS_MAP[slug] ?? [];

  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (inStockOnly && !p.inStock) return false;
      if (minDiscount > 0 && p.discount < minDiscount) return false;
      return true;
    });

    switch (sort) {
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "discount": list = [...list].sort((a, b) => b.discount - a.discount); break;
    }
    return list;
  }, [allProducts, search, priceRange, selectedBrands, inStockOnly, minDiscount, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setSelectedBrands([]); setInStockOnly(false);
    setMinDiscount(0); setPriceRange([0, 500]); setPage(1);
  };

  if (!category && allProducts.length === 0) return notFound();

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price range */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Price Range</h3>
        <div className="space-y-2">
          {[[0, 100], [100, 250], [250, 500], [500, 9999]].map(([min, max]) => (
            <label key={`${min}-${max}`} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="price" className="accent-green-600"
                checked={priceRange[0] === min && priceRange[1] === max}
                onChange={() => { setPriceRange([min, max]); setPage(1); }}
              />
              <span className="text-sm text-gray-600">
                {min === 0 ? "Under" : `₹${min} –`} {max === 9999 ? "₹500+" : `₹${max}`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Brand</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-green-600 w-4 h-4"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                />
                <span className="text-sm text-gray-600">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Min Discount */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Minimum Discount</h3>
        <div className="space-y-2">
          {[0, 10, 15, 20].map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="discount" className="accent-green-600"
                checked={minDiscount === d}
                onChange={() => { setMinDiscount(d); setPage(1); }}
              />
              <span className="text-sm text-gray-600">{d === 0 ? "All" : `${d}% & above`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="accent-green-600 w-4 h-4"
            checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
          />
          <span className="text-sm font-semibold text-gray-700">In Stock Only</span>
        </label>
      </div>

      <button onClick={clearFilters} className="w-full py-2 border border-gray-300 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: category?.name ?? slug }]} />

      {/* Category Banner */}
      {category && (
        <div className={`mt-4 rounded-2xl bg-gradient-to-r ${category.color} p-6 flex items-center justify-between overflow-hidden relative`}>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Category</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{category.name}</h1>
            <p className="text-white/80 text-sm mt-1">{category.description}</p>
            <p className="text-white font-semibold mt-2 text-sm">{category.productCount}+ products</p>
          </div>
          <div className="text-7xl opacity-40 select-none hidden sm:block">{category.icon}</div>
        </div>
      )}

      <div className="flex gap-6 mt-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h2>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Top bar: search + sort + mobile filter toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search in ${category?.name ?? "category"}...`}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          {/* Mobile filter panel */}
          {filtersOpen && (
            <div className="lg:hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <div className="flex justify-between mb-4">
                <h2 className="font-bold text-gray-900">Filters</h2>
                <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <FilterPanel />
            </div>
          )}

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> results
          </p>

          {/* Product grid */}
          {paginated.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 font-medium">No products found</p>
              <button onClick={clearFilters} className="mt-4 text-green-600 font-semibold text-sm underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                    page === i + 1
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
