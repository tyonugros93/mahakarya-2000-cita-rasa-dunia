// Vercel Serverless Function: api/auth-user.js
// Handles Google Sign-In and email verification against Scalev Paid Whitelist & Scalev API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : req.query;
    const email = (body?.email || '').toString().trim().toLowerCase();
    const name = (body?.name || email.split('@')[0] || 'User').toString().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak boleh kosong.'
      });
    }

    // Verified Scalev buyer emails & owner master access
    const paidEmails = [
      'arinii.sartika@gmail.com',
      'fazzaraihantechno@gmail.com',
      'pembeli@myscalev.com',
      'lisensi.resmi@mahakarya.id',
      'tyonugros93@gmail.com',
      'sn.tyonyunu@gmail.com'
    ];

    let isPro = paidEmails.includes(email);
    let verifySource = isPro ? 'whitelist' : 'free';

    // Check Scalev API if SCALEV_API_KEY is configured in Vercel
    const scalevApiKey = process.env.SCALEV_API_KEY;
    if (!isPro && scalevApiKey) {
      try {
        const scalevRes = await fetch(`https://api.scalev.id/v1/orders?customer_email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${scalevApiKey}`,
            'Accept': 'application/json'
          }
        });
        if (scalevRes.ok) {
          const orderData = await scalevRes.json();
          const orders = orderData.data || orderData.results || (Array.isArray(orderData) ? orderData : []);
          const hasPaidOrder = orders.some(o => {
            const st = (o.status || o.payment_status || '').toLowerCase();
            return st === 'paid' || st === 'completed' || st === 'success';
          });
          if (hasPaidOrder) {
            isPro = true;
            verifySource = 'scalev_api';
          }
        }
      } catch (err) {
        console.error('Scalev API check error:', err);
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        email: email,
        name: name,
        isPro: isPro,
        verifySource: verifySource
      },
      message: isPro 
        ? `🎉 Welcome, ${name}! Akun Google Anda terverifikasi Member Pro VVIP.` 
        : `🎉 Welcome, ${name}! Login Google Berhasil (Member Gratis).`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server autentikasi: ' + error.message
    });
  }
}
