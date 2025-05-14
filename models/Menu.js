const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
  {
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chef',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    image: {
      type: String
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'breakfast',
        'lunch',
        'dinner',
        'snacks',
        'dessert',
        'beverage',
        'other'
      ]
    },
    cuisine: {
      type: String,
      required: [true, 'Please add a cuisine type']
    },
    dietaryInfo: {
      vegetarian: {
        type: Boolean,
        default: false
      },
      vegan: {
        type: Boolean,
        default: false
      },
      glutenFree: {
        type: Boolean,
        default: false
      },
      dairyFree: {
        type: Boolean,
        default: false
      },
      nutFree: {
        type: Boolean,
        default: false
      }
    },
    ingredients: [String],
    preparationTime: {
      type: Number,
      required: [true, 'Please add preparation time in minutes']
    },
    availableDate: {
      type: Date,
      required: [true, 'Please add an available date']
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please add an available quantity']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create a compound index for chef and availableDate
MenuSchema.index({ chef: 1, availableDate: 1 });

module.exports = mongoose.model('Menu', MenuSchema);