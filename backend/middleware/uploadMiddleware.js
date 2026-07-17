const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { r2Client, R2_BUCKET, R2_PUBLIC_URL } = require('../config/r2');
const path = require('path');
const crypto = require('crypto');

// Use memory storage — files are buffered in memory then uploaded to R2
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, and .webp files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * Upload a single buffer to Cloudflare R2.
 * Returns the public URL of the uploaded file.
 */
const uploadToR2 = async (fileBuffer, originalName, folder = 'maktech') => {
  const ext = path.extname(originalName).toLowerCase();
  const uniqueName = `${folder}/${crypto.randomUUID()}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueName,
      Body: fileBuffer,
      ContentType: getContentType(ext),
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${uniqueName}`;
};

const getContentType = (ext) => {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
};

module.exports = { upload, uploadToR2 };
