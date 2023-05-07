const AWS = require('aws-sdk');
const KEYS = require('../config/keys');

const createS3 = () => {
  // const spacesEndpoint = new AWS.Endpoint(KEYS.S3_ENDPOINT); // this is needed for Digital Ocean, not with normal aws s3

  const s3 = new AWS.S3({
    // endpoint: spacesEndpoint,
    Bucket: KEYS.S3_BUCKET_NAME,
    accessKeyId: KEYS.S3_ACCESS_KEY_ID,
    secretAccessKey: KEYS.S3_SECRET_ACCESS_KEY,
  });

  return s3;
};

module.exports = createS3;
