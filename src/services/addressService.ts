import { createClient } from '@/lib/supabase/client';
import { Address } from '@/types/checkout';

export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Address[];
}

export async function addAddress(address: Omit<Address, 'id' | 'created_at'>): Promise<Address> {
  const supabase = createClient();
  // If marking as default, unset others first
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', address.user_id ?? '');
  }
  const { data, error } = await supabase
    .from('addresses')
    .insert(address)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

export async function updateAddress(id: string, userId: string, updates: Partial<Address>): Promise<Address> {
  const supabase = createClient();
  if (updates.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }
  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function setDefaultAddress(id: string, userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  await supabase.from('addresses').update({ is_default: true }).eq('id', id);
}
