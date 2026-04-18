const express = require('express');
const router = express.Router();
const { createRecipe } = require('../controllers/recipe.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, createRecipe);

module.exports = router;
