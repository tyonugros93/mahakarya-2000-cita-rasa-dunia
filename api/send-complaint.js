/**
 * Vercel Serverless Function: /api/send-complaint
 * 
 * Sends complaint emails via Web3Forms API (free, no npm needed).
 * Requires WEB3FORMS_KEY environment variable.
 * 
 * Setup:
 * 1. Go to https://web3forms.com
 * 2. Enter recipient email (fazzaraihantechno@gmail.com)
 * 3. Check inbox for access key
 * 4. Add WEB3FORMS_KEY=<access_key> to Vercel Environment Variables
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, category, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan detail pengaduan wajib diisi.' });
    }

    const ticketId = 'TKT-' + Date.now();
    const web3formsKey = process.env.WEB3FORMS_KEY;

    if (!web3formsKey) {
      console.error('[send-complaint] WEB3FORMS_KEY not configured!');
      return res.status(200).json({
        success: true,
        sent: false,
        message: 'Pengaduan diterima tetapi email API belum dikonfigurasi.',
        ticketId
      });
    }

    // Send via Web3Forms API (free: 250 emails/month)
    const web3Res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: web3formsKey,
        subject: `[PENGADUAN] ${category || 'Umum'} - ${name} (${ticketId})`,
        from_name: 'Mahakarya Support System',
        replyto: email,
        // Structured fields for clean email
        'Nomor Tiket': ticketId,
        'Nama Lengkap': name,
        'Email Pengirim': email,
        'Kategori Kendala': category || 'Umum',
        'Detail Pengaduan': message,
        'Waktu Laporan': new Date().toLocaleString('id-ID', { 
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'medium'
        }),
        'Platform': 'Mahakarya 2.962 Cita Rasa Dunia'
      })
    });

    const result = await web3Res.json();

    if (result.success) {
      console.log('[send-complaint] Email sent successfully via Web3Forms. Ticket:', ticketId);
      return res.status(200).json({
        success: true,
        sent: true,
        message: 'Pengaduan berhasil dikirim ke email Customer Service.',
        ticketId
      });
    } else {
      console.error('[send-complaint] Web3Forms error:', result.message);
      return res.status(200).json({
        success: true,
        sent: false,
        message: 'Pengaduan diterima tetapi gagal mengirim email: ' + (result.message || 'Unknown error'),
        ticketId
      });
    }

  } catch (err) {
    console.error('[send-complaint] Error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  }
}
