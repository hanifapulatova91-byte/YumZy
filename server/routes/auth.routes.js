const express = require('express');
const router = express.Router();
const { register, login, getMe, updateName, dangerResetDatabase } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/name', protect, updateName);
router.get('/reset-everything-danger-zone', dangerResetDatabase);

module.exports = router;
