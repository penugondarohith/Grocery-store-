import { NextRequest, NextResponse } from 'next/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'; // Twilio sandbox number
const OWNER_PHONE = process.env.OWNER_WHATSAPP_NUMBER ?? ''; // e.g. +919876543210

async function sendWhatsApp(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('[WhatsApp] Twilio credentials not configured — skipping send');
    return { success: false, reason: 'not_configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const formData = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: `whatsapp:${to}`,
    Body: body,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[WhatsApp] Send failed:', data);
    return { success: false, error: data };
  }
  return { success: true, sid: data.sid };
}

export async function POST(req: NextRequest) {
  try {
    const {
      customerPhone,
      customerName,
      orderId,
      items,
      total,
      paymentMethod,
      deliverySlot,
      address,
    } = await req.json();

    // ── Customer Message ──────────────────────────────────────────
    const itemsList = (items as { name: string; quantity: number; total: number }[])
      .map((i) => `• ${i.name} × ${i.quantity} — ₹${i.total}`)
      .join('\n');

    const customerMsg = `🛒 *Vijaya Lakshmi General Stores*

Hello ${customerName}! ✅ Your order is confirmed.

📦 *Order ID:* ${orderId}
💰 *Amount:* ₹${total}
💳 *Payment:* ${paymentMethod === 'upi' ? 'UPI (Paid ✅)' : 'Cash on Delivery'}
🚚 *Delivery:* ${deliverySlot ?? 'Standard (2–3 days)'}
📍 *Address:* ${address}

🛍️ *Items Ordered:*
${itemsList}

Thank you for shopping with us! 🙏
_Vijaya Lakshmi General Stores, Penamaluru_`;

    // ── Owner Message ─────────────────────────────────────────────
    const ownerMsg = `🔔 *NEW ORDER RECEIVED!*

👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Address:* ${address}

🛒 *Items:*
${itemsList}

💰 *Total:* ₹${total}
💳 *Payment:* ${paymentMethod === 'upi' ? 'UPI (Paid ✅)' : 'Cash on Delivery 💵'}
🚚 *Delivery:* ${deliverySlot ?? 'Standard (2–3 days)'}

📋 *Order ID:* ${orderId}`;

    const results = await Promise.allSettled([
      // Send to customer (only if phone provided)
      customerPhone ? sendWhatsApp(customerPhone, customerMsg) : Promise.resolve({ success: false, reason: 'no_customer_phone' }),
      // Send to owner
      OWNER_PHONE ? sendWhatsApp(OWNER_PHONE, ownerMsg) : Promise.resolve({ success: false, reason: 'no_owner_phone' }),
    ]);

    return NextResponse.json({
      customer: results[0].status === 'fulfilled' ? results[0].value : { success: false },
      owner: results[1].status === 'fulfilled' ? results[1].value : { success: false },
    });
  } catch (err) {
    console.error('[WhatsApp API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
