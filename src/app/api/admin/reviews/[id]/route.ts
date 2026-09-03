import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });
    return NextResponse.json({ review });
  } catch (err) {
    console.error('[Admin Review PATCH]', err);
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('[Admin Review DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
