const express = require('express');
const { 
  getChefs, 
  getChef, 
  updateChef, 
  getChefMenus,
  getNearbyChefs
} = require('../controllers/chef.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getChefs);

router.route('/nearby')
  .get(getNearbyChefs);

router.route('/:id')
  .get(getChef)
  .put(protect, updateChef);

router.route('/:id/menus')
  .get(getChefMenus);

module.exports = router;