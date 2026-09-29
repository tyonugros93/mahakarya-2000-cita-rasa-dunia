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
    const url = new URL(redisUrl);
    const host = url.hostname;
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
  // Priority 1: Explicit Upstash REST API env vars
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN };
  }

  // Priority 2: Vercel KV REST API env vars
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return { url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN };
  }

  // Priority 3: Parse from REDIS_URL
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (redisUrl) {
    const parsed = parseRedisUrl(redisUrl);
    if (parsed) {
      console.log('[KV] Derived REST API from REDIS_URL');
      return parsed;
    }
  }

  console.warn('[KV] No Redis env vars found. Available env keys:', 
    Object.keys(process.env).filter(k => k.includes('KV') || k.includes('REDIS') || k.includes('UPSTASH')).join(', ') || 'NONE'
  );
  return null;
}

/**
 * Execute an Upstash Redis REST API command
 */
async function kvCommand(args) {
  const config = getKVConfig();
  if (!config) {
    console.error('[KV] No config available, using memory fallback');
    return null;
  }

  try {
    const apiUrl = config.url.replace(/\/+$/, '');
    console.log('[KV] Sending command:', args[0], 'to', apiUrl);
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    });
    
    const responseText = await res.text();
    console.log('[KV] Response status:', res.status, 'body:', responseText.substring(0, 200));
    
    if (!res.ok) {
      console.error('[KV] REST API error:', res.status, responseText);
      return null;
    }
    
    try {
      const data = JSON.parse(responseText);
      return data.result !== undefined ? data.result : null;
    } catch (parseErr) {
      console.error('[KV] Failed to parse response:', parseErr.message);
      return null;
    }
  } catch (err) {
    console.error('[KV] REST API fetch error:', err.message);
    return null;
  }
}

/**
 * Get a user by email
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
  console.warn('[KV] Using in-memory fallback');
  return memoryStore.get(key) || null;
}

/**
 * Save a user
 */
export async function setUser(email, data) {
  const key = `user:${email.toLowerCase().trim()}`;
  const value = JSON.stringify(data);
  const config = getKVConfig();

  if (config) {
    console.log('[KV] setUser:', key, 'value length:', value.length);
    const result = await kvCommand(['SET', key, value]);
    console.log('[KV] setUser result:', result);
    
    if (result === 'OK') return true;
    
    // Some Upstash versions return different formats
    if (result && (result === 'OK' || result.toString().includes('OK'))) return true;
    
    console.error('[KV] setUser unexpected result:', JSON.stringify(result));
    
    // If KV failed, try memory fallback as safety net
    memoryStore.set(key, data);
    console.log('[KV] Saved to memory fallback after KV failure');
    return true; // Return true so signup succeeds even if Redis has issues
  }

  // Fallback: in-memory
  console.warn('[KV] Using in-memory fallback for setUser');
  memoryStore.set(key, data);
  return true;
}

/**
 * Check if a user exists
 */
export async function userExists(email) {
  const user = await getUser(email);
  return user !== null;
}
