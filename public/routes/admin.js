const express = require('express');
const router = express.Router();
const { Content, User, SubscriptionPlan, Analytics } = require('../models');
const mongoose = require('mongoose');

// ===== CONTENT MANAGEMENT =====

// Get all content
router.get('/content', async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
});

// Get single content by ID
router.get('/content/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
});

// Create new content
router.post('/content', async (req, res) => {
  try {
    const {
      title, description, type, studio, releaseDate, rating, genres,
      posters, thumbnail, trailerUrl, movieUrl, duration, episodes
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !studio || !releaseDate || !rating || !genres || !trailerUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Additional validation for movies
    if (type === 'Movie' && !movieUrl) {
      return res.status(400).json({
        success: false,
        message: 'Movie URL is required for movies'
      });
    }

    // Additional validation for series
    if (type === 'Series' && (!episodes || episodes.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Episodes are required for series'
      });
    }

    const contentData = {
      title,
      description,
      type,
      studio,
      releaseDate: new Date(releaseDate),
      rating,
      genres,
      posters: posters || [],
      thumbnail,
      trailerUrl,
      movieUrl: type === 'Movie' ? movieUrl : null,
      duration: duration || 0,
      episodes: type === 'Series' ? episodes : [],
      totalSeasons: type === 'Series' ? Math.max(...episodes.map(ep => ep.seasonNumber || 1)) : 1
    };

    const content = new Content(contentData);
    await content.save();

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
});

// Update content
router.put('/content/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
});

// Delete content
router.delete('/content/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
});

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get single user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favoriteContent');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { fullName, email, phone, address, status, subscription } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Set subscription expiry if not free
    let subscriptionExpiry = null;
    if (subscription && subscription !== 'Free') {
      subscriptionExpiry = new Date();
      const daysToAdd = subscription === 'Premium' ? 365 : 30;
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + daysToAdd);
    }

    const user = new User({
      fullName,
      email,
      phone,
      address,
      status: status || 'Active',
      subscription: subscription || 'Free',
      subscriptionExpiry
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// ===== DASHBOARD & ANALYTICS =====

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalContent,
      totalMovies,
      totalSeries,
      totalEpisodes,
      activeSubscriptions,
      recentContent,
      topContent
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'Active' }),
      Content.countDocuments(),
      Content.countDocuments({ type: 'Movie' }),
      Content.countDocuments({ type: 'Series' }),
      Content.aggregate([
        { $match: { type: 'Series' } },
        { $project: { episodeCount: { $size: '$episodes' } } },
        { $group: { _id: null, total: { $sum: '$episodeCount' } } }
      ]),
      User.countDocuments({ subscription: { $ne: 'Free' } }),
      Content.find().sort({ createdAt: -1 }).limit(5),
      Content.find().sort({ views: -1 }).limit(5)
    ]);

    const subscriptionCounts = await User.aggregate([
      { $group: { _id: '$subscription', count: { $sum: 1 } } }
    ]);

    const genreCounts = await Content.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalContent,
          totalMovies,
          totalSeries,
          totalEpisodes: totalEpisodes[0]?.total || 0,
          activeSubscriptions
        },
        subscriptionCounts: subscriptionCounts.reduce((acc, item) => {
          acc[item._id.toLowerCase()] = item.count;
          return acc;
        }, {}),
        genreCounts: genreCounts.map(item => ({
          genre: item._id,
          count: item.count
        })),
        recentContent,
        topContent
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalViews,
      averageRating,
      totalContent,
      activeUsers,
      popularContent,
      mostViewed,
      highestRated,
      topGenres
    ] = await Promise.all([
      Content.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      Content.aggregate([
        { $match: { averageRating: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } }
      ]),
      Content.countDocuments(),
      User.countDocuments({ status: 'Active' }),
      Content.find().sort({ views: -1 }).limit(10),
      Content.find().sort({ views: -1 }).limit(5),
      Content.find().sort({ averageRating: -1 }).limit(5),
      Content.aggregate([
        { $unwind: '$genres' },
        { $group: { _id: '$genres', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalViews: totalViews[0]?.total || 0,
          averageRating: averageRating[0]?.avg || 0,
          totalContent,
          activeUsers
        },
        popularContent,
        mostViewed,
        highestRated,
        topGenres: topGenres.map(item => ({
          genre: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

// ===== SUBSCRIPTION MANAGEMENT =====

// Get all subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await User.find({ 
      subscription: { $ne: 'Free' },
      status: 'Active'
    }).select('fullName email subscription subscriptionExpiry');

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
});

// Update subscription
router.put('/subscriptions/:userId', async (req, res) => {
  try {
    const { subscription, duration } = req.body;

    let subscriptionExpiry = null;
    if (subscription !== 'Free') {
      subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + (duration || 30));
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { subscription, subscriptionExpiry },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

module.exports = router;