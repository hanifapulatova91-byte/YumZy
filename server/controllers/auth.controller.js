const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Profile = require('../models/Profile.model');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      password,
    });

    // Create empty profile for the user
    await Profile.create({ userId: user._id });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      quizCompleted: user.quizCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email/username already exists. Please log in instead!' });
    }
    res.status(500).json({ message: error.message || 'Error creating account' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      quizCompleted: user.quizCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user info
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      username: user.username,
      quizCompleted: user.quizCompleted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };
