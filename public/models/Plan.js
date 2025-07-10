const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { 
    type: String, 
    enum: ['Basic', 'Standard', 'Premium'], 
    required: true,
    unique: true
  },
  price: { type: Number, required: true },
  resolution: { type: String, required: true },
  maxProfiles: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);