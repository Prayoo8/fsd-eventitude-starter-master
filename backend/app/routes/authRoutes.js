const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login: POST /login (consistent with test request path)
router.post('/login', authController.login);

// Logout: POST /logout (supplement logout route needed for tests)
router.post('/logout', authController.logout);

module.exports = router;