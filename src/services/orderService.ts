import { createClient } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types/checkout';

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const seq = Date.now().toString().slice(-6);
  return `VLGS-${year}-${seq}`;
}

export async function createOrder(
  order: Omit<Order, 'id' | 'created_at'>,
): Promise<Order> {
  const supabase = createClient();

  // Insert order
  const { items, ...orderData } = order;
  const { data: createdOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      address: orderData.address,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Insert order items
  const orderItems: Omit<OrderItem & { order_id: string }, never>[] = items.map((item) => ({
    ...item,
    order_id: createdOrder.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return { ...createdOrder, items } as Order;
}

export async function getOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  if (error) return null;
  return data as unknown as Order;
}
