const Chef = require('../models/Chef');
const User = require('../models/User');
const Menu = require('../models/Menu');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all chefs
// @route   GET /api/chefs
// @access  Public
exports.getChefs = async (req, res, next) => {
  try {
    const chefs = await Chef.find()
      .populate({
        path: 'user',
        select: 'name location'
      });

    res.status(200).json({
      success: true,
      count: chefs.length,
      data: chefs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chefs by location (nearby)
// @route   GET /api/chefs/nearby
// @access  Public
exports.getNearbyChefs = async (req, res, next) => {
  try {
    const { lat, lng, distance = 10 } = req.query;

    if (!lat || !lng) {
      return next(new ErrorResponse('Please provide latitude and longitude', 400));
    }

    // Calculate radius using radians
    // Earth radius is 6,378 km
    const radius = distance / 6378;

    // Find users (chefs) within the radius
    const users = await User.find({
      role: 'chef',
      'location.coordinates': {
        $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius] }
      }
    });

    // Get chef profiles for these users
    const chefIds = users.map(user => user._id);
    const chefs = await Chef.find({
      user: { $in: chefIds },
      isActive: true
    }).populate({
      path: 'user',
      select: 'name location'
    });

    res.status(200).json({
      success: true,
      count: chefs.length,
      data: chefs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single chef
// @route   GET /api/chefs/:id
// @access  Public
exports.getChef = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name location'
      })
      .populate('menus');

    if (!chef) {
      return next(new ErrorResponse(`Chef not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: chef
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update chef profile
// @route   PUT /api/chefs/:id
// @access  Private
exports.updateChef = async (req, res, next) => {
  try {
    let chef = await Chef.findById(req.params.id);

    if (!chef) {
      return next(new ErrorResponse(`Chef not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is chef owner
    if (chef.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this profile`,
          401
        )
      );
    }

    chef = await Chef.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: chef
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chef's menu items
// @route   GET /api/chefs/:id/menus
// @access  Public
exports.getChefMenus = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    let query = {
      chef: req.params.id,
      isAvailable: true
    };

    // If date is provided, filter by available date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.availableDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const menus = await Menu.find(query);

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus
    });
  } catch (err) {
    next(err);
  }
};