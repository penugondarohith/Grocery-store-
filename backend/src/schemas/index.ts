import { z } from 'zod';

// ----------------------------------------------------------------
// Auth Schemas
// ----------------------------------------------------------------
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number')
      .optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
  }),
});

// ----------------------------------------------------------------
// Product Schemas
// ----------------------------------------------------------------
const variantSchema = z.object({
  name: z.string().min(1),
  weight: z.number().positive().optional(),
  unit: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive('Original price must be positive'),
  discountPercent: z.number().min(0).max(100).default(0),
  isDefault: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
    description: z.string().optional(),
    brand: z.string().optional(),
    sku: z.string().min(1).max(100),
    categoryId: z.string().uuid('Invalid category ID'),
    subcategoryId: z.string().uuid().optional(),
    imageUrl: z.string().url().optional(),
    imageUrls: z.array(z.string().url()).optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    variants: z.array(variantSchema).min(1, 'At least one variant is required'),
  }),
});

export const updateProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(200).optional(),
      description: z.string().optional(),
      brand: z.string().optional(),
      categoryId: z.string().uuid().optional(),
      subcategoryId: z.string().uuid().optional(),
      imageUrl: z.string().url().optional(),
      imageUrls: z.array(z.string().url()).optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      isPopular: z.boolean().optional(),
    })
    .partial(),
  params: z.object({ id: z.string().uuid('Invalid product ID') }),
});

// ----------------------------------------------------------------
// Category Schemas
// ----------------------------------------------------------------
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    icon: z.string().optional(),
    colorGradient: z.string().optional(),
    sortOrder: z.number().int().min(0).default(0),
  }),
});

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().optional(),
      imageUrl: z.string().url().optional(),
      icon: z.string().optional(),
      sortOrder: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    })
    .partial(),
  params: z.object({ id: z.string().uuid('Invalid category ID') }),
});

// ----------------------------------------------------------------
// Order Schemas
// ----------------------------------------------------------------
export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().uuid('Invalid address ID').optional(),
    couponCode: z.string().optional(),
    deliveryType: z.enum(['door_delivery', 'self_pickup']),
    deliverySlot: z.string().optional(),
    paymentMethod: z.enum(['cod', 'upi', 'card', 'wallet', 'netbanking']),
    notes: z.string().max(500).optional(),
    items: z
      .array(
        z.object({
          productVariantId: z.string().uuid('Invalid variant ID'),
          quantity: z.number().int().min(1).max(50),
        })
      )
      .min(1, 'At least one item is required'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'pending','confirmed','processing','packed',
      'shipped','out_for_delivery','delivered','cancelled','refunded',
    ]),
    description: z.string().optional(),
    location: z.string().optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid order ID') }),
});

// ----------------------------------------------------------------
// Payment Schemas
// ----------------------------------------------------------------
export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
    method: z.enum(['cod', 'upi', 'card', 'wallet', 'netbanking']),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    razorpayPaymentId: z.string().min(1),
    razorpayOrderId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
});

// ----------------------------------------------------------------
// Address Schemas
// ----------------------------------------------------------------
export const createAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
    addressLine1: z.string().min(5).max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
    type: z.enum(['home', 'office', 'other']).default('home'),
    isDefault: z.boolean().default(false),
  }),
});

// UUID param helper
export const uuidParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid ID format') }),
});
