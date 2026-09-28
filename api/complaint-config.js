/**
 * Vercel Serverless Function: /api/complaint-config
 * Returns the Web3Forms access key for client-side email sending.
 * Web3Forms access keys are designed to be used client-side (public).
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=300');
  
  const key = process.env.WEB3FORMS_KEY || '';
  
  if (!key) {
    return res.status(500).json({ success: false, message: 'WEB3FORMS_KEY belum dikonfigurasi.' });
  }
  
  return res.status(200).json({ success: true, key });
}
