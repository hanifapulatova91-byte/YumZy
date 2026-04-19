const { processScan } = require('../services/scan.service');
const { analyzeIngredientImage } = require('../services/ai.service');
const ScanHistory = require('../models/ScanHistory.model');

// @desc    Scan a barcode and analyze product
// @route   POST /api/scan
const scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    const language = req.headers['accept-language'] || 'en';
    // Handle Guest mode (req.user might be undefined)
    const userId = req.user && req.user._id ? req.user._id : null;
    const guestAllergens = req.body.allergens || [];
    
    const result = await processScan(userId, barcode, language, guestAllergens);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Analyze ingredient photo with AI Vision
// @route   POST /api/scan/analyze-image
const analyzeImage = async (req, res) => {
  try {
    const { image, allergens = [], productName } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const analysis = await analyzeIngredientImage(image, allergens);

    res.json({
      found: true,
      product: {
        name: productName || 'Manual Scan',
        brand: 'Analyzed from photo',
        image: null,
        ingredients: analysis.extractedIngredients || 'Read from photo',
      },
      analysis: {
        safe: analysis.safe,
        riskLevel: analysis.riskLevel || (analysis.safe ? 'safe' : 'dangerous'),
        allergenFlags: analysis.allergenFlags || [],
        safeAlternatives: analysis.safeAlternatives || [],
        summary: analysis.summary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scan history for current user
// @route   GET /api/scan/history
const getScanHistory = async (req, res) => {
  try {
    const history = await ScanHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { scanBarcode, analyzeImage, getScanHistory };
