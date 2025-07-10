const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Movie', 'Series'], required: true },
  genres: [{ type: String }],
  studio: String,
  releaseDate: Date,
  rating: String,
  thumbnailUrl: String,
  trailerUrl: String,
  videoUrl: String,
  posterUrls: [{ type: String }],
  episodes: [{
    title: String,
    description: String,
    releaseDate: Date,
    thumbnailUrl: String,
    videoUrl: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);