require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const connectDB = require('./dBConnection');
const connectR2 = require('./r2Connection');

// Initialize app
const app = express();
const PORT = process.env.PORT || 4800;

// Import routes
const uploadRoutes = require('./public/routes/uploads');

const pagesRoutes = require('./public/routes/pages');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FIXED: Static file serving - serve both root directory and public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // This serves files from root directory

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

// User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Content model (for admin dashboard)
const contentSchema = new mongoose.Schema({
  title: String,
  type: String,
  // Add other content fields as needed
});
const Content = mongoose.model('Content', contentSchema);

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/', pagesRoutes);

// Auth endpoints
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
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.json({ 
      success: true, 
      message: 'Registration successful!',
      user: { id: newUser._id, name: newUser.name }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({ success: true, message: 'Login successful!', user: req.session.user });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Admin endpoints
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!req.session.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [userCount, subCount, movieCount, seriesCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscription: { $ne: 'Free' } }),
      Content.countDocuments({ type: 'Movie' }),
      Content.countDocuments({ type: 'Series' })
    ]);

    res.json({ success: true, stats: { userCount, subCount, movieCount, seriesCount } });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

// Start server
const startServer = async () => {
  try {
    console.log('Connecting to databases...');
    await connectDB();
    await connectR2();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};





// Enhanced r2Connection.js with better error handling
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim()
  }
});



module.exports = connectR2;
module.exports.client = client;
startServer();