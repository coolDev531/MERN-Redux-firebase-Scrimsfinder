import React from 'react';
import S3FileUpload from 'react-s3';
import { addImageToScrim } from './../services/scrims';

export default function UploadPostGameImage({ scrim }) {
  const config = {
    bucketName: 'lol-scrimsfinder-bucket',
    dirName: `postGameLobbyImages/${scrim._id}` /* optional */,
    region: 'us-east-1',
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  };
  const upload = (e) => {
    const img = e.target.files[0];
    S3FileUpload.uploadFile(img, config)
      .then(async (data) => {
        console.log(data);
        const addedImg = await addImageToScrim(scrim._id, data);
        if (addedImg) {
          console.log(
            '%csuccessfully added an image for scrim: ' + scrim._id,
            'color: lightgreen'
          );
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <>
      <h3>Upload image</h3>
      <input type="file" onChange={upload} />
    </>
  );
}
