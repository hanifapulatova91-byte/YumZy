const express = require('express');
const router = express.Router();
const { scanBarcode, analyzeImage, getScanHistory } = require('../controllers/scan.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', scanBarcode);
router.post('/analyze-image', analyzeImage);
router.get('/history', protect, getScanHistory);

module.exports = router;
