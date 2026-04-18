const express = require('express');
const router = express.Router();
const { saveQuiz, getProfile, updateProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/quiz', protect, saveQuiz);
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);

module.exports = router;
