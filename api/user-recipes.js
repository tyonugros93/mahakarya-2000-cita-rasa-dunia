// Vercel Serverless Function: api/user-recipes.js
// Storage & Retrieval API for User-Contributed Community Recipes

let communityRecipesStore = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(communityRecipesStore);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { no, id, title, chapter, cat, time, serve, mainIngredients, spices, sauce, steps, image, thumb, nutrition, author, authorEmail, creatorKey } = body;

      if (!title || !mainIngredients || !steps) {
        return res.status(400).json({
          success: false,
          message: 'Judul, Bahan Utama, dan Langkah Memasak wajib diisi.'
        });
      }

      const newRecipe = {
        no: no || id || ('USER-' + Date.now()),
        id: id || no || ('USER-' + Date.now()),
        title: title.trim(),
        cat: 'Ditambahkan oleh Pengguna',
        chapter: chapter || 99,
        time: time || '30 Menit',
        serve: serve || '4 Porsi',
        desc: `Resep kreasi komunitas oleh ${author || 'Member Pro'}.`,
        mainIngredients: mainIngredients,
        spices: spices || '',
        sauce: sauce || '',
        steps: steps,
        nutrition: nutrition || [],
        thumb: thumb || image || '',
        image: image || thumb || '',
        isUserContributed: true,
        isUserCreated: true,
        author: author || 'Member Pro',
        authorEmail: authorEmail || '',
        creatorKey: creatorKey || '',
        createdAt: new Date().toISOString()
      };

      // Avoid duplicates
      communityRecipesStore = communityRecipesStore.filter(r => String(r.no || r.id) !== String(newRecipe.no));
      communityRecipesStore.unshift(newRecipe);

      return res.status(200).json({
        success: true,
        message: 'Resep baru berhasil diterbitkan!',
        recipe: newRecipe
      });
    }

    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { recipeId, userKey } = body;

      if (!recipeId) {
        return res.status(400).json({ success: false, message: 'recipeId wajib diisi.' });
      }

      const isOwner = userKey === '328473846878213218FRAJ';
      communityRecipesStore = communityRecipesStore.filter(r => {
        const matchesId = String(r.no) === String(recipeId) || String(r.id) === String(recipeId);
        if (matchesId) {
          const canDelete = isOwner || (userKey && (r.creatorKey === userKey || r.authorEmail === userKey));
          return !canDelete; // Delete matching recipe
        }
        return true;
      });

      return res.status(200).json({
        success: true,
        message: 'Resep berhasil dihapus dari server!'
      });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
