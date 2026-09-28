// Vercel Serverless Function: api/auth-user.js
// Handles Google Sign-In verification against Scalev Paid Whitelist & Scalev API

import { checkProStatus } from './lib/check-pro.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : req.query;
    const email = (body?.email || '').toString().trim().toLowerCase();
    const name = (body?.name || email.split('@')[0] || 'User').toString().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak boleh kosong.'
      });
    }

    const { isPro, verifySource } = await checkProStatus(email);

    return res.status(200).json({
      success: true,
      user: {
        email: email,
        name: name,
        isPro: isPro,
        verifySource: verifySource
      },
      message: isPro 
        ? `🎉 Welcome, ${name}! Akun Google Anda terverifikasi Member Pro VVIP.` 
        : `🎉 Welcome, ${name}! Login Google Berhasil (Member Gratis).`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server autentikasi: ' + error.message
    });
  }
}
