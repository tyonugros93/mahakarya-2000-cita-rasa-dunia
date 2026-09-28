// Vercel Serverless Function: api/auth-signin.js
// Handles manual email/password login

import { verifyPassword } from './lib/password.js';
import { getUser } from './lib/kv-store.js';
import { checkProStatus } from './lib/check-pro.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = (body?.email || '').toString().trim().toLowerCase();
    const password = (body?.password || '').toString();

    // Validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Email wajib diisi.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Password wajib diisi.'
      });
    }

    // Lookup user
    const user = await getUser(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '⚠️ Email belum terdaftar. Silakan buat akun terlebih dahulu.'
      });
    }

    // Verify password
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '⚠️ Password salah. Silakan coba lagi.'
      });
    }

    // Check Pro status (re-check every login for fresh Scalev data)
    const { isPro, verifySource } = await checkProStatus(email);

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        isPro,
        verifySource
      },
      message: isPro
        ? `🎉 Welcome back, ${user.name}! Anda terverifikasi sebagai Member Pro VVIP.`
        : `🎉 Welcome back, ${user.name}! Login berhasil.`
    });

  } catch (error) {
    console.error('[auth-signin] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
}
