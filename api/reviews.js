// Vercel Serverless Function: api/reviews.js
// Storage & Raw Data Backend for User Rating Reviews & NPS Survey Responses

let reviewsStore = [
  {
    id: 'rev-101',
    name: 'Chef Amanda Putri',
    rating: 5,
    review: 'Koleksi resepnya sangat luar biasa lengkap! Fitur kalkulator porsi catering dan PDF Generator HD sangat membantu operasional resto saya.',
    npsRecommend: 'Ya',
    date: '2026-09-25T10:30:00Z'
  },
  {
    id: 'rev-102',
    name: 'Ibu Rahmawati',
    rating: 5,
    review: 'Resep Nusantara otentik banget, bumbu rasio gramasinya pas. Sangat merekomendasikan e-book digital ini!',
    npsRecommend: 'Ya',
    date: '2026-09-26T14:15:00Z'
  },
  {
    id: 'rev-103',
    name: 'Budi Santoso (Owner Cafe)',
    rating: 5,
    review: 'Fitur Fullset Menu Business F&B langsung saya pakai untuk susun menu cafe baru. Nilai 10/10!',
    npsRecommend: 'Ya',
    date: '2026-09-27T08:20:00Z'
  }
];

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
      const total = reviewsStore.length;
      const rating5Count = reviewsStore.filter(r => r.rating === 5).length;
      const rating1Count = reviewsStore.filter(r => r.rating === 1).length;
      const npsScore = total > 0 ? Math.round(((rating5Count - rating1Count) / total) * 100) : 0;
      const avgRating = total > 0 ? (reviewsStore.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '5.0';

      return res.status(200).json({
        success: true,
        summary: {
          totalReviews: total,
          avgRating: parseFloat(avgRating),
          rating5Count: rating5Count,
          rating1Count: rating1Count,
          npsScore: npsScore + '%'
        },
        reviews: reviewsStore
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, rating, review, npsRecommend } = body;

      if (!rating || !review) {
        return res.status(400).json({
          success: false,
          message: 'Rating dan ulasan wajib diisi.'
        });
      }

      const newReview = {
        id: 'rev-' + Math.random().toString(36).substring(2, 8),
        name: (name || 'Pengguna Mahakarya').trim(),
        rating: parseInt(rating) || 5,
        review: review.trim(),
        npsRecommend: npsRecommend || 'Ya',
        date: new Date().toISOString()
      };

      reviewsStore.unshift(newReview);

      return res.status(200).json({
        success: true,
        message: 'Terima kasih! Ulasan dan penilaian Anda berhasil terkirim.',
        review: newReview
      });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
