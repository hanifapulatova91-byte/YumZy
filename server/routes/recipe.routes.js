const express = require('express');
const router = express.Router();
const { createRecipe } = require('../controllers/recipe.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', createRecipe);

module.exports = router;
