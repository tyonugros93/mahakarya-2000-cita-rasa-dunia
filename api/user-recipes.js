// Vercel Serverless Function: api/user-recipes.js
// Storage & Retrieval API for User-Contributed Community Recipes

let communityRecipesStore = [];

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
      return res.status(200).json({
        success: true,
        count: communityRecipesStore.length,
        recipes: communityRecipesStore
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, chapter, time, serve, mainIngredients, spices, sauce, steps, image, nutrition, author } = body;

      if (!title || !mainIngredients || !steps) {
        return res.status(400).json({
          success: false,
          message: 'Judul, Bahan Utama, dan Langkah Memasak wajib diisi.'
        });
      }

      const newRecipe = {
        no: 9000 + communityRecipesStore.length + 1,
        title: title.trim(),
        cat: 'Ditambahkan oleh Pengguna',
        chapter: chapter || 12,
        time: time || '30 Menit',
        serve: serve || '4 Porsi',
        desc: `Resep kreasi komunitas oleh ${author || 'Member Pro'}.`,
        mainIngredients: mainIngredients,
        spices: spices || '',
        sauce: sauce || '',
        steps: steps,
        nutrition: nutrition || [],
        image: image || '',
        isUserCreated: true,
        author: author || 'Member Pro',
        createdAt: new Date().toISOString()
      };

      communityRecipesStore.unshift(newRecipe);

      return res.status(200).json({
        success: true,
        message: 'Resep baru berhasil diterbitkan!',
        recipe: newRecipe
      });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
