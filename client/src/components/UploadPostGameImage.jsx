import { useContext, useRef } from 'react';
import { Tooltip, Grid, Button } from '@material-ui/core';
import S3FileUpload from 'react-s3';
import { ScrimsContext } from '../context/scrimsContext';
import { addImageToScrim } from './../services/scrims';

export default function UploadPostGameImage({ scrim, isUploaded }) {
  const config = {
    bucketName: 'lol-scrimsfinder-bucket',
    dirName: `postGameLobbyImages/${scrim._id}` /* optional */,
    region: 'us-east-1',
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  };

  const fileInputRef = useRef();

  const { toggleFetch } = useContext(ScrimsContext);

  function upload(e) {
    const img = e.target.files[0];
    console.log(e.target);
    S3FileUpload.uploadFile(img, config)
      .then(async (data) => {
        let yes = window.confirm('Are you sure you want to upload this image?');
        if (!yes) {
          // empty the value inside the file upload so user can retry again...
          fileInputRef.current.value = '';
          return;
        }

        const addedImg = await addImageToScrim(scrim._id, data);
        if (addedImg) {
          console.log(
            '%csuccessfully added an image for scrim: ' + scrim._id,
            'color: lightgreen'
          );
          toggleFetch((prev) => !prev);
        }
      })
      .catch((err) => {
        alert(err);
      });
  }

  // only show this if image hasn't been uploaded
  return (
    !isUploaded && (
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        xs={12}>
        <Grid item xs={8}>
          <h3 className="text-black">Upload Post Game Lobby Image:</h3>
        </Grid>
        <Grid item xs={4}>
          <Tooltip
            title="Validate winner by uploading end of game results"
            position="top">
            <Button variant="contained" color="primary" component="label">
              Upload File
              <input ref={fileInputRef} hidden type="file" onChange={upload} />
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    )
  );
}
