const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register user (POST /users, no authentication required)
router.post('/', userController.register);

module.exports = router; // Must export router for server.js registration