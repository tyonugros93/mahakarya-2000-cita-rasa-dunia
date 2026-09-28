/**
 * Shared Pro status checker.
 * Checks hardcoded whitelist + Scalev API for paid orders.
 */

const PAID_EMAILS = [
  'arinii.sartika@gmail.com',
  'fazzaraihantechno@gmail.com',
  'pembeli@myscalev.com',
  'lisensi.resmi@mahakarya.id',
  'tyonugros93@gmail.com',
  'sn.tyonyunu@gmail.com',
  'sn.tyonunu@gmail.com'
];

/**
 * Check if an email has Pro (paid) status
 * @param {string} email - Lowercase trimmed email
 * @returns {Promise<{ isPro: boolean, verifySource: string }>}
 */
export async function checkProStatus(email) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check hardcoded whitelist
  if (PAID_EMAILS.includes(normalizedEmail)) {
    return { isPro: true, verifySource: 'whitelist' };
  }

  // 2. Check Scalev API if configured
  const scalevApiKey = process.env.SCALEV_API_KEY;
  if (scalevApiKey) {
    try {
      const scalevRes = await fetch(
        `https://api.scalev.id/v1/orders?customer_email=${encodeURIComponent(normalizedEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${scalevApiKey}`,
            'Accept': 'application/json'
          }
        }
      );
      if (scalevRes.ok) {
        const orderData = await scalevRes.json();
        const orders = orderData.data || orderData.results || (Array.isArray(orderData) ? orderData : []);
        const hasPaidOrder = orders.some(o => {
          const st = (o.status || o.payment_status || '').toLowerCase();
          return st === 'paid' || st === 'completed' || st === 'success';
        });
        if (hasPaidOrder) {
          return { isPro: true, verifySource: 'scalev_api' };
        }
      }
    } catch (err) {
      console.error('[check-pro] Scalev API error:', err.message);
    }
  }

  return { isPro: false, verifySource: 'free' };
}
