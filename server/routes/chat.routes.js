const express = require('express');
const router = express.Router();
const { converseAI } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, converseAI);

module.exports = router;
