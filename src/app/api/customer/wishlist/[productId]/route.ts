import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// POST /api/customer/wishlist/[productId] — add to wishlist
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;
  const { productId } = await params;

  try {
    const existing = await prisma.wishlist.findFirst({
      where: { userId: user!.id, productId },
    });
    if (existing) return NextResponse.json({ message: 'Already in wishlist' }, { status: 200 });

    const product = await prisma.product.findFirst({ where: { id: productId, isActive: true, deletedAt: null } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const item = await prisma.wishlist.create({
      data: { userId: user!.id, productId },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error('[Wishlist POST]', err);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE /api/customer/wishlist/[productId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;
  const { productId } = await params;

  try {
    await prisma.wishlist.deleteMany({
      where: { userId: user!.id, productId },
    });
    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('[Wishlist DELETE]', err);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
