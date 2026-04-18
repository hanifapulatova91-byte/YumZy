const { generateRecipe } = require('../services/ai.service');
const Profile = require('../models/Profile.model');

// @desc    Generate a safe recipe based on ingredients and user allergies
// @route   POST /api/recipes/generate
const createRecipe = async (req, res) => {
  try {
    const { ingredients, language } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of ingredients' });
    }

    // Get user's allergy profile
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ message: 'Profile not found. Please complete the allergy quiz first.' });
    }

    const recipe = await generateRecipe(ingredients, profile, language || 'ru');
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRecipe };
