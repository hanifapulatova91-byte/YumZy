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
const processScan = async (userId, barcode) => {
  // 1. Get user's allergy profile
  const profile = await Profile.findOne({ userId });
  if (!profile) {
    throw new Error('User profile not found. Please complete the allergy quiz first.');
  }

  // 2. Fetch product data from Open Food Facts
  const product = await getProductByBarcode(barcode);
  if (!product) {
    return {
      found: false,
      message: 'Продукт не найден в базе данных. Вы можете ввести состав вручную для проверки.',
      product: null,
      analysis: null
    };
  }

  // 3. Analyze product safety with AI
  const analysis = await analyzeProductSafety(product, profile);

  // 4. Save to scan history
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
      allergenFlags: analysis.allergenFlags,
      summary: analysis.summary,
    },
    scanId: scanRecord._id,
  };
};

module.exports = { processScan };
