const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chef',
      required: true
    },
    items: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Menu',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    deliveryAddress: {
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipcode: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    deliveryOption: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery'
    },
    deliveryInstructions: {
      type: String
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ],
      default: 'pending'
    },
    statusUpdates: [
      {
        status: {
          type: String,
          enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'out_for_delivery',
            'delivered',
            'cancelled'
          ]
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    estimatedDeliveryTime: {
      type: Date
    },
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for frequently queried fields
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ chef: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', OrderSchema);