const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    plan: { 
        type: String, 
        enum: ['Basic', 'Standard', 'Premium'], 
        required: true 
    },
    price: { type: Number, required: true },
    dateSubscribed: { type: Date, default: Date.now },
    expirationDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Active', 'Expired', 'Cancelled'], 
        default: 'Active' 
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'digital', 'mobile'],
        required: true
    },
    
    autoRenew: { type: Boolean, default: true }
});

// Add index for expiration and status
subscriptionSchema.index({ expirationDate: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);