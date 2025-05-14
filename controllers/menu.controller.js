const Menu = require('../models/Menu');
const Chef = require('../models/Chef');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new menu item
// @route   POST /api/menus
// @access  Private (Chef only)
exports.createMenu = async (req, res, next) => {
  try {
    // Check if user is a chef
    const chef = await Chef.findOne({ user: req.user.id });
    
    if (!chef) {
      return next(new ErrorResponse(`Only chefs can create menu items`, 403));
    }
    
    // Add chef to request body
    req.body.chef = chef._id;
    
    const menu = await Menu.create(req.body);
    
    res.status(201).json({
      success: true,
      data: menu
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all menu items
// @route   GET /api/menus
// @access  Public
exports.getMenus = async (req, res, next) => {
  try {
    // Build query
    let query = { isAvailable: true };
    
    // Filter by date (today's date by default)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    query.availableDate = {
      $gte: today,
      $lt: tomorrow
    };
    
    // Filter by cuisine, category, dietary preferences if provided
    if (req.query.cuisine) {
      query.cuisine = req.query.cuisine;
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.vegetarian === 'true') {
      query['dietaryInfo.vegetarian'] = true;
    }
    
    if (req.query.vegan === 'true') {
      query['dietaryInfo.vegan'] = true;
    }
    
    if (req.query.glutenFree === 'true') {
      query['dietaryInfo.glutenFree'] = true;
    }
    
    const menus = await Menu.find(query).populate({
      path: 'chef',
      select: 'user rating',
      populate: {
        path: 'user',
        select: 'name location'
      }
    });
    
    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single menu item
// @route   GET /api/menus/:id
// @access  Public
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id).populate({
      path: 'chef',
      select: 'user rating deliveryOptions',
      populate: {
        path: 'user',
        select: 'name location'
      }
    });
    
    if (!menu) {
      return next(new ErrorResponse(`Menu not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update menu item
// @route   PUT /api/menus/:id
// @access  Private (Chef owner only)
exports.updateMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return next(new ErrorResponse(`Menu not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is the chef who created the menu
    const chef = await Chef.findOne({ user: req.user.id });
    
    if (!chef || menu.chef.toString() !== chef._id.toString()) {
      return next(
        new ErrorResponse(
          `User not authorized to update this menu item`,
          401
        )
      );
    }
    
    menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menus/:id
// @access  Private (Chef owner only)
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return next(new ErrorResponse(`Menu not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is the chef who created the menu
    const chef = await Chef.findOne({ user: req.user.id });
    
    if (!chef || menu.chef.toString() !== chef._id.toString()) {
      return next(
        new ErrorResponse(
          `User not authorized to delete this menu item`,
          401
        )
      );
    }
    
    await menu.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};