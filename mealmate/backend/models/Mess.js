const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Mess name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    whatsapp: String
  },
  images: [String],
  coverImage: String,
  cuisine: [{
    type: String,
    enum: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Street Food', 'Veg Only', 'Non-Veg Available', 'Jain Food']
  }],
  mealTypes: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner']
  }],
  timing: {
    breakfast: { open: String, close: String },
    lunch: { open: String, close: String },
    dinner: { open: String, close: String }
  },
  pricing: {
    breakfast: Number,
    lunch: Number,
    dinner: Number,
    monthly: Number
  },
  amenities: [String],
  isVeg: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { timestamps: true });

// Index for search
messSchema.index({ name: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Mess', messSchema);
