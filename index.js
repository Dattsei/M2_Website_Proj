require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const connectDB = require('./dBConnection');
const connectR2 = require('./r2Connection');
const util = require('util');

// Initialize app
const app = express();
const PORT = process.env.PORT || 4800;

// ======================
// IMPORT MODELS (Updated)
// ======================
const User = require('./public/models/User');
const Subscription = require('./public/models/Subscription');
const Revenue = require('./public/models/Revenue');
const Plan = require('./public/models/Plan');
const Content = require('./public/models/content');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add after your static file configuration
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));


// ======================
// SESSION MIDDLEWARE (UPDATED)
// ======================
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

// Add session refresh middleware
app.use(async (req, res, next) => {
  if (req.session.user?.id) {
    try {
      // Refresh subscription status
      const subscription = await Subscription.findOne({
        userId: req.session.user.id,
        status: 'Active',
        expirationDate: { $gt: new Date() }
      });
      
      // Update session with current status
      req.session.user.hasSubscription = !!subscription;
      if (subscription) {
        req.session.user.plan = subscription.plan;
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }
  next();
});

app.use((req, res, next) => {
  // Skip API and auth-related routes
  if (req.path.startsWith('/api') || 
      ['/login', '/register', '/subscription', '/payment-method', '/account'].includes(req.path)) {
    return next();
  }

  if (req.session.user && !req.session.user.hasSubscription) {
    return res.redirect('/subscription');
  }
  
  next();
});

const requireAuth = (req, res, next) => {
  if (!req.session.user?.id) {
    if (req.path.startsWith('/api')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    return res.redirect('/login');
  }
  next();
};


// ======================
// SUBSCRIPTION REQUIREMENT MIDDLEWARE (UPDATED)
// ======================
const requireSubscription = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  // Allow access to subscription and payment pages
  if (req.path.startsWith('/subscription') || req.path.startsWith('/payment-method')) {
    return next();
  }
  
  // Check if user has active subscription
  if (!req.session.user.hasSubscription) {
    return res.redirect('/subscription');
  }
  
  next();
};

// Apply to protected routes
app.use(['/mainpage', '/watchpage', '/favorites', '/search', '/account'], requireSubscription);

// ======================
// SERVE PAGE FUNCTION
// ======================
// Update the servePage function
const servePage = (page) => (req, res) => {
  res.sendFile(path.join(__dirname, 'public', `${page}.html`));
};

//MiddleWare
// Middleware to set Content-Type for all responses
app.use((req, res, next) => {
  // Only set JSON for API routes
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
  }
  next();
});

// Error handler to ensure JSON responses
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

app.get('/api/healthcheck', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const plansCount = await Plan.countDocuments();
    
    res.json({
      status: 'ok',
      database: dbStatus,
      plans: plansCount,
      serverTime: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ======================
// DEBUG MIDDLEWARE (Add this after your existing middleware)
// ======================

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.startsWith('/api/')) {
    console.log('Request body:', req.body);
  }
  next();
});

// Middleware to check if routes are being registered
app.use('/api', (req, res, next) => {
  console.log(`API route hit: ${req.method} ${req.path}`);
  next();
});
// Set Content-Type for all API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Error handler for API routes
app.use('/api', (err, req, res, next) => {
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// ======================
// ROUTE VERIFICATION (Add this after your routes)
// ======================

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// List all registered routes (for debugging)
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  
  res.json({ 
    success: true, 
    routes: routes,
    totalRoutes: routes.length
  });
});

// ======================
// API ROUTES
// ======================

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User Not Recognized, Please Register' 
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Get active subscription
    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: 'Active',
      expirationDate: { $gt: new Date() }
    });

    // Calculate subscription status
    const hasSubscription = subscription && 
                           subscription.status === 'Active' && 
                           subscription.expirationDate > new Date();

    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: subscription ? subscription.plan : 'Basic',
      hasSubscription: !!hasSubscription
    };

    // Send SINGLE response
    res.json({ 
      success: true, 
      message: 'Login successful!',
      user: req.session.user,
      hasSubscription: !!hasSubscription
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
});

// Registration endpoint (Updated with profile creation)
app.post('/api/register', async (req, res) => {
  // Add this validation at the start:
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }
    
    // Create user with default profile
    const newUser = await User.create({
      name,
      email,
      password,
      profiles: [{
        name: name,
        avatar: 'assets/images/avatar1.jpg'
      }]
    });

    // Create session for immediate login
    req.session.user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };

    // Only send one response
    res.json({ 
      success: true, 
      message: 'Registration successful!',
      redirect: '/subscription',
      user: {
        id: newUser._id,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Registration failed: ${error.message}` 
    });
  }
});


// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Protected route to get user ID
app.get('/api/user-id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized' 
    });
  }
  res.json({ 
    success: true, 
    userId: req.session.user.id 
  });
});

app.put('/api/user/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password update failed' });
  }
});

// ======================
// ACCOUNT DATA ENDPOINT
// ======================
app.get('/api/account', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
      .select('name email profiles activeProfile');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const subscription = await Subscription.findOne({
      userId: req.session.user.id,
      status: 'Active'
    });

    res.json({
      success: true,
      name: user.name,
      email: user.email,
      plan: subscription?.plan || 'None',
      expiration: subscription?.expirationDate || null,
      paymentMethod: subscription?.paymentMethod || 'None',
      profiles: user.profiles
    });
  } catch (error) {
    console.error('Account data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ======================
// ADMIN MIDDLEWARE
// ======================
const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Login required' 
    });
  }

  try {
    const user = await User.findById(req.session.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden - Admin access required' 
      });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during admin verification' 
    });
  }
};

// ======================
// PROFILE MANAGEMENT ENDPOINTS
// ======================

// Get user profiles
app.get('/api/user', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId).select('name email profiles activeProfile');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      name: user.name, // Add this
      email: user.email, // Add this
      profiles: user.profiles,
      activeProfile: user.activeProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current plan limits
app.get('/api/user/plan', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'Active' 
    });
    
    if (!subscription) {
      return res.json({ success: true, maxProfiles: 1 });
    }
    
    const plan = await Plan.findOne({ name: subscription.plan });
    res.json({ success: true, maxProfiles: plan.maxProfiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new profile
app.post('/api/profiles', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { name, isChild = false } = req.body;
    
    const user = await User.findById(userId);
    const maxProfiles = await getPlanLimits(userId);
    
    if (user.profiles.length >= maxProfiles) {
      return res.status(400).json({
        success: false,
        message: `You've reached the profile limit for your plan`
      });
    }
    
    // Fixed avatar path generation
    const avatarNumber = Math.floor(Math.random() * 4) + 1;
    const avatarPath = `assets/images/avatar${avatarNumber}.jpg`;
    
    // Add new profile
    user.profiles.push({
      name,
      isChild,
      avatar: avatarPath
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile created successfully',
      profiles: user.profiles
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create profile' 
    });
  }
});

// Delete profile by ID
app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    const userId = req.session.user.id;
    
    // Validate profileId
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID format'
      });
    }

    const user = await User.findById(userId);
    const profileIndex = user.profiles.findIndex(p => p._id.toString() === profileId);
    
    // Find profile by ID
    const profile = user.profiles.find(
      p => p._id.toString() === profileId
    );
    
    if (!profile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }
    
    // Prevent deleting last profile
    if (user.profiles.length <= 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one profile is required' 
      });
    }
    
    user.profiles.splice(profileIndex, 1);
    
    // Reset active profile if it was pointing to deleted profile
    if (user.activeProfile === profileIndex) {
      // Reset to first profile after deletion
      user.activeProfile = 0;
    } 
    // Adjust activeProfile index if it was after the deleted profile
    else if (user.activeProfile > profileIndex) {
      user.activeProfile--;
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile deleted successfully',
      profiles: user.profiles,
      activeProfile: user.activeProfile
    });
  } catch (error) {
    console.error('Profile delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete profile',
      error: error.message 
    });
  }
});

// Update profile
app.put('/api/profiles', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { profileId, name, avatar } = req.body;  // Now using profileId
    
    const user = await User.findById(userId);
    const profile = user.profiles.id(profileId);  // Mongoose subdocument lookup
    
    if (!profile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }
    
    profile.name = name;
    if (avatar) profile.avatar = avatar;
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profiles: user.profiles
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Switch active profile
app.post('/api/profiles/switch', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { index } = req.body;
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid profile index' 
      });
    }
    
    const user = await User.findById(userId);
    
    if (index >= user.profiles.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile index out of range' 
      });
    }
    
    user.activeProfile = index;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile switched successfully',
      activeProfile: user.profiles[index]
    });
    
  } catch (error) {
    console.error('Profile switch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to switch profile' 
    });
  }
});

// Helper function to get plan limits
async function getPlanLimits(userId) {
  try {
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'Active' 
    });
    
    if (!subscription) return 1;
    
    const plan = await Plan.findOne({ name: subscription.plan });
    return plan.maxProfiles || 1;
  } catch (error) {
    return 1;
  }
}

// ======================
// SUBSCRIPTION ENDPOINTS (FIXED)
// ======================

// Helper function to get card brand
function getCardBrand(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return 'Unknown';
}

// User subscription endpoint (Handles new subscriptions and plan changes)
app.post('/api/subscription', async (req, res) => {
  try {
    console.log('=== SUBSCRIPTION REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('Session user:', req.session.user);
    
    let { plan, paymentMethod, paymentDetails } = req.body;
    
    // Validate required fields
    if (!plan || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan, payment method, and payment details are required' 
      });
    }
    
    console.log(`Original plan: ${plan}`);
    
    // Normalize plan name
    plan = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    console.log(`Normalized plan: ${plan}`);
    
    // Validate session
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired - please login again' 
      });
    }
    
    const userId = req.session.user.id;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get plan details
    const planDoc = await Plan.findOne({ name: plan });
    
    if (!planDoc) {
      console.log('Available plans:', await Plan.find().select('name'));
      return res.status(400).json({
        success: false,
        message: `Invalid plan selected: ${plan}`
      });
    }
    
    console.log('Plan found:', planDoc);
    
    // Generate payment identifier for duplicate check
    let paymentIdentifier;
    
    if (paymentMethod === 'card') {
      const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number'
        });
      }
      paymentIdentifier = `${getCardBrand(cardNumber)}:${cardNumber.slice(-4)}`;
    } else if (paymentMethod === 'digital' || paymentMethod === 'mobile') {
      // Create full phone number with country code
      paymentIdentifier = `${paymentDetails.countryCode}${paymentDetails.phoneNumber}`;
      
      if (!/^\+\d{1,3}\d{7,15}$/.test(paymentIdentifier)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
    }
    
    console.log(`Payment identifier: ${paymentIdentifier}`);
    
    // Check for duplicate payment method (only for new subscriptions)
    const existingPaymentMethod = await Subscription.findOne({
      'paymentDetails.identifier': paymentIdentifier,
      userId: { $ne: userId }
    });
    
    if (existingPaymentMethod) {
      console.log(`Duplicate payment method found: ${paymentIdentifier} used by user ${existingPaymentMethod.userId}`);
      return res.status(400).json({
        success: false,
        message: 'This payment method is already in use by another account'
      });
    }

    // Check for existing subscription
    const existingSubscription = await Subscription.findOne({ 
      userId, 
      status: 'Active' 
    });
    
    // Update in subscription endpoint
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); 
    
    let subscription;
    
    // In subscription endpoint
    if (existingSubscription) {
      // Only update payment method for existing subscription
      existingSubscription.paymentMethod = paymentMethod;
      existingSubscription.paymentDetails = {
        identifier: paymentIdentifier,
        ...paymentDetails
      };
      await existingSubscription.save();
      subscription = existingSubscription;
    } else {
      // Create new subscription
      subscription = new Subscription({
        userId,
        plan,
        price: planDoc.price,
        dateSubscribed: new Date(),
        expirationDate: expirationDate, // 30 days from now
        paymentMethod,
        paymentDetails: {
          identifier: paymentIdentifier,
          ...paymentDetails
        },
        status: 'Active'
      });
      await subscription.save();
    }
    
    console.log('Subscription saved:', subscription.toObject());

    req.session.user.plan = plan;
    req.session.user.hasSubscription = true;

    // Save session properly
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Create mock payment record
    const revenue = new Revenue({
      subscriptionId: subscription._id,
      userId,
      amount: planDoc.price,
      plan,
      paymentMethod,
      paymentDate: new Date(),
      isMock: true
    });
    await revenue.save();
    
    console.log('Revenue record created');
    
    // Update user's payment method
    user.paymentMethod = paymentMethod;
    await user.save();
    
    // Update session with new plan
    req.session.user.plan = plan;
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('Session updated with plan:', plan);
    
    console.log('=== SUBSCRIPTION SUCCESS ===');
    
    // Return the expiration date in the response
    return res.status(200).json({ 
      success: true,
      message: existingSubscription ? 
        'Subscription updated successfully' : 
        'Subscription created successfully',
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        price: subscription.price,
        status: subscription.status,
        expirationDate: subscription.expirationDate // Ensure this is included
      }
    });
    
  } catch (error) {
    console.error('=== SUBSCRIPTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Session:', req.session);
    
    // Database connection check
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('Database connection state:', {
        connected: mongoose.connection.readyState,
        host: mongoose.connection.host,
        db: mongoose.connection.name
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: `Payment processing failed: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify Password
app.post('/api/verify-password', async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.session.user.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const isMatch = await user.comparePassword(password);
    res.json({ success: isMatch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update User
app.put('/api/user', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// Cancel Subscription Endpoint
app.delete('/api/subscription', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Find active subscription
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'Active'
    });
    
    if (!subscription) {
      return res.status(400).json({ 
        success: false, 
        message: 'No active subscription found' 
      });
    }
    
    // Check if subscription is at least 3 days old
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    if (subscription.dateSubscribed > threeDaysAgo) {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only cancel after 3 days of subscription' 
      });
    }
    
    // Mark as cancelled
    subscription.status = 'Cancelled';
    await subscription.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cancellation failed' });
  }
});

// Create/Update Subscription Endpoint
app.post('/api/subscription', async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.session.user.id;

    // Validate plan
    if (!['Basic', 'Standard', 'Premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Find existing subscription
    let existingSubscription = await Subscription.findOne({ userId });
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.plan = plan;
      existingSubscription.price = getPlanPrice(plan); // Helper function to get price
      existingSubscription.expirationDate = calculateExpirationDate(); // Helper function to calculate expiration
      await existingSubscription.save();
      
      return res.json({ 
        success: true,
        message: 'Subscription updated successfully',
        subscription: {
          id: existingSubscription._id,
          plan: existingSubscription.plan,
          price: existingSubscription.price,
          status: existingSubscription.status,
          expirationDate: existingSubscription.expirationDate
        }
      });
    }
    
    // Create new subscription
    const newSubscription = new Subscription({
      userId,
      plan,
      price: getPlanPrice(plan),
      status: 'Active',
      dateSubscribed: new Date(),
      expirationDate: calculateExpirationDate()
    });
    
    await newSubscription.save();
    
    res.json({ 
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        id: newSubscription._id,
        plan: newSubscription.plan,
        price: newSubscription.price,
        status: newSubscription.status,
        expirationDate: newSubscription.expirationDate
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Subscription processing failed' });
  }
});

// Helper function to calculate expiration date (30 days from now)
function calculateExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

// Helper function to get plan price
function getPlanPrice(plan) {
  const prices = {
    'Basic': 199,
    'Standard': 399,
    'Premium': 549
  };
  return prices[plan] || 0;
}


// Add this to your backend routes
app.post('/api/subscription/change-plan', async (req, res) => {
  try {
    // Add validation
    if (!req.body.plan) {
      return res.status(400).json({
        success: false,
        message: 'Plan is required'
      });
    }
    
    const userId = req.session.user.id;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get plan details
    const planDoc = await Plan.findOne({ name: plan });
    if (!planDoc) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan selected: ${plan}`
      });
    }
    
    // Get existing subscription
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'Active' 
    });
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active subscription found' 
      });
    }
    
    // Check if plan change is allowed (at least 3 days before expiration)
    const threeDaysFromExpiration = new Date(subscription.expirationDate);
    threeDaysFromExpiration.setDate(threeDaysFromExpiration.getDate() - 3);
    
    if (new Date() > threeDaysFromExpiration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan can only be changed at least 3 days before expiration' 
      });
    }
    
    // Update subscription plan
    subscription.plan = plan;
    subscription.price = planDoc.price;
    
    // Update payment method if provided
    if (paymentMethod) {
      subscription.paymentMethod = paymentMethod;
    }
    
    // Update payment details if provided
    if (paymentDetails) {
      subscription.paymentDetails = paymentDetails;
    }
    
    await subscription.save();
    
    // Update session
    req.session.user.plan = plan;
    await req.session.save();
    
    res.json({ 
      success: true, 
      message: 'Plan updated successfully'
    });
    
  } catch (error) {
    console.error('Plan change error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change plan' 
    });
  }
});

app.get('/api/user/subscription', async (req, res) => {
  try {
    if (!req.session.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const subscription = await Subscription.findOne({
      userId: req.session.user.id,
      status: 'Active'
    });

    if (!subscription) {
      return res.json({ success: true, subscription: null });
    }

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// ADMIN ENDPOINTS
// ======================

// Get all users with subscription info
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({ userId: user._id });
        return {
          id: user._id,
          fullName: user.name,
          email: user.email,
          profiles: user.profiles.length,
          status: subscription ? subscription.status : 'No Subscription',
          subscription: subscription ? subscription.plan : 'None',
          paymentMethod: user.paymentMethod || null,
          createdAt: user.createdAt
        };
      })
    );
    res.json({ success: true, users: usersWithSubscriptions });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get all subscriptions
app.get('/api/admin/subscription', requireAdmin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('userId', 'name email');
    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error('Admin subscriptions fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
});

// Dashboard statistics
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const [userCount, activeSubCount, totalSubCount] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ status: 'Active' }),
      Subscription.countDocuments()
    ]);
    
    const totalRevenue = await Revenue.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Get subscription plan distribution
    const planDistribution = await Subscription.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: "$plan", count: { $sum: 1 } } },
      { $project: { _id: 0, plan: "$_id", count: 1 } }
    ]);
    
    // Convert to object
    const planCounts = {};
    planDistribution.forEach(item => {
      planCounts[item.plan] = item.count;
    });
    
    res.json({
      success: true,
      stats: {
        userCount,
        activeSubCount,
        totalSubCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentSignups,
        planCounts
      }
    });
  } catch (error) {
    console.error('Admin dashboard fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
});

// ======================
// CONTENT ROUTES
// ======================
app.use('/api/upload', require('./public/routes/uploads'));

// ======================
// VIEW ROUTES
// ======================
// This must come AFTER all your route definitions

// View routes
app.get('/', servePage('index'));
app.get('/admin', servePage('admin'));
app.get('/favorites', servePage('favorites'));
app.get('/login', servePage('login'));
app.get('/mainpage', servePage('mainpage'));
app.get('/register', servePage('register'));
app.get('/account', requireAuth, servePage('account'));
app.get('/manage-profiles', servePage('manage-profiles'));
app.get('/payment-method', servePage('payment-method'));
app.get('/profiles', servePage('profiles'));
app.get('/search', servePage('search'));
app.get('/subscription', servePage('subscription'));
app.get('/watchpage', servePage('watchpage'));

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    // Set proper caching headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// ======================
// ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ======================
// INITIALIZE PLANS
// ======================
async function initializePlans() {
  const defaultPlans = [
    { 
      name: 'Basic', 
      price: 199,  // PHP price
      resolution: '720p',
      maxProfiles: 1
    },
    { 
      name: 'Standard', 
      price: 399,  // PHP price
      resolution: '1080p',
      maxProfiles: 3
    },
    { 
      name: 'Premium', 
      price: 549,  // PHP price
      resolution: '4K+HDR',
      maxProfiles: 5
    }
  ];

  for (const plan of defaultPlans) {
    await Plan.findOneAndUpdate(
      { name: plan.name },
      plan,
      { upsert: true, new: true }
    );
  }
  console.log('Subscription plans initialized');
}


// ======================
// START SERVER
// ======================
async function startServer() {
  try {
    console.log('Connecting to databases...');
    await connectDB();
    
    // Initialize plans FIRST
    await initializePlans();
    console.log('Plans initialized');
    
    // Verify plans
    const plans = await Plan.find();
    console.log('Available plans:', plans.map(p => p.name));

    await connectR2();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();