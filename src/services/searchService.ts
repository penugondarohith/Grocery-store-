import { products, Product } from '@/data/products';
import { categories } from '@/data/categories';

export interface SearchResult {
  products: ProductMatch[];
  categories: CategoryMatch[];
  brands: BrandMatch[];
  relatedProducts: Product[];   // shown when no exact matches
  total: number;
  hasExactMatches: boolean;
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

function scoreProduct(product: Product, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  let score = 0;

  // Name matches (highest weight)
  if (product.name.toLowerCase() === q) score += 200;
  else if (product.name.toLowerCase().startsWith(q)) score += 120;
  else if (product.name.toLowerCase().includes(q)) score += 70;

  // Brand
  if (product.brand.toLowerCase() === q) score += 80;
  else if (product.brand.toLowerCase().includes(q)) score += 45;

  // Category / subcategory
  if (product.category.toLowerCase().includes(q)) score += 35;
  if (product.subcategory?.toLowerCase().includes(q)) score += 30;

  // Weight (e.g. "500g", "1kg")
  if (product.weight.toLowerCase().includes(q)) score += 25;

  // Description
  if (product.description.toLowerCase().includes(q)) score += 12;

  // Boost popular/featured items slightly
  if (product.isPopular) score += 5;
  if (product.isFeatured) score += 3;
  if (product.isDeal) score += 2;

  return score;
}

/** Returns products related to the query by category / brand — used as fallback */
function getRelatedProducts(query: string, exclude: Set<string>): Product[] {
  const q = query.toLowerCase().trim();

  // Find any category/brand that loosely matches
  const relatedCategory = categories.find(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      q.includes(c.name.toLowerCase().split(' ')[0])
  );

  // Try to get products from matching category first
  let related: Product[] = [];
  if (relatedCategory) {
    related = products.filter(
      (p) => p.categorySlug === relatedCategory.slug && !exclude.has(p.id)
    );
  }

  // Fill up to 8 with popular products from any category
  if (related.length < 8) {
    const popular = products.filter(
      (p) => (p.isPopular || p.isFeatured) && !exclude.has(p.id) &&
        !related.find((r) => r.id === p.id)
    );
    related = [...related, ...popular];
  }

  return related.slice(0, 8);
}

export function search(query: string): SearchResult {
  const q = query.trim().toLowerCase();

  if (q.length < 2) {
    return {
      products: [], categories: [], brands: [], relatedProducts: [],
      total: 0, hasExactMatches: false,
    };
  }

  // ── Products ──────────────────────────────────────────────────
  const productMatches: ProductMatch[] = products
    .map((product) => {
      const score = scoreProduct(product, q);
      const highlights: { field: string; value: string }[] = [];
      if (product.name.toLowerCase().includes(q)) highlights.push({ field: 'name', value: product.name });
      if (product.brand.toLowerCase().includes(q)) highlights.push({ field: 'brand', value: product.brand });
      if (product.category.toLowerCase().includes(q)) highlights.push({ field: 'category', value: product.category });
      if (product.weight.toLowerCase().includes(q)) highlights.push({ field: 'weight', value: product.weight });
      return { product, highlights, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // ── Categories ────────────────────────────────────────────────
  const categoryMatches: CategoryMatch[] = categories
    .filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
    .map((c) => ({ name: c.name, slug: c.slug, icon: c.icon }))
    .slice(0, 4);

  // ── Brands ────────────────────────────────────────────────────
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

  const hasExactMatches = productMatches.length > 0 || categoryMatches.length > 0 || brandMatches.length > 0;

  // ── Related products (fallback when no exact matches) ─────────
  const excludedIds = new Set(productMatches.map((m) => m.product.id));
  const relatedProducts = hasExactMatches ? [] : getRelatedProducts(q, excludedIds);

  return {
    products: productMatches,
    categories: categoryMatches,
    brands: brandMatches,
    relatedProducts,
    total: productMatches.length + categoryMatches.length + brandMatches.length,
    hasExactMatches,
  };
}

/** Highlight matching text — wraps the match in ||| markers for rendering */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  return text.replace(regex, '|||$1|||');
}
