const mongoose = require('mongoose');

const ChefSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bio: {
      type: String,
      required: [true, 'Please add a bio'],
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    specialties: [String],
    profileImage: {
      type: String
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deliveryOptions: {
      delivery: {
        type: Boolean,
        default: true
      },
      pickup: {
        type: Boolean,
        default: true
      }
    },
    serviceRadius: {
      type: Number,
      default: 10,
      description: 'Service radius in kilometers'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Reverse populate with virtuals
ChefSchema.virtual('menus', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'chef',
  justOne: false
});

ChefSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'chef',
  justOne: false
});

module.exports = mongoose.model('Chef', ChefSchema);