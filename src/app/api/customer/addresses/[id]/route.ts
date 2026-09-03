import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// PUT /api/customer/addresses/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const body = await req.json();
    const addr = await prisma.address.findFirst({ where: { id, userId: user!.id } });
    if (!addr) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId: user!.id, isDefault: true }, data: { isDefault: false } });
    }

    const typeMap: Record<string, 'home' | 'office' | 'other'> = {
      Home: 'home', Work: 'office', Office: 'office', Other: 'other',
    };

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(body.label !== undefined && { type: typeMap[body.label] ?? 'home' }),
        ...(body.fullName !== undefined && { fullName: body.fullName }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.line1 !== undefined && { addressLine1: body.line1 }),
        ...(body.line2 !== undefined && { addressLine2: body.line2 ?? null }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.pincode !== undefined && { pincode: body.pincode }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      },
    });
    return NextResponse.json({ address: updated });
  } catch (err) {
    console.error('[Address PUT]', err);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// DELETE /api/customer/addresses/[id] — hard delete (no deletedAt on Address)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const addr = await prisma.address.findFirst({ where: { id, userId: user!.id } });
    if (!addr) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ message: 'Address deleted' });
  } catch (err) {
    console.error('[Address DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

// PATCH /api/customer/addresses/[id] — set as default
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const addr = await prisma.address.findFirst({ where: { id, userId: user!.id } });
    if (!addr) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    await prisma.address.updateMany({ where: { userId: user!.id }, data: { isDefault: false } });
    await prisma.address.update({ where: { id }, data: { isDefault: true } });
    return NextResponse.json({ message: 'Default address updated' });
  } catch (err) {
    console.error('[Address PATCH]', err);
    return NextResponse.json({ error: 'Failed to set default' }, { status: 500 });
  }
}
