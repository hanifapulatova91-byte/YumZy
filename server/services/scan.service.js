const { getProductByBarcode } = require('./openfoodfacts.service');
const { analyzeProductSafety } = require('./ai.service');
const Profile = require('../models/Profile.model');
const ScanHistory = require('../models/ScanHistory.model');

/**
 * Process a barcode scan: fetch product data, analyze allergens, save to history
 * @param {string} userId - The authenticated user's ID
 * @param {string} barcode - The scanned barcode
 * @returns {Object} Scan result with product info and safety analysis
 */
const processScan = async (userId, barcode, language = 'en', guestAllergens = []) => {
  // 1. Get user's allergy profile (if logged in)
  let profile = { allergens: [] };
  if (userId) {
    profile = await Profile.findOne({ userId }) || { allergens: [] };
  }

  // 2. Fetch product data from Open Food Facts
  const product = await getProductByBarcode(barcode);
  if (!product) {
    return {
      found: false,
      message: language === 'uz' ? 'Mahsulot bazadan topilmadi.' : 'Product not found in database.',
      product: null,
      analysis: null
    };
  }

  // 3. Analyze product safety with AI
  const analysis = await analyzeProductSafety(product, profile, language, guestAllergens);

  // 4. Save to scan history (only for logged-in users)
  let scanId = null;
  if (userId) {
    const scanRecord = await ScanHistory.create({
      userId,
      barcode,
      productName: product.productName,
      productBrand: product.productBrand,
      productImage: product.productImage,
      ingredientsText: product.ingredientsText,
      safe: analysis.safe,
      allergenFlags: analysis.allergenFlags,
      aiSummary: analysis.summary,
    });
    scanId = scanRecord._id;
  }

  return {
    found: true,
    product: {
      name: product.productName,
      brand: product.productBrand,
      image: product.productImage,
      ingredients: product.ingredientsText,
    },
    analysis: {
      safe: analysis.safe,
      riskLevel: analysis.riskLevel || (analysis.safe ? 'safe' : 'dangerous'),
      allergenFlags: analysis.allergenFlags,
      safeAlternatives: analysis.safeAlternatives || [],
      summary: analysis.summary,
    },
    scanId,
  };
};

module.exports = { processScan };
