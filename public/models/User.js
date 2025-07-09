const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Profile sub-schema
const profileSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  avatar: { 
    type: String, 
    required: true,
    default: 'assets/images/avatar1.jpg'
  },
  isChild: { 
    type: Boolean, 
    default: false 
  },
  preferences: {
    language: { 
      type: String, 
      default: 'English' 
    },
    autoPlayNext: { 
      type: Boolean, 
      default: true 
    },
    maturityRating: { 
      type: String, 
      enum: ['All', 'PG', '13+', '18+'],
      default: 'All'
    }
  },
  watchHistory: [{
    contentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Content' 
    },
    watchedAt: { 
      type: Date, 
      default: Date.now 
    },
    progress: {  // Percentage watched (0-100)
      type: Number,
      min: 0,
      max: 100
    }
  }],
  watchlist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Content' 
  }]
}, { _id: false }); // No separate IDs for profiles

// Main user schema
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  profiles: [profileSchema], // Array of profiles
  activeProfile: { 
    type: Number, 
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'digital', 'mobile', null],
    default: null
  },
  paymentDetails: {
    cardNumber: { type: String, select: false },
    digitalWallet: String,
    mobileNumber: String
  },
  lastPaymentDate: Date, // Track last successful payment
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for subscription status
userSchema.virtual('subscriptionStatus').get(async function() {
  if (!this.populated('activeSubscription')) {
    await this.populate('activeSubscription');
  }
  
  if (!this.activeSubscription) return 'Inactive';
  
  if (this.activeSubscription.status === 'Active') {
    return this.activeSubscription.expirationDate > new Date() 
      ? 'Active' 
      : 'Expired';
  }
  
  return this.activeSubscription.status;
});

// Virtual for active subscription
userSchema.virtual('activeSubscription', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
  match: { status: 'Active' }
});

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login on authentication
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Get current plan
userSchema.methods.getCurrentPlan = async function() {
  await this.populate('activeSubscription');
  if (!this.activeSubscription) return null;
  
  return Plan.findOne({ name: this.activeSubscription.plan });
};

// Check if user can create more profiles
userSchema.methods.canAddProfile = async function() {
  const plan = await this.getCurrentPlan();
  if (!plan) return false;
  
  return this.profiles.length < plan.maxProfiles;
};

const User = mongoose.model('User', userSchema);

module.exports = User;