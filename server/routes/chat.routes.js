const express = require('express');
const router = express.Router();
const { converseAI } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', converseAI);

module.exports = router;
