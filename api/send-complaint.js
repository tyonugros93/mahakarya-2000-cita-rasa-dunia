// Vercel Serverless Function: api/send-complaint.js
// Handles Support & Complaint Ticket Submissions to fazzaraihantechno@gmail.com

let complaintTicketsStore = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(complaintTicketsStore);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, email, key, category, message } = body;

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Nama, Email, dan Detail Pengaduan wajib diisi.'
        });
      }

      const newTicket = {
        ticketId: 'TKT-' + Date.now(),
        name: name.trim(),
        email: email.trim(),
        userKey: key || 'GUEST',
        category: category || 'Pengaduan Umum',
        message: message.trim(),
        recipientEmail: 'fazzaraihantechno@gmail.com',
        status: 'OPEN',
        createdAt: new Date().toISOString()
      };

      complaintTicketsStore.unshift(newTicket);

      return res.status(200).json({
        success: true,
        message: 'Pengaduan berhasil diterima dan diteruskan ke fazzaraihantechno@gmail.com',
        ticket: newTicket
      });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
