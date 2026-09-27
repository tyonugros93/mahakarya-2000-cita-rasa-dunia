// Vercel Serverless Function: api/scalev-webhook.js
// Accepts incoming webhook notifications from Scalev when a new order is paid

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('Scalev Webhook Received:', JSON.stringify(payload));

    const orderId = payload?.order_id || payload?.id || payload?.order?.id;
    const email = payload?.customer_email || payload?.customer?.email;
    const name = payload?.customer_name || payload?.customer?.name;
    const status = (payload?.status || payload?.event || 'paid').toLowerCase();

    return res.status(200).json({
      success: true,
      received: true,
      order_id: orderId,
      email: email,
      name: name,
      status: status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
