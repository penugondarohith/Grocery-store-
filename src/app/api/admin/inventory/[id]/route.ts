import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// PUT /api/admin/inventory/[id] — update stock
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const { quantity, lowStockThreshold, reason, changeType } = body;
    // changeType: 'set' | 'increase' | 'decrease'

    const inv = await prisma.inventory.findUnique({ where: { id } });
    if (!inv) return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 });

    let newQuantity = inv.quantity;
    if (changeType === 'set' && quantity !== undefined) {
      newQuantity = Math.max(0, quantity);
    } else if (changeType === 'increase' && quantity !== undefined) {
      newQuantity = inv.quantity + Math.max(0, quantity);
    } else if (changeType === 'decrease' && quantity !== undefined) {
      newQuantity = Math.max(0, inv.quantity - Math.max(0, quantity));
    }

    const threshold = lowStockThreshold ?? inv.lowStockThreshold;
    let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (newQuantity === 0) status = 'out_of_stock';
    else if (newQuantity <= threshold) status = 'low_stock';

    const [updated] = await prisma.$transaction([
      prisma.inventory.update({
        where: { id },
        data: {
          quantity: newQuantity,
          lowStockThreshold: threshold,
          status,
          lastRestockedAt: changeType === 'increase' || (changeType === 'set' && newQuantity > inv.quantity)
            ? new Date()
            : undefined,
        },
      }),
      prisma.inventoryLog.create({
        data: {
          productVariantId: inv.productVariantId,
          previousQuantity: inv.quantity,
          newQuantity,
          changeAmount: newQuantity - inv.quantity,
          reason: reason || null,
          performedBy: user?.full_name || 'Admin',
        },
      }),
    ]);

    return NextResponse.json({ inventory: updated });
  } catch (err) {
    console.error('[Admin Inventory PUT]', err);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
