/**
 * Vercel KV Store abstraction with in-memory fallback.
 * 
 * If KV_REST_API_URL and KV_REST_API_TOKEN env vars are set (from Vercel KV),
 * uses the Vercel KV REST API for persistent storage.
 * Otherwise, falls back to an in-memory Map (data lost on cold start).
 */

// In-memory fallback store
const memoryStore = new Map();

function getKVConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return (url && token) ? { url, token } : null;
}

/**
 * Execute a Vercel KV REST API command
 */
async function kvCommand(args) {
  const config = getKVConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    });
    if (!res.ok) {
      console.error('[KV] REST API error:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error('[KV] REST API fetch error:', err.message);
    return null;
  }
}

/**
 * Get a user by email
 * @param {string} email
 * @returns {Promise<object|null>} User data or null
 */
export async function getUser(email) {
  const key = `user:${email.toLowerCase().trim()}`;
  const config = getKVConfig();

  if (config) {
    const result = await kvCommand(['GET', key]);
    if (result) {
      try {
        return typeof result === 'string' ? JSON.parse(result) : result;
      } catch (e) {
        return result;
      }
    }
    return null;
  }

  // Fallback: in-memory
  console.warn('[KV] Using in-memory fallback (no Vercel KV configured)');
  return memoryStore.get(key) || null;
}

/**
 * Save a user
 * @param {string} email
 * @param {object} data - User data to store
 * @returns {Promise<boolean>} success
 */
export async function setUser(email, data) {
  const key = `user:${email.toLowerCase().trim()}`;
  const value = JSON.stringify(data);
  const config = getKVConfig();

  if (config) {
    const result = await kvCommand(['SET', key, value]);
    return result === 'OK';
  }

  // Fallback: in-memory
  console.warn('[KV] Using in-memory fallback (no Vercel KV configured)');
  memoryStore.set(key, data);
  return true;
}

/**
 * Check if a user exists
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function userExists(email) {
  const user = await getUser(email);
  return user !== null;
}
