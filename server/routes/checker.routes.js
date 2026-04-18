const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../services/ai.service');
const { protect } = require('../middleware/auth.middleware');

// @desc    Analyze symptoms to suggest potential allergens
// @route   POST /api/checker/analyze
router.post('/analyze', protect, async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms description is required' });
    }

    const result = await analyzeSymptoms(symptoms);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
