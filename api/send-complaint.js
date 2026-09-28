/**
 * Vercel Serverless Function: /api/send-complaint
 * 
 * GET: Returns the Web3Forms access key for client-side email sending
 * POST: Fallback server-side complaint handler (logs only)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: Return Web3Forms key for client-side email sending
  if (req.method === 'GET') {
    const key = process.env.WEB3FORMS_KEY || '';
    if (!key) {
      return res.status(500).json({ success: false, message: 'WEB3FORMS_KEY belum dikonfigurasi.' });
    }
    return res.status(200).json({ success: true, key });
  }

  // POST: Fallback logging (email sent from client-side)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      console.log('[send-complaint] Complaint received:', JSON.stringify(body));
      return res.status(200).json({ success: true, message: 'Logged.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
