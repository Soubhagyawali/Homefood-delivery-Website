const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User profile routes would go here

module.exports = router;