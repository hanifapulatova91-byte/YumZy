const Profile = require('../models/Profile.model');
const User = require('../models/User.model');

// @desc    Save quiz answers and allergens
// @route   POST /api/profile/quiz
const saveQuiz = async (req, res) => {
  try {
    const { quizAnswers, allergens, customAllergens } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        quizAnswers,
        allergens: allergens || [],
        customAllergens: customAllergens || [],
      },
      { new: true, upsert: true }
    );

    // Mark quiz as completed on User model
    await User.findByIdAndUpdate(req.user._id, { quizCompleted: true });

    res.json({ message: 'Quiz saved successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (allergens)
// @route   PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { allergens, customAllergens } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        allergens: allergens || [],
        customAllergens: customAllergens || [],
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveQuiz, getProfile, updateProfile };
