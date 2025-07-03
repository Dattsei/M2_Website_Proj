const express = require('express');
const router = express.Router();
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { client: s3Client } = require('../../r2Connection');

// ... rest of your uploads.js remains exactly the same ...

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = './tmp/uploads';
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const validTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  cb(null, validTypes.includes(file.mimetype));
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: fileFilter
});

// Upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const fileStream = fs.createReadStream(req.file.path);
    const fileType = req.file.mimetype.split('/')[0]; // 'image' or 'video'
    const key = `${fileType}s/${req.file.filename}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: req.file.mimetype,
      CacheControl: 'public, max-age=31536000'
    }));

    fs.unlinkSync(req.file.path); // Cleanup

    const fileUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${key}`
      : `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${key}`;

    res.json({
      success: true,
      url: fileUrl,
      type: req.file.mimetype,
      size: req.file.size
    });

  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});
// Add this alternative endpoint for large files
router.post('/chunked', upload.single('file'), async (req, res) => {
  try {
    // Handle chunked uploads
    const { chunkIndex, totalChunks, fileId } = req.body;
    
    // Create a temporary directory for chunks
    const chunkDir = `./tmp/chunks/${fileId}`;
    fs.mkdirSync(chunkDir, { recursive: true });
    
    // Save the chunk
    const chunkPath = `${chunkDir}/${chunkIndex}`;
    fs.renameSync(req.file.path, chunkPath);
    
    // Check if all chunks are uploaded
    if (Number(chunkIndex) === Number(totalChunks) - 1) {
      // Combine chunks
      const filePath = `./tmp/uploads/${fileId}-${req.file.originalname}`;
      const writeStream = fs.createWriteStream(filePath);
      
      for (let i = 0; i < totalChunks; i++) {
        const chunk = fs.readFileSync(`${chunkDir}/${i}`);
        writeStream.write(chunk);
      }
      writeStream.end();
      
      // Upload to R2
      const fileStream = fs.createReadStream(filePath);
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `videos/${fileId}-${req.file.originalname}`,
        Body: fileStream,
        ContentType: req.file.mimetype
      }));
      
      // Cleanup
      fs.rmSync(chunkDir, { recursive: true });
      fs.unlinkSync(filePath);
      
      return res.json({
        success: true,
        url: `${process.env.R2_PUBLIC_URL}/videos/${fileId}-${req.file.originalname}`
      });
    }
    
    res.json({ success: true, chunkReceived: true });
    
  } catch (error) {
    console.error('Chunked upload error:', error);
    res.status(500).json({ success: false, message: 'Chunked upload failed' });
  }
});
module.exports = router;