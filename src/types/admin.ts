/**
 * admin.ts — Admin-side TypeScript types
 * All admin data is stored in localStorage and bridged to customer UI.
 */

// ─── Product Override (admin edits on top of static product data) ────────────

export interface ProductOverride {
  id: string;            // matches product id from products.ts
  name?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  inStock?: boolean;
  stock?: number;        // actual stock count
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isDeal?: boolean;
  badge?: string;
  description?: string;
  image?: string;
  updatedAt: string;
}

// ─── Admin-created Product (new products beyond static data) ─────────────────

export interface AdminProduct {
  id: string;             // 'admin-xxxx'
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  inStock: boolean;
  badge?: string;
  unit: string;
  weight: string;
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isPopular?: boolean;
  isDeal?: boolean;
  isActive: boolean;
  stock: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory Log Entry ─────────────────────────────────────────────────────

export interface InventoryLogEntry {
  id: string;
  productId: string;
  productName: string;
  change: number;         // +50 or -2
  reason: string;         // 'Stock Added', 'Sold', 'Manual Adjustment'
  previousStock: number;
  newStock: number;
  performedBy: string;
  timestamp: string;
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface AdminCoupon {
  id: string;
  code: string;                         // e.g. 'SAVE50'
  type: 'percent' | 'fixed';
  value: number;                        // 50 = 50% or ₹50
  minOrder: number;
  maxDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

// ─── Offer ───────────────────────────────────────────────────────────────────

export interface AdminOffer {
  id: string;
  title: string;
  description: string;
  type: 'percent' | 'fixed' | 'bogo' | 'category';
  value: number;
  applicableCategories?: string[];
  applicableProductIds?: string[];
  minOrder?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  badgeColor?: string;
  isActive: boolean;
  status: 'active' | 'scheduled' | 'expired' | 'inactive';
  createdAt: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  body: string;
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
}

// ─── Store Settings ──────────────────────────────────────────────────────────

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  expressDeliveryFee: number;
  minOrderValue: number;
  isOpen: boolean;
  openingHours: string;
  closingHours: string;
  gstPercent: number;
  codFee: number;
  updatedAt: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

// ─── Content / Banner ────────────────────────────────────────────────────────

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// ─── Full Admin State ────────────────────────────────────────────────────────

export interface AdminState {
  productOverrides: Record<string, ProductOverride>;
  adminProducts: AdminProduct[];
  inventoryLog: InventoryLogEntry[];
  coupons: AdminCoupon[];
  offers: AdminOffer[];
  reviews: AdminReview[];
  settings: StoreSettings;
  categories: AdminCategory[];
  auditLog: AuditLogEntry[];
  banners: Banner[];
}
