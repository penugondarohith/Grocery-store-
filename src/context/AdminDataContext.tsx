'use client';

/**
 * AdminDataContext.tsx
 *
 * Central store for all admin-managed data. Persisted to localStorage.
 * Both admin pages and customer-facing pages can read from this context.
 *
 * localStorage keys:
 *   vlgs_admin_overrides   — ProductOverride[]
 *   vlgs_admin_products    — AdminProduct[]
 *   vlgs_admin_coupons     — AdminCoupon[]
 *   vlgs_admin_offers      — AdminOffer[]
 *   vlgs_admin_reviews     — AdminReview[]
 *   vlgs_admin_settings    — StoreSettings
 *   vlgs_admin_categories  — AdminCategory[]
 *   vlgs_admin_audit       — AuditLogEntry[]
 *   vlgs_admin_banners     — Banner[]
 *   vlgs_admin_inv_log     — InventoryLogEntry[]
 *   vlgs_admin_bypass      — 'true' (dev-only admin bypass)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  AdminState,
  ProductOverride,
  AdminProduct,
  AdminCoupon,
  AdminOffer,
  AdminReview,
  StoreSettings,
  AdminCategory,
  AuditLogEntry,
  Banner,
  InventoryLogEntry,
} from '@/types/admin';
import { categories as staticCategories } from '@/data/categories';
import { generateOrderId } from '@/lib/utils';

// ─── Default Settings ──────────────────────────────────────────────────────

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Vijaya Lakshmi General Stores',
  tagline: 'Fresh Groceries Delivered in 30 Minutes',
  contactPhone: '+91 9876543210',
  contactEmail: 'info@vlgs.store',
  address: 'Main Road, Vijayawada, Andhra Pradesh 520001',
  deliveryFee: 0,
  freeDeliveryThreshold: 500,
  expressDeliveryFee: 49,
  minOrderValue: 100,
  isOpen: true,
  openingHours: '08:00',
  closingHours: '22:00',
  gstPercent: 5,
  codFee: 20,
  updatedAt: new Date().toISOString(),
};

// ─── Seed Categories from static data ─────────────────────────────────────

const seedCategories = (): AdminCategory[] =>
  staticCategories.map((c, i) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: '',
    icon: c.icon,
    displayOrder: i + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  }));

// ─── Storage helpers ───────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Context value type ────────────────────────────────────────────────────

export interface AdminDataContextValue {
  // Data
  state: AdminState;
  isAdminBypass: boolean;

  // Product overrides (admin edits on static products)
  setProductOverride: (id: string, patch: Partial<ProductOverride>) => void;
  getProductOverride: (id: string) => ProductOverride | undefined;

  // Admin-created products
  addAdminProduct: (p: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) => AdminProduct;
  updateAdminProduct: (id: string, patch: Partial<AdminProduct>) => void;
  deleteAdminProduct: (id: string) => void;

  // Coupons
  addCoupon: (c: Omit<AdminCoupon, 'id' | 'createdAt' | 'usedCount'>) => AdminCoupon;
  updateCoupon: (id: string, patch: Partial<AdminCoupon>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; coupon?: AdminCoupon; error?: string };

  // Offers
  addOffer: (o: Omit<AdminOffer, 'id' | 'createdAt'>) => AdminOffer;
  updateOffer: (id: string, patch: Partial<AdminOffer>) => void;
  deleteOffer: (id: string) => void;

  // Reviews
  addReview: (r: Omit<AdminReview, 'id' | 'createdAt' | 'status'>) => AdminReview;
  updateReview: (id: string, patch: Partial<AdminReview>) => void;
  deleteReview: (id: string) => void;

  // Settings
  updateSettings: (patch: Partial<StoreSettings>) => void;

  // Categories
  addCategory: (c: Omit<AdminCategory, 'id' | 'createdAt'>) => AdminCategory;
  updateCategory: (id: string, patch: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;

  // Inventory
  adjustStock: (productId: string, productName: string, change: number, reason: string) => void;
  setStock: (productId: string, productName: string, newStock: number, reason: string) => void;
  getCurrentStock: (productId: string) => number | null;

  // Banners
  addBanner: (b: Omit<Banner, 'id' | 'createdAt'>) => Banner;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  // Audit
  logAction: (action: string, entity: string, description: string, entityId?: string) => void;

  // Dev bypass
  enableAdminBypass: () => void;
  disableAdminBypass: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  const [state, setState] = useState<AdminState>({
    productOverrides: {},
    adminProducts: [],
    inventoryLog: [],
    coupons: [],
    offers: [],
    reviews: [],
    settings: DEFAULT_SETTINGS,
    categories: [],
    auditLog: [],
    banners: [],
  });

  const [isAdminBypass, setIsAdminBypass] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const cats = load<AdminCategory[]>('vlgs_admin_categories', []);

    setState({
      productOverrides: load<Record<string, ProductOverride>>('vlgs_admin_overrides', {}),
      adminProducts: load<AdminProduct[]>('vlgs_admin_products', []),
      inventoryLog: load<InventoryLogEntry[]>('vlgs_admin_inv_log', []),
      coupons: load<AdminCoupon[]>('vlgs_admin_coupons', []),
      offers: load<AdminOffer[]>('vlgs_admin_offers', []),
      reviews: load<AdminReview[]>('vlgs_admin_reviews', []),
      settings: load<StoreSettings>('vlgs_admin_settings', DEFAULT_SETTINGS),
      categories: cats.length > 0 ? cats : seedCategories(),
      auditLog: load<AuditLogEntry[]>('vlgs_admin_audit', []),
      banners: load<Banner[]>('vlgs_admin_banners', []),
    });

    setIsAdminBypass(load<string>('vlgs_admin_bypass', '') === 'true');
  }, []);

  // ─── Persist helpers ─────────────────────────────────────────────────────

  const persist = useCallback(<K extends keyof AdminState>(
    key: string,
    slice: K,
    value: AdminState[K]
  ) => {
    save(key, value);
    setState(prev => ({ ...prev, [slice]: value }));
  }, []);

  // ─── Audit ────────────────────────────────────────────────────────────────

  const logAction = useCallback((
    action: string, entity: string, description: string, entityId?: string
  ) => {
    const entry: AuditLogEntry = {
      id: generateOrderId(),
      action, entity, entityId,
      description,
      performedBy: 'Admin',
      timestamp: new Date().toISOString(),
    };
    setState(prev => {
      const updated = [entry, ...prev.auditLog].slice(0, 200);
      save('vlgs_admin_audit', updated);
      return { ...prev, auditLog: updated };
    });
  }, []);

  // ─── Product Overrides ────────────────────────────────────────────────────

  const setProductOverride = useCallback((id: string, patch: Partial<ProductOverride>) => {
    setState(prev => {
      const existing = prev.productOverrides[id] ?? { id, updatedAt: '' };
      const updated = { ...prev.productOverrides, [id]: { ...existing, ...patch, id, updatedAt: new Date().toISOString() } };
      save('vlgs_admin_overrides', updated);
      return { ...prev, productOverrides: updated };
    });
    logAction('PRODUCT_OVERRIDE', 'Product', `Updated product override for ${id}`, id);
  }, [logAction]);

  const getProductOverride = useCallback((id: string): ProductOverride | undefined => {
    return state.productOverrides[id];
  }, [state.productOverrides]);

  // ─── Admin Products ───────────────────────────────────────────────────────

  const addAdminProduct = useCallback((p: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): AdminProduct => {
    const product: AdminProduct = {
      ...p,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => {
      const updated = [product, ...prev.adminProducts];
      save('vlgs_admin_products', updated);
      return { ...prev, adminProducts: updated };
    });
    logAction('CREATE_PRODUCT', 'AdminProduct', `Created product: ${p.name}`, product.id);
    return product;
  }, [logAction]);

  const updateAdminProduct = useCallback((id: string, patch: Partial<AdminProduct>) => {
    setState(prev => {
      const updated = prev.adminProducts.map(p => p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p);
      save('vlgs_admin_products', updated);
      return { ...prev, adminProducts: updated };
    });
    logAction('UPDATE_PRODUCT', 'AdminProduct', `Updated admin product ${id}`, id);
  }, [logAction]);

  const deleteAdminProduct = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.adminProducts.filter(p => p.id !== id);
      save('vlgs_admin_products', updated);
      return { ...prev, adminProducts: updated };
    });
    logAction('DELETE_PRODUCT', 'AdminProduct', `Deleted admin product ${id}`, id);
  }, [logAction]);

  // ─── Inventory ────────────────────────────────────────────────────────────

  const getCurrentStock = useCallback((productId: string): number | null => {
    const override = state.productOverrides[productId];
    if (override?.stock !== undefined) return override.stock;
    const adminProd = state.adminProducts.find(p => p.id === productId);
    if (adminProd) return adminProd.stock;
    return null;
  }, [state.productOverrides, state.adminProducts]);

  const adjustStock = useCallback((productId: string, productName: string, change: number, reason: string) => {
    const current = getCurrentStock(productId) ?? 100;
    const newStock = Math.max(0, current + change);

    // Update product override/admin product
    if (state.adminProducts.find(p => p.id === productId)) {
      setState(prev => {
        const updated = prev.adminProducts.map(p =>
          p.id === productId ? { ...p, stock: newStock, inStock: newStock > 0, updatedAt: new Date().toISOString() } : p
        );
        save('vlgs_admin_products', updated);
        return { ...prev, adminProducts: updated };
      });
    } else {
      setProductOverride(productId, { stock: newStock, inStock: newStock > 0 });
    }

    // Log inventory change
    const entry: InventoryLogEntry = {
      id: generateOrderId(),
      productId, productName, change, reason,
      previousStock: current, newStock,
      performedBy: 'Admin',
      timestamp: new Date().toISOString(),
    };
    setState(prev => {
      const updated = [entry, ...prev.inventoryLog].slice(0, 500);
      save('vlgs_admin_inv_log', updated);
      return { ...prev, inventoryLog: updated };
    });
    logAction('INVENTORY_ADJUST', 'Inventory', `${change > 0 ? '+' : ''}${change} stock for ${productName} (${reason})`, productId);
  }, [getCurrentStock, setProductOverride, state.adminProducts, logAction]);

  const setStock = useCallback((productId: string, productName: string, newStock: number, reason: string) => {
    const current = getCurrentStock(productId) ?? 0;
    adjustStock(productId, productName, newStock - current, reason);
  }, [getCurrentStock, adjustStock]);

  // ─── Coupons ──────────────────────────────────────────────────────────────

  const addCoupon = useCallback((c: Omit<AdminCoupon, 'id' | 'createdAt' | 'usedCount'>): AdminCoupon => {
    const coupon: AdminCoupon = { ...c, id: `cpn-${Date.now()}`, usedCount: 0, createdAt: new Date().toISOString() };
    setState(prev => {
      const updated = [coupon, ...prev.coupons];
      save('vlgs_admin_coupons', updated);
      return { ...prev, coupons: updated };
    });
    logAction('CREATE_COUPON', 'Coupon', `Created coupon: ${c.code}`, coupon.id);
    return coupon;
  }, [logAction]);

  const updateCoupon = useCallback((id: string, patch: Partial<AdminCoupon>) => {
    setState(prev => {
      const updated = prev.coupons.map(c => c.id === id ? { ...c, ...patch } : c);
      save('vlgs_admin_coupons', updated);
      return { ...prev, coupons: updated };
    });
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.coupons.filter(c => c.id !== id);
      save('vlgs_admin_coupons', updated);
      return { ...prev, coupons: updated };
    });
  }, []);

  const validateCoupon = useCallback((code: string, orderTotal: number): { valid: boolean; coupon?: AdminCoupon; error?: string } => {
    const coupon = state.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) return { valid: false, error: 'Invalid or expired coupon code' };
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return { valid: false, error: 'Coupon has expired' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { valid: false, error: 'Coupon usage limit reached' };
    if (coupon.minOrder && orderTotal < coupon.minOrder) return { valid: false, error: `Minimum order of ₹${coupon.minOrder} required` };
    return { valid: true, coupon };
  }, [state.coupons]);

  // ─── Offers ───────────────────────────────────────────────────────────────

  const addOffer = useCallback((o: Omit<AdminOffer, 'id' | 'createdAt'>): AdminOffer => {
    const offer: AdminOffer = { ...o, id: `off-${Date.now()}`, createdAt: new Date().toISOString() };
    setState(prev => {
      const updated = [offer, ...prev.offers];
      save('vlgs_admin_offers', updated);
      return { ...prev, offers: updated };
    });
    logAction('CREATE_OFFER', 'Offer', `Created offer: ${o.title}`, offer.id);
    return offer;
  }, [logAction]);

  const updateOffer = useCallback((id: string, patch: Partial<AdminOffer>) => {
    setState(prev => {
      const updated = prev.offers.map(o => o.id === id ? { ...o, ...patch } : o);
      save('vlgs_admin_offers', updated);
      return { ...prev, offers: updated };
    });
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.offers.filter(o => o.id !== id);
      save('vlgs_admin_offers', updated);
      return { ...prev, offers: updated };
    });
  }, []);

  // ─── Reviews ──────────────────────────────────────────────────────────────

  const addReview = useCallback((r: Omit<AdminReview, 'id' | 'createdAt' | 'status'>): AdminReview => {
    const review: AdminReview = { ...r, id: `rev-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    setState(prev => {
      const updated = [review, ...prev.reviews];
      save('vlgs_admin_reviews', updated);
      return { ...prev, reviews: updated };
    });
    return review;
  }, []);

  const updateReview = useCallback((id: string, patch: Partial<AdminReview>) => {
    setState(prev => {
      const updated = prev.reviews.map(r => r.id === id ? { ...r, ...patch } : r);
      save('vlgs_admin_reviews', updated);
      return { ...prev, reviews: updated };
    });
    logAction('UPDATE_REVIEW', 'Review', `Review ${id} status changed`, id);
  }, [logAction]);

  const deleteReview = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.reviews.filter(r => r.id !== id);
      save('vlgs_admin_reviews', updated);
      return { ...prev, reviews: updated };
    });
  }, []);

  // ─── Settings ─────────────────────────────────────────────────────────────

  const updateSettings = useCallback((patch: Partial<StoreSettings>) => {
    setState(prev => {
      const updated = { ...prev.settings, ...patch, updatedAt: new Date().toISOString() };
      save('vlgs_admin_settings', updated);
      return { ...prev, settings: updated };
    });
    logAction('UPDATE_SETTINGS', 'Settings', 'Store settings updated');
  }, [logAction]);

  // ─── Categories ───────────────────────────────────────────────────────────

  const addCategory = useCallback((c: Omit<AdminCategory, 'id' | 'createdAt'>): AdminCategory => {
    const cat: AdminCategory = { ...c, id: `cat-${Date.now()}`, createdAt: new Date().toISOString() };
    setState(prev => {
      const updated = [...prev.categories, cat];
      save('vlgs_admin_categories', updated);
      return { ...prev, categories: updated };
    });
    logAction('CREATE_CATEGORY', 'Category', `Created category: ${c.name}`, cat.id);
    return cat;
  }, [logAction]);

  const updateCategory = useCallback((id: string, patch: Partial<AdminCategory>) => {
    setState(prev => {
      const updated = prev.categories.map(c => c.id === id ? { ...c, ...patch } : c);
      save('vlgs_admin_categories', updated);
      return { ...prev, categories: updated };
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.categories.filter(c => c.id !== id);
      save('vlgs_admin_categories', updated);
      return { ...prev, categories: updated };
    });
  }, []);

  // ─── Banners ──────────────────────────────────────────────────────────────

  const addBanner = useCallback((b: Omit<Banner, 'id' | 'createdAt'>): Banner => {
    const banner: Banner = { ...b, id: `ban-${Date.now()}`, createdAt: new Date().toISOString() };
    setState(prev => {
      const updated = [...prev.banners, banner];
      save('vlgs_admin_banners', updated);
      return { ...prev, banners: updated };
    });
    return banner;
  }, []);

  const updateBanner = useCallback((id: string, patch: Partial<Banner>) => {
    setState(prev => {
      const updated = prev.banners.map(b => b.id === id ? { ...b, ...patch } : b);
      save('vlgs_admin_banners', updated);
      return { ...prev, banners: updated };
    });
  }, []);

  const deleteBanner = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.banners.filter(b => b.id !== id);
      save('vlgs_admin_banners', updated);
      return { ...prev, banners: updated };
    });
  }, []);

  // ─── Dev Bypass ───────────────────────────────────────────────────────────

  const enableAdminBypass = useCallback(() => {
    save('vlgs_admin_bypass', 'true');
    setIsAdminBypass(true);
  }, []);

  const disableAdminBypass = useCallback(() => {
    localStorage.removeItem('vlgs_admin_bypass');
    setIsAdminBypass(false);
  }, []);

  return (
    <AdminDataContext.Provider value={{
      state,
      isAdminBypass,
      setProductOverride,
      getProductOverride,
      addAdminProduct,
      updateAdminProduct,
      deleteAdminProduct,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      validateCoupon,
      addOffer,
      updateOffer,
      deleteOffer,
      addReview,
      updateReview,
      deleteReview,
      updateSettings,
      addCategory,
      updateCategory,
      deleteCategory,
      adjustStock,
      setStock,
      getCurrentStock,
      addBanner,
      updateBanner,
      deleteBanner,
      logAction,
      enableAdminBypass,
      disableAdminBypass,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside <AdminDataProvider>');
  return ctx;
}

// Read-only hook safe to use in customer-facing components
export function useAdminDataReadonly() {
  const ctx = useContext(AdminDataContext);
  return ctx; // Returns null if not inside provider — handle gracefully
}
