const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  subscriptionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subscription', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: Number, required: true },
  plan: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ['card', 'digital', 'mobile'],
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  isMock: { type: Boolean, default: true } // Flag for mock transactions
});

module.exports = mongoose.model('Revenue', revenueSchema);