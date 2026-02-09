const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  quantityAvailable: {
    type: Number,
    default: null,
    min: 0
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
foodItemSchema.index({ vendor: 1, category: 1 });
foodItemSchema.index({ vendor: 1, isAvailable: 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);

