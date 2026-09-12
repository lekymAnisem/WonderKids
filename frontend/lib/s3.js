const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.S3_REGION || 'ap-southeast-2';
const BUCKET = process.env.S3_BUCKET || 'wonderkid';
const ENDPOINT = process.env.S3_ENDPOINT || `https://s3.${REGION}.amazonaws.com`;

const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || ''
  }
});

async function uploadToS3(buffer, key, contentType) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }
  });
  await upload.done();
  return key;
}

async function getPresignedUrl(key, expiresIn) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresIn || 86400 });
}

async function getPresignedUrls(sheets) {
  const results = [];
  for (const sheet of sheets) {
    if (sheet.s3Key) {
      try {
        const url = await getPresignedUrl(sheet.s3Key, 86400);
        results.push({ ...sheet, image: url });
      } catch (err) {
        console.error('Presign failed for', sheet.s3Key, err.message);
        results.push(sheet);
      }
    } else {
      results.push(sheet);
    }
  }
  return results;
}

function isS3Configured() {
  return !!(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && process.env.S3_BUCKET);
}

module.exports = { s3, uploadToS3, getPresignedUrl, getPresignedUrls, isS3Configured, BUCKET, REGION };
