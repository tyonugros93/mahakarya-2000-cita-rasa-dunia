/**
 * Registry Pemetaan Gambar Mini (Thumbnail) Resep
 * Mahakarya Cita Rasa Dunia & Fullset Menu Business F&B
 */
const recipeImages = (typeof window !== 'undefined' ? (window.recipeImages = window.recipeImages || {}) : {});

Object.assign(recipeImages, {
  // Bab 1: Eksotika Nusantara
  1: "assets/images/recipes/0001-sate-padang.jpg",
  2: "assets/images/recipes/0002-sate-maranggi.jpg",
  3: "assets/images/recipes/0003-sate-ayam-madura.jpg",
  4: "assets/images/recipes/0004-sate-kambing-muda.jpg",
  5: "assets/images/recipes/0005-iga-bakar-kecap-rempah.jpg",
  6: "assets/images/recipes/0006-sate-lilit-bali.jpg",
  7: "assets/images/recipes/0007-sate-klatak-bantul.jpg",
  8: "assets/images/recipes/0008-sate-buntel.jpg",
  9: "assets/images/recipes/0009-ayam-taliwang.jpg",
  10: "assets/images/recipes/0010-sate-taichan.jpg",
  11: "assets/images/recipes/0011-rendang-minang.jpg",
  12: "assets/images/recipes/0012-gulai-tunjang.jpg",
  13: "assets/images/recipes/0013-ayam-pop.jpg",
  14: "assets/images/recipes/0014-dendeng-batokok.jpg",
  15: "assets/images/recipes/0015-gulai-cincang.jpg",
  16: "assets/images/recipes/0016-gulai-tambusu.jpg",
  17: "assets/images/recipes/0017-itik-lado-mudo.jpg",
  18: "assets/images/recipes/0018-asam-padeh-ikan.jpg",
  19: "assets/images/recipes/0019-gulai-kepala-kakap.jpg",
  20: "assets/images/recipes/0020-telur-dadar-padang.jpg",
  21: "assets/images/recipes/0021-soto-lamongan.jpg",
  22: "assets/images/recipes/0022-coto-makassar.jpg",
  23: "assets/images/recipes/0023-sup-buntut.jpg",
  24: "assets/images/recipes/0024-pindang-tulang-iga.jpg",
  25: "assets/images/recipes/0025-empal-gentong.jpg",
  26: "assets/images/recipes/0026-soto-mie-bogor.jpg",
  27: "assets/images/recipes/0027-rawon-surabaya.jpg",
  28: "assets/images/recipes/0028-sup-kimlo-solo.jpg",

  // Modul Fullset Menu Business F&B (Fine Dining)
  2001: "assets/images/recipes/2001-truffle-arancini.jpg",
  2002: "assets/images/recipes/2002-wagyu-carpaccio.jpg",
  2003: "assets/images/recipes/2003-hokkaido-scallop.jpg",
  2004: "assets/images/recipes/2004-french-onion-soup.jpg",
  2005: "assets/images/recipes/2005-lobster-bisque.jpg",
  2006: "assets/images/recipes/2006-beef-wellington.jpg",
  2007: "assets/images/recipes/2007-duck-breast.jpg",

  2008: "assets/images/recipes/2008-rack-of-lamb.jpg",
  2009: "assets/images/recipes/2009-miso-sea-bass.jpg",
  2010: "assets/images/recipes/2010-lobster-thermidor.jpg",
  2011: "assets/images/recipes/2011-sous-vide-chicken-supreme.jpg",
  2012: "assets/images/recipes/2012-squid-ink-risotto.jpg",
  2013: "assets/images/recipes/2013-seared-halibut-saffron.jpg",
  2014: "assets/images/recipes/2014-osso-buco-risotto.jpg",
  2015: "assets/images/recipes/2015-truffle-ricotta-ravioli.jpg",
  2016: "assets/images/recipes/2016-creme-brulee.jpg",
  2017: "assets/images/recipes/2017-chocolate-lava-cake.jpg",

  // Modul Chinese Restaurant (Fine Dining Chinese)
  2251: "assets/images/recipes/2251-herbal-abalone.jpg",
  2252: "assets/images/recipes/2252-jellyfish-smoked-duck-salad.jpg",
  2253: "assets/images/recipes/2253-wagyu-taro-puff.jpg",
  2254: "assets/images/recipes/2254-imperial-har-gow.jpg",
  2255: "assets/images/recipes/2255-scallop-tobiko-siu-mai.jpg",
  2256: "assets/images/recipes/2256-kou-shui-ji.jpg",
  2257: "assets/images/recipes/2257-fish-maw-crab-soup.jpg",
  2258: "assets/images/recipes/2258-black-chicken-cordyceps-soup.jpg",
  2259: "assets/images/recipes/2259-hot-sour-sea-cucumber-soup.jpg",
  2260: "assets/images/recipes/2260-crispy-prawn-wasabi-mango.jpg",
  2261: "assets/images/recipes/2261-imperial-peking-duck.jpg",
  2262: "assets/images/recipes/2262-braised-abalone-sea-cucumber.jpg",
  2263: "assets/images/recipes/2263-wok-wagyu-pepper-foie-gras.jpg",
  2264: "assets/images/recipes/2264-steamed-soon-hock-fish.jpg",
  2265: "assets/images/recipes/2265-typhoon-shelter-lobster.jpg"
});

/**
 * Mendapatkan URL gambar berdasarkan nomor resep
 * @param {number|string} no 
 * @returns {string|null}
 */
function getRecipeImage(no) {
  return recipeImages[Number(no)] || null;
}

if (typeof window !== 'undefined') {
  window.getRecipeImage = getRecipeImage;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { recipeImages, getRecipeImage };
}
