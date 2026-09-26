# GitHub Copilot Instructions for "Mahakarya 2.962 Cita Rasa Dunia"

## Project Overview
This project is a high-performance, single-page culinary web encyclopedia featuring 2.000 core world recipes and 1.000 Fullset Business F&B recipes.
- **Tech Stack:** Vanilla HTML5, modern CSS, modular JavaScript (no build step, pure static).
- **Deployment:** Vercel via GitHub `main` branch (`cleanUrls: true`).
- **Data Files:**
  - `recipes-data.js`: Expanded core recipes (2.000 items).
  - `business-menu-data.js`: Business F&B recipes (1.000 items, numbers 2001–3000).
  - `recipe-images.js`: Modular image registry mapping recipe numbers to image asset paths.
  - `index.html`: Main UI with responsive media cards, lazy-loaded thumbnails, and recipe modal.

---

## Thumbnail Image System Architecture

1. **Asset Directory:**
   - All recipe images are stored in `assets/images/recipes/` with naming format: `[4-digit-no]-[slug].jpg` (or `.webp`).
   - Aspect ratio: 1:1 square, optimized high-resolution food photography.

2. **Registry Mapping (`recipe-images.js`):**
   - Every new image must be registered in the `recipeImages` object:
     ```javascript
     const recipeImages = (typeof window !== 'undefined' ? (window.recipeImages = window.recipeImages || {}) : {});
     Object.assign(recipeImages, {
       [recipeNumber]: "assets/images/recipes/[filename].jpg"
     });
     ```
   - Do NOT edit or inject image URLs directly into `recipes-data.js` or `business-menu-data.js` to prevent data corruption.

3. **Graceful Fallback:**
   - `index.html` already contains `renderThumbHtml()` and `renderThumbFallbackHtml()`.
   - Recipes without registered images automatically show an elegant culinary cloche emblem without broken image icons.

---

## Current Progress & Registered Recipes
The following 26 recipes currently have curated studio-grade images:
- **Core Nusantara (15 recipes):**
  - No. 1: Sate Padang Pariaman (`0001-sate-padang.jpg`)
  - No. 2: Sate Maranggi Khas Sunda (`0002-sate-maranggi.jpg`)
  - No. 3: Sate Ayam Madura Bumbu Kacang (`0003-sate-ayam-madura.jpg`)
  - No. 4: Sate Kambing Muda Bumbu Kecap (`0004-sate-kambing-muda.jpg`)
  - No. 5: Iga Bakar Kecap Rempah (`0005-iga-bakar-kecap-rempah.jpg`)
  - No. 6: Sate Lilit Ikan Khas Bali (`0006-sate-lilit-bali.jpg`)
  - No. 7: Sate Klatak Khas Bantul, Yogyakarta (`0007-sate-klatak-bantul.jpg`)
  - No. 9: Ayam Bakar Taliwang Khas Lombok (`0009-ayam-taliwang.jpg`)
  - No. 11: Rendang Daging Minangkabau Asli (`0011-rendang-minang.jpg`)
  - No. 13: Ayam Pop Khas Bukittinggi (`0013-ayam-pop.jpg`)
  - No. 14: Dendeng Batokok Lado Mudo (`0014-dendeng-batokok.jpg`)
  - No. 20: Telur Dadar Padang Spesial (`0020-telur-dadar-padang.jpg`)
  - No. 21: Soto Lamongan Koya Gurih (`0021-soto-lamongan.jpg`)
  - No. 23: Sup Buntut Sapi Premium (`0023-sup-buntut.jpg`)
  - No. 27: Rawon Setan Khas Surabaya (`0027-rawon-surabaya.jpg`)
- **Business F&B - Fine Dining (11 recipes):**
  - No. 2001: Truffle Mushroom Arancini with Saffron Aioli (`2001-truffle-arancini.jpg`)
  - No. 2002: Wagyu Beef Carpaccio (`2002-wagyu-carpaccio.jpg`)
  - No. 2003: Pan-Seared Hokkaido Scallop with Citrus Beurre Blanc (`2003-hokkaido-scallop.jpg`)
  - No. 2004: Classic French Onion Soup (`2004-french-onion-soup.jpg`)
  - No. 2005: Velvety Lobster Bisque (`2005-lobster-bisque.jpg`)
  - No. 2006: Classic Beef Wellington (`2006-beef-wellington.jpg`)
  - No. 2008: Herb-Crusted Rack of Lamb with Mint Pea Purée (`2008-rack-of-lamb.jpg`)
  - No. 2009: Miso-Glazed Chilean Sea Bass (`2009-miso-sea-bass.jpg`)
  - No. 2012: Squid Ink Risotto with Butter Poached Prawns (`2012-squid-ink-risotto.jpg`)
  - No. 2016: Classic Vanilla Bean Crème Brûlée (`2016-creme-brulee.jpg`)
  - No. 2017: Valrhona Dark Chocolate Fondant Lava Cake (`2017-chocolate-lava-cake.jpg`)

---

## Strict Rules for Continuation

1. **Attention to Detail:**
   - Food imagery must strictly and authentically reflect the Indonesian or international dish title, ingredients, and presentation specified in the recipe data.
2. **Local Development First (DO NOT PUSH YET):**
   - The user has instructed: **DO NOT deploy or push to GitHub/Vercel** until all batches are completed and approved locally.
   - Run and preview via local web server (e.g., port 3000: `python -m http.server 3000` or `npx serve`).
3. **Next Priority Batches:**
   - Nusantara signatures: No. 4 (Sate Kambing Muda), No. 5 (Iga Bakar Kecap Rempah), No. 7 (Sate Klatak), No. 8 (Sate Buntel Solo), No. 9 (Ayam Taliwang Lombok), No. 10 (Sate Taichan), No. 12 (Gulai Tunjang), No. 13 (Ayam Pop Bukittinggi), No. 14 (Dendeng Batokok Lado Mudo), No. 20 (Telur Dadar Padang), No. 23 (Sup Buntut Sapi Premium).
   - Business F&B signatures: No. 2001 (Truffle Mushroom Arancini), No. 2007 (Duck Breast Cherry Balsamic), No. 2008 (Rack of Lamb Mint Pea Purée), No. 2009 (Miso Chilean Sea Bass), No. 2010 (Lobster Thermidor), No. 2012 (Squid Ink Risotto), No. 2017 (Valrhona Chocolate Lava Cake).
