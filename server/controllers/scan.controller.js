const { processScan } = require('../services/scan.service');
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
    const result = await processScan(req.user._id, barcode, language);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

module.exports = { scanBarcode, getScanHistory };
