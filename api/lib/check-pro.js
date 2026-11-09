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
 * VVIP Pro Members — manually granted with plan type and expiry date.
 * Format: { email, plan, activatedAt, expiresAt (null = lifetime) }
 */
const VVIP_MEMBERS = [
  {
    email: 'herubahrudin92@gmail.com',
    plan: 'yearly',
    activatedAt: '2026-11-09T00:00:00.000Z',
    expiresAt: '2027-11-09T23:59:59.999Z'
  }
];

/**
 * Check if an email has Pro (paid) status
 * @param {string} email - Lowercase trimmed email
 * @returns {Promise<{ isPro: boolean, verifySource: string, plan?: string, activatedAt?: string, expiresAt?: string|null }>}
 */
export async function checkProStatus(email) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check VVIP members list (with plan & expiry metadata)
  const vvipMember = VVIP_MEMBERS.find(m => m.email === normalizedEmail);
  if (vvipMember) {
    const now = new Date();
    const isExpired = vvipMember.expiresAt !== null && new Date(vvipMember.expiresAt) < now;
    return {
      isPro: !isExpired,
      verifySource: 'whitelist',
      plan: vvipMember.plan,
      activatedAt: vvipMember.activatedAt,
      expiresAt: vvipMember.expiresAt
    };
  }

  // 2. Check hardcoded whitelist (lifetime access, no expiry)
  if (PAID_EMAILS.includes(normalizedEmail)) {
    return { isPro: true, verifySource: 'whitelist', plan: 'lifetime', expiresAt: null };
  }

  // 3. Check Scalev API if configured
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
          return { isPro: true, verifySource: 'scalev_api', plan: 'yearly', expiresAt: null };
        }
      }
    } catch (err) {
      console.error('[check-pro] Scalev API error:', err.message);
    }
  }

  return { isPro: false, verifySource: 'free' };
}
