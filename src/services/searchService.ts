import { products, Product } from '@/data/products';
import { categories } from '@/data/categories';

export interface SearchResult {
  products: ProductMatch[];
  categories: CategoryMatch[];
  brands: BrandMatch[];
  total: number;
}

export interface ProductMatch {
  product: Product;
  highlights: { field: string; value: string }[];
  score: number;
}

export interface CategoryMatch {
  name: string;
  slug: string;
  icon: string;
}

export interface BrandMatch {
  name: string;
  productCount: number;
}

function highlight(text: string, query: string): string {
  // Returns text with match positions (used for scoring)
  return text.toLowerCase().includes(query.toLowerCase()) ? text : '';
}

function scoreProduct(product: Product, query: string): number {
  const q = query.toLowerCase().trim();
  let score = 0;

  if (product.name.toLowerCase().startsWith(q)) score += 100;
  else if (product.name.toLowerCase().includes(q)) score += 60;

  if (product.brand.toLowerCase().includes(q)) score += 40;
  if (product.category.toLowerCase().includes(q)) score += 30;
  if (product.weight.toLowerCase().includes(q)) score += 20;
  if (product.description.toLowerCase().includes(q)) score += 10;

  // Boost popular / featured items
  if (product.isPopular) score += 5;
  if (product.isFeatured) score += 3;

  return score;
}

export function search(query: string): SearchResult {
  const q = query.trim().toLowerCase();

  if (q.length < 2) {
    return { products: [], categories: [], brands: [], total: 0 };
  }

  // --- Products ---
  const productMatches: ProductMatch[] = products
    .map((product) => {
      const score = scoreProduct(product, q);
      const highlights: { field: string; value: string }[] = [];

      if (highlight(product.name, q)) highlights.push({ field: 'name', value: product.name });
      if (highlight(product.brand, q)) highlights.push({ field: 'brand', value: product.brand });
      if (highlight(product.category, q)) highlights.push({ field: 'category', value: product.category });
      if (highlight(product.weight, q)) highlights.push({ field: 'weight', value: product.weight });

      return { product, highlights, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // --- Categories ---
  const categoryMatches: CategoryMatch[] = categories
    .filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
    .map((c) => ({ name: c.name, slug: c.slug, icon: c.icon }))
    .slice(0, 4);

  // --- Brands ---
  const brandMap = new Map<string, number>();
  products.forEach((p) => {
    if (p.brand.toLowerCase().includes(q)) {
      brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1);
    }
  });
  const brandMatches: BrandMatch[] = Array.from(brandMap.entries())
    .map(([name, productCount]) => ({ name, productCount }))
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 4);

  return {
    products: productMatches,
    categories: categoryMatches,
    brands: brandMatches,
    total: productMatches.length + categoryMatches.length + brandMatches.length,
  };
}

/** Highlight matching text — wraps the match in a <mark> tag string marker */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '|||$1|||');
}
