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
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Session middleware 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
  }
}));

app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = {}; // Initialize empty user session
  }
  next();
});

// ======================
// SERVE PAGE FUNCTION
// ======================
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

// Registration endpoint (Updated with profile creation)
app.post('/api/register', async (req, res) => {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with default profile
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
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
      message: 'Registration failed. Please try again.' 
    });
  }
});

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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Get active subscription
    const subscription = await Subscription.findOne({ 
      userId: user._id, 
      status: 'Active' 
    });
    
    // Login successful - create session with plan info
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      // FIX: Add plan information to session
      plan: subscription ? subscription.plan : 'Basic'
    };

    res.json({ 
      success: true, 
      message: 'Login successful!',
      user: req.session.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
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
    const user = await User.findById(userId).select('profiles activeProfile');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
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

// Delete profile
app.delete('/api/profiles', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { index } = req.body;
    
    const user = await User.findById(userId);
    
    if (index >= user.profiles.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid profile index' 
      });
    }
    
    // Can't delete the last profile
    if (user.profiles.length <= 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one profile is required' 
      });
    }
    
    user.profiles.splice(index, 1);
    
    // Reset active profile if needed
    if (user.activeProfile >= user.profiles.length) {
      user.activeProfile = 0;
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile deleted successfully',
      profiles: user.profiles
    });
  } catch (error) {
    console.error('Profile delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete profile' });
  }
});

// Update profile
app.put('/api/profiles', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { index, name, avatar } = req.body;
    
    const user = await User.findById(userId);
    
    if (index >= user.profiles.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid profile index' 
      });
    }
    
    user.profiles[index].name = name;
    if (avatar) user.profiles[index].avatar = avatar;
    
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

app.get('/api/user-id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.json({ success: true, userId: req.session.user.id });
});

// User subscription endpoint (Handles new subscriptions and plan changes)
app.post('/api/subscription', async (req, res) => {
  console.log('Session user:', req.session.user);
  try {
    console.log('=== SUBSCRIPTION REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('Session user:', req.session.user);  // 👈 Check if this logs correctly
    
    let { plan, paymentMethod } = req.body;
    
    // Validate required fields
    if (!plan || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan and payment method are required' 
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
    
    // Check for existing subscription
    const existingSubscription = await Subscription.findOne({ 
      userId, 
      status: 'Active' 
    });
    
    // Calculate expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    let subscription;
    
    if (existingSubscription) {
      console.log('Updating existing subscription');
      // Update existing subscription (plan change)
      existingSubscription.plan = plan;
      existingSubscription.price = planDoc.price;
      existingSubscription.paymentMethod = paymentMethod;
      existingSubscription.dateSubscribed = new Date();
      existingSubscription.expirationDate = expirationDate;
      
      await existingSubscription.save();
      subscription = existingSubscription;
    } else {
      console.log('Creating new subscription');
      // Create new subscription
      subscription = new Subscription({
        userId,
        plan,
        price: planDoc.price,
        dateSubscribed: new Date(),
        expirationDate,
        paymentMethod,
        status: 'Active'
      });
      await subscription.save();
    }
    
    console.log('Subscription saved:', subscription);
    
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
    
    // Return success response
    return res.status(200).json({ 
      success: true,
      message: existingSubscription ? 
        'Subscription updated successfully' : 
        'Subscription created successfully',
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        price: subscription.price,
        status: subscription.status
      },
      user: {
        plan: plan
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
app.get('/api/admin/subscriptions', requireAdmin, async (req, res) => {
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
// CONTENT ROUTES
// ======================
app.use('/api/upload', require('./public/routes/uploads'));

// ======================
// VIEW ROUTES
// ======================
app.get('/', servePage('index'));
app.get('/admin', servePage('admin'));
app.get('/favorites', servePage('favorites'));
app.get('/login', servePage('login'));
app.get('/mainpage', servePage('mainpage'));
app.get('/register', servePage('register'));
app.get('/account', servePage('account'));
app.get('/manage-profiles', servePage('manage-profiles'));
app.get('/payment-method', servePage('payment-method'));
app.get('/profiles', servePage('profiles'));
app.get('/search', servePage('search'));
app.get('/subscription', servePage('subscription'));
app.get('/watchpage', servePage('watchpage'));
// ======================
// INITIALIZE PLANS
// ======================
async function initializePlans() {
  const defaultPlans = [
    { 
      name: 'Basic', 
      price: 199,
      resolution: '720p',
      maxProfiles: 1
    },
    { 
      name: 'Standard', 
      price: 399,
      resolution: '1080p',
      maxProfiles: 3
    },
    { 
      name: 'Premium', 
      price: 549,
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