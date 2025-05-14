const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Delivery tracking routes would go here

module.exports = router;