const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrderStatus,
  addOrderReview
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, authorize('chef', 'admin'), updateOrderStatus);

router.route('/:id/review')
  .put(protect, authorize('user'), addOrderReview);

module.exports = router;