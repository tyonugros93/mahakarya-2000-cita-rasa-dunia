// Vercel Serverless Function: api/auth-signup.js
// Handles manual email/password registration

import { hashPassword } from './lib/password.js';
import { getUser, setUser } from './lib/kv-store.js';
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
    const name = (body?.name || '').toString().trim();
    const password = (body?.password || '').toString();

    // Validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Format email tidak valid.'
      });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Nama lengkap wajib diisi (minimal 2 karakter).'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Password minimal 6 karakter.'
      });
    }

    // Check if email already registered
    const existingUser = await getUser(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '⚠️ Email ini sudah terdaftar. Silakan gunakan menu "Masuk" untuk login.'
      });
    }

    // Hash password
    const { hash, salt } = hashPassword(password);

    // Save user to KV
    const userData = {
      email,
      name,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString()
    };

    const saved = await setUser(email, userData);
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan akun. Silakan coba lagi.'
      });
    }

    // Check Pro status
    const { isPro, verifySource } = await checkProStatus(email);

    return res.status(201).json({
      success: true,
      user: {
        email,
        name,
        isPro,
        verifySource
      },
      message: isPro
        ? `🎉 Selamat, ${name}! Akun berhasil dibuat & terverifikasi sebagai Member Pro VVIP.`
        : `🎉 Selamat, ${name}! Akun berhasil dibuat. Anda login sebagai Member Free.`
    });

  } catch (error) {
    console.error('[auth-signup] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
}
