/**
 * Upstash Redis Store abstraction with in-memory fallback.
 * 
 * Supports environment variables (checked in priority order):
 * 1. UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash standard)
 * 2. KV_REST_API_URL + KV_REST_API_TOKEN (legacy Vercel KV)
 * 3. REDIS_URL (redis:// or rediss:// protocol URL → auto-derives REST endpoint)
 * 
 * Falls back to in-memory Map if no env vars are configured.
 */

// In-memory fallback store
const memoryStore = new Map();

function parseRedisUrl(redisUrl) {
  try {
    // Format: redis://default:<password>@<host>:<port> or rediss://...
    const url = new URL(redisUrl);
    const host = url.hostname; // e.g. "apt-moose-12345.upstash.io"
    const password = url.password || '';
    if (host && password) {
      return {
        url: `https://${host}`,
        token: password
      };
    }
  } catch (e) {
    console.error('[KV] Failed to parse REDIS_URL:', e.message);
  }
  return null;
}

function getKVConfig() {
  // Priority 1: Explicit REST API env vars
  const restUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (restUrl && restToken) {
    return { url: restUrl, token: restToken };
  }

  // Priority 2: Parse from REDIS_URL (redis:// protocol URL)
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (redisUrl) {
    const parsed = parseRedisUrl(redisUrl);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

/**
 * Execute an Upstash Redis REST API command via pipeline
 */
async function kvCommand(args) {
  const config = getKVConfig();
  if (!config) return null;

  try {
    // Upstash REST API: POST to /pipeline with array of commands
    // Single command: POST to / with body as array
    const apiUrl = config.url.replace(/\/+$/, '');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[KV] REST API error:', res.status, errText);
      return null;
    }
    const data = await res.json();
    return data.result !== undefined ? data.result : null;
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
  console.warn('[KV] Using in-memory fallback (no Redis configured)');
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
  console.warn('[KV] Using in-memory fallback (no Redis configured)');
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
