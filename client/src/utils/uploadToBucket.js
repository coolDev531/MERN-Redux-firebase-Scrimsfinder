import AWS from 'aws-sdk';
import mime from 'mime-types';

export default async function uploadToBucket({ fileName, file, dirName = '' }) {
  const spacesEndpoint = new AWS.Endpoint(process.env.REACT_APP_S3_ENDPOINT);

  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  });

  const fileType = getFileType(file.name);

  const params = {
    Body: file,
    Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
    Key: dirName ? `${dirName}/${fileName}` : fileName,
    ACL: 'public-read',
    ContentType: fileType,
    ContentLength: file.size,
  };

  const result = await s3.upload(params).promise();

  return {
    ...result,
    key: result.Key || result.key,
    location: result.Location,
    bucket: result.Bucket,
  };
}

function getFileType(fileName) {
  const mimeType = mime.lookup(fileName);
  return mimeType;
}
