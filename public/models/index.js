const mongoose = require('mongoose');

// Episode Schema
const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  thumbnail: {
    type: String, // R2 URL
    default: null
  },
  videoUrl: {
    type: String, // R2 URL
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  episodeNumber: {
    type: Number,
    required: true
  },
  seasonNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Content Schema (Movies & Series)
const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Movie', 'Series'],
    required: true
  },
  studio: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', '18+'],
    required: true
  },
  genres: [{
    type: String,
    required: true
  }],
  posters: [{
    type: String // R2 URLs
  }],
  thumbnail: {
    type: String, // R2 URL
    default: null
  },
  trailerUrl: {
    type: String, // R2 URL
    required: true
  },
  // For Movies only
  movieUrl: {
    type: String, // R2 URL
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  // For Series only
  episodes: [episodeSchema],
  totalSeasons: {
    type: Number,
    default: 1
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  subscription: {
    type: String,
    enum: ['Free', 'Basic', 'Standard', 'Premium'],
    default: 'Free'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  // Analytics
  totalWatchTime: {
    type: Number, // in minutes
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
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
    progress: {
      type: Number, // percentage watched
      default: 0
    }
  }],
  favoriteContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }]
}, {
  timestamps: true
});

// Subscription Plan Schema
const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in days
    required: true
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  totalContent: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  subscriptionCounts: {
    free: { type: Number, default: 0 },
    basic: { type: Number, default: 0 },
    standard: { type: Number, default: 0 },
    premium: { type: Number, default: 0 }
  },
  contentCounts: {
    movies: { type: Number, default: 0 },
    series: { type: Number, default: 0 },
    episodes: { type: Number, default: 0 }
  },
  topContent: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    views: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    }
  }],
  popularGenres: [{
    genre: String,
    count: Number
  }]
}, {
  timestamps: true
});

// Create Models
const Content = mongoose.model('Content', contentSchema);
const User = mongoose.model('User', userSchema);
const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = {
  Content,
  User,
  SubscriptionPlan,
  Analytics
};