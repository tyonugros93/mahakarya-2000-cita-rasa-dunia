/**
 * Vercel Serverless Function: /api/send-complaint
 * 
 * Sends complaint/feedback emails via Resend API.
 * Requires RESEND_API_KEY environment variable for email delivery.
 * Falls back to server logging if no API key is configured.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, category, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan detail pengaduan wajib diisi.' });
    }

    const ticketId = 'TKT-' + Date.now();
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.COMPLAINT_EMAIL || 'fazzaraihantechno@gmail.com';

    if (resendApiKey) {
      // Send via Resend API (free tier: 100 emails/day)
      const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #112d3b 0%, #0a1c25 100%); color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; color: #f0b75f; font-size: 18px;">Pengaduan Layanan Pelanggan</h2>
            <p style="margin: 4px 0 0; color: #9eb1b5; font-size: 12px;">Mahakarya 2.962 Cita Rasa Dunia &middot; Ticket ${ticketId}</p>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Nama Lengkap</td>
                <td style="padding: 8px 0; color: #1e293b;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email Pengirim</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0f766e;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Kategori</td>
                <td style="padding: 8px 0;"><span style="background: #f0b75f; color: #112d3b; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${category || 'Umum'}</span></td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 16px 0;">
            <p style="color: #64748b; font-weight: 600; font-size: 13px; margin: 0 0 8px;">Detail Pengaduan:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 16px; text-align: center;">Dikirim otomatis dari platform Mahakarya 2.962 Cita Rasa Dunia</p>
          </div>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Mahakarya Support <onboarding@resend.dev>',
          to: [recipientEmail],
          reply_to: email,
          subject: `[PENGADUAN] ${category || 'Umum'} - ${name} (${ticketId})`,
          html: emailHtml
        })
      });

      if (resendRes.ok) {
        const data = await resendRes.json();
        console.log('[send-complaint] Email sent via Resend:', data.id);
        return res.status(200).json({
          success: true,
          sent: true,
          message: 'Pengaduan berhasil dikirim ke email Customer Service.',
          ticketId
        });
      } else {
        const errText = await resendRes.text();
        console.error('[send-complaint] Resend API error:', resendRes.status, errText);
      }
    }

    // Fallback: Log complaint when no email API key
    console.log('[send-complaint] COMPLAINT LOGGED:', JSON.stringify({ ticketId, name, email, category, message }));
    return res.status(200).json({
      success: true,
      sent: false,
      message: 'Pengaduan berhasil diterima.',
      ticketId,
      note: 'Email API belum dikonfigurasi.'
    });

  } catch (err) {
    console.error('[send-complaint] Error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  }
}
