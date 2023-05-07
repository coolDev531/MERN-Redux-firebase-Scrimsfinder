const KEYS = require('../config/keys');
const createS3 = require('./createS3');

/*
order of operations:
  - client uploads image, image gets converted to base64 string using FileReader();
  - client sends the base64 string in the payload to the back-end
  - the back-end takes the base64 string and converts it into data, then it uses the data to upload to S3.
*/
async function uploadToBucket({
  fileName,
  base64,
  dirName = '',
  s3Bucket = createS3(),
}) {
  const actualBase64 = base64.toString().split(',')[1]; // remove the data:image/jpeg;base64, thing from the base64 if it's there, or else Buffer.alloc wont work

  const base64Data = new Buffer.alloc(
    actualBase64.length,
    actualBase64,
    'base64'
  );

  const params = {
    Body: base64Data,
    Bucket: KEYS.S3_BUCKET_NAME,
    Key: dirName ? `${dirName}/${fileName}` : fileName,
    // ACL: 'public-read',
    ContentType: 'image/jpeg',
  };

  const result = await s3Bucket.upload(params).promise();

  return {
    ...result,
    key: result.Key || result.key,
    location: result.Location,
    bucket: result.Bucket,
  };
}

module.exports = uploadToBucket;
