const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Chef = require('../models/Chef');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, deliveryOption, paymentMethod } = req.body;
    
    if (!items || !items.length) {
      return next(new ErrorResponse('Please add items to your order', 400));
    }
    
    // Verify all menu items exist and are available
    const menuIds = items.map(item => item.menu);
    const menuItems = await Menu.find({ _id: { $in: menuIds } });
    
    if (menuItems.length !== menuIds.length) {
      return next(new ErrorResponse('Some menu items are not available', 400));
    }
    
    // Ensure all items are from the same chef
    const chefId = menuItems[0].chef;
    const allSameChef = menuItems.every(item => item.chef.toString() === chefId.toString());
    
    if (!allSameChef) {
      return next(new ErrorResponse('All items must be from the same chef', 400));
    }
    
    // Calculate order totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(m => m._id.toString() === item.menu.toString());
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        menu: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price
      };
    });
    
    // Calculate tax (10%)
    const tax = subtotal * 0.1;
    
    // Calculate delivery fee based on delivery option
    const chef = await Chef.findById(chefId);
    let deliveryFee = 0;
    
    if (deliveryOption === 'delivery' && chef.deliveryOptions.delivery) {
      deliveryFee = 5; // Fixed delivery fee for now
    }
    
    const total = subtotal + tax + deliveryFee;
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      chef: chefId,
      items: orderItems,
      deliveryAddress,
      deliveryOption,
      deliveryInstructions: req.body.deliveryInstructions || '',
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus: 'pending', // Assume payment to be handled later
      statusUpdates: [{ status: 'pending', timestamp: Date.now() }]
    });
    
    // Reduce available quantity for each menu item
    for (const item of items) {
      await Menu.findByIdAndUpdate(item.menu, {
        $inc: { availableQuantity: -item.quantity }
      });
    }
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query = {};
    
    // If user is not admin, they can only see their own orders
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    
    // If user is a chef, they can only see orders for their meals
    if (req.user.role === 'chef') {
      const chef = await Chef.findOne({ user: req.user.id });
      if (chef) {
        query.chef = chef._id;
      } else {
        return next(new ErrorResponse('Chef profile not found', 404));
      }
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.menu',
        select: 'title image'
      })
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'chef',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.menu',
        select: 'title image description'
      })
      .populate({
        path: 'user',
        select: 'name phone'
      })
      .populate({
        path: 'chef',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });
    
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    
    // Check user has permission to view order
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user.id &&
      order.chef.user._id.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to access this order', 401));
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Chef or Admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return next(new ErrorResponse('Please provide a status', 400));
    }
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is the chef for this order or an admin
    let hasPermission = false;
    
    if (req.user.role === 'admin') {
      hasPermission = true;
    } else if (req.user.role === 'chef') {
      const chef = await Chef.findOne({ user: req.user.id });
      if (chef && order.chef.toString() === chef._id.toString()) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to update this order', 401));
    }
    
    // Add status update to history
    order.statusUpdates.push({
      status,
      timestamp: Date.now()
    });
    
    // Update main status
    order.status = status;
    
    // If status is 'delivered', calculate estimated time
    if (status === 'out_for_delivery') {
      const deliveryTime = new Date();
      deliveryTime.setMinutes(deliveryTime.getMinutes() + 30); // 30 minutes delivery time
      order.estimatedDeliveryTime = deliveryTime;
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review to order
// @route   PUT /api/orders/:id/review
// @access  Private (User only)
exports.addOrderReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating) {
      return next(new ErrorResponse('Please provide a rating', 400));
    }
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is the one who placed the order
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to review this order', 401));
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return next(new ErrorResponse('Can only review delivered orders', 400));
    }
    
    // Add review to order
    order.rating = rating;
    order.review = review || '';
    
    await order.save();
    
    // Update chef rating
    const chef = await Chef.findById(order.chef);
    const totalRating = chef.rating * chef.ratingsCount + rating;
    chef.ratingsCount += 1;
    chef.rating = totalRating / chef.ratingsCount;
    
    await chef.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};