// routes/uploads.js
const express = require('express');
const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2 = require('../../r2Connection');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Generate unique file name
    const ext = path.extname(req.file.originalname);
    const filename = crypto.randomBytes(16).toString('hex') + ext;

    const params = {
      Bucket: process.env.R2_BUCKET,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };

    await r2.send(new PutObjectCommand(params));

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
