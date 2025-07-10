const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim()
  }
});

async function connectR2() {
  try {
    console.log('⏳ Connecting to Cloudflare R2...');
    await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 1
    }));
    console.log('✅ Cloudflare R2 connected successfully');
    return client;
  } catch (error) {
    console.error('☒ R2 Connection Error:', error.message);
    throw error;
  }
}

module.exports = connectR2;
module.exports.client = client; // Also export the client directly