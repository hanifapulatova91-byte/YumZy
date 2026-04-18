const { chatWithAI } = require('../services/ai.service');
const Profile = require('../models/Profile.model');

// @desc    Chat with AI securely aware of profile
// @route   POST /api/chat
const converseAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    
    // We can proceed even if profile is missing, as chatWithAI handles undefined profile
    const language = req.headers['accept-language'] || 'en';
    const replyData = await chatWithAI(message, profile || {}, language);

    res.json(replyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { converseAI };
