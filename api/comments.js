// Vercel Serverless Function: api/comments.js
// Likes & Comments API for All Recipes (Core & User Contributed)

let commentsStore = {};
let likesStore = {};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, recipeNo, name, comment } = req.method === 'POST' 
      ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) 
      : req.query;

    const no = (recipeNo || '1').toString();

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        recipeNo: no,
        likes: likesStore[no] || 12,
        comments: commentsStore[no] || []
      });
    }

    if (req.method === 'POST') {
      if (action === 'like') {
        likesStore[no] = (likesStore[no] || 12) + 1;
        return res.status(200).json({
          success: true,
          recipeNo: no,
          likes: likesStore[no]
        });
      }

      if (action === 'comment') {
        if (!comment) {
          return res.status(400).json({ success: false, message: 'Komentar tidak boleh kosong.' });
        }

        const newComment = {
          id: 'c-' + Math.random().toString(36).substring(2, 8),
          name: (name || 'Member Pro').trim(),
          comment: comment.trim(),
          date: new Date().toISOString()
        };

        if (!commentsStore[no]) commentsStore[no] = [];
        commentsStore[no].unshift(newComment);

        return res.status(200).json({
          success: true,
          message: 'Komentar berhasil dikirim!',
          comment: newComment,
          comments: commentsStore[no]
        });
      }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
