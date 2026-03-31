const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  isVeg: { type: Boolean, default: true },
  calories: Number,
  allergens: [String]
});

const menuSchema = new mongoose.Schema({
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  items: [menuItemSchema],
  image: String,
  price: Number,
  isSpecial: {
    type: Boolean,
    default: false
  },
  specialNote: String,
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Compound index: one menu per mess per date per meal type
menuSchema.index({ mess: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);
