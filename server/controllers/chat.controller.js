const { chatWithAI } = require('../services/ai.service');
const Profile = require('../models/Profile.model');

// @desc    Chat with AI securely aware of profile
// @route   POST /api/chat
const converseAI = async (req, res) => {
  try {
    const { message, allergens: bodyAllergens } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Build allergen context from both profile (if logged in) and request body
    let profile = {};
    if (req.user && req.user._id) {
       profile = await Profile.findOne({ userId: req.user._id }) || {};
    }
    
    // Merge: use body allergens if profile has none (guest mode)
    if (bodyAllergens && bodyAllergens.length > 0) {
      profile.allergens = [...new Set([...(profile.allergens || []), ...bodyAllergens])];
    }
    
    const language = req.headers['accept-language'] || 'en';
    const replyData = await chatWithAI(message, profile, language);

    res.json(replyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { converseAI };
