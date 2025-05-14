const express = require('express');
const { 
  getMenus, 
  getMenu, 
  createMenu, 
  updateMenu, 
  deleteMenu 
} = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getMenus)
  .post(protect, authorize('chef'), createMenu);

router.route('/:id')
  .get(getMenu)
  .put(protect, authorize('chef'), updateMenu)
  .delete(protect, authorize('chef'), deleteMenu);

module.exports = router;