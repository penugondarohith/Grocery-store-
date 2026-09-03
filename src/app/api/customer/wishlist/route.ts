import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/customer/wishlist
export async function GET(_req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } },
            variants: {
              where: { isDefault: true },
              include: { inventory: true },
              take: 1,
            },
            reviews: { where: { isApproved: true }, select: { rating: true } },
          },
        },
      },
    });

    return NextResponse.json({
      items: wishlist.map(w => {
        const variant = w.product.variants[0];
        const avgRating = w.product.reviews.length > 0
          ? w.product.reviews.reduce((s, r) => s + r.rating, 0) / w.product.reviews.length
          : 0;
        return {
          id: w.id,
          productId: w.productId,
          addedAt: w.createdAt,
          product: {
            id: w.product.id,
            name: w.product.name,
            slug: w.product.slug,
            brand: w.product.brand,
            imageUrl: w.product.imageUrl,
            category: w.product.category.name,
            categorySlug: w.product.category.slug,
            isActive: w.product.isActive,
            avgRating: Math.round(avgRating * 10) / 10,
            reviewCount: w.product.reviews.length,
            price: variant ? Number(variant.price) : 0,
            originalPrice: variant ? Number(variant.originalPrice) : 0,
            discountPercent: variant ? Number(variant.discountPercent) : 0,
            inStock: variant?.inventory?.status !== 'out_of_stock' && (variant?.inventory?.quantity ?? 0) > 0,
            variantId: variant?.id ?? null,
          },
        };
      }),
    });
  } catch (err) {
    console.error('[Wishlist GET]', err);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}
