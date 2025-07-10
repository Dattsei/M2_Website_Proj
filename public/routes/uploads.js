const express = require('express');
const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { client: r2 } = require('../../r2Connection'); // <- FIXED HERE
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    const extension = path.extname(file.originalname);
    const key = `${uuidv4()}${extension}`;

    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    await r2.send(new PutObjectCommand(uploadParams));

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    res.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
