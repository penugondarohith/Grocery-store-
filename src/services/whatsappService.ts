export interface WhatsAppOrderPayload {
  customerPhone: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; total: number }[];
  total: number;
  paymentMethod: 'upi' | 'cod';
  deliverySlot?: string;
  address: string;
}

/**
 * Sends WhatsApp order alerts to both customer and owner.
 * Silently fails — never throws — so it never blocks checkout.
 */
export async function sendOrderWhatsApp(payload: WhatsAppOrderPayload): Promise<void> {
  try {
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log('[WhatsApp] Sent:', data);
  } catch (err) {
    // Never break checkout — just log
    console.warn('[WhatsApp] Failed to send alert (non-critical):', err);
  }
}
