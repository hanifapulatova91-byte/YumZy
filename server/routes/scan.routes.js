const express = require('express');
const router = express.Router();
const { scanBarcode, getScanHistory } = require('../controllers/scan.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', scanBarcode); // Removed 'protect' so non-logged-in users can scan
router.get('/history', protect, getScanHistory);

module.exports = router;
