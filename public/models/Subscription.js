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
    paymentDetails: {
        identifier: { type: String, required: true },
        // For cards
        cardHolder: String,
        cardLast4: String,
        cardBrand: String,
        expiry: String,
        // For digital/mobile
        countryCode: String,
        phoneNumber: String
    },
    autoRenew: { type: Boolean, default: true }
});

// Add index for payment identifier to speed up duplicate checks
subscriptionSchema.index({ 'paymentDetails.identifier': 1 });

// Add index for expiration and status
subscriptionSchema.index({ expirationDate: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);