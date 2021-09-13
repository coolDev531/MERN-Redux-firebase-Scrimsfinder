import { useRef } from 'react';
import { useScrims } from './../../context/scrimsContext';
import { useAuth } from './../../context/currentUser';

// components
import AdminArea from '../shared/AdminArea';
import { Tooltip, Grid, Button, Typography } from '@material-ui/core';

// utils
import S3FileUpload from 'react-s3';
import { addImageToScrim } from '../../services/scrims';
import { useAlerts } from '../../context/alertsContext';
import AWS from 'aws-sdk';

const MAX_FILE_SIZE_MIB = 0.953674; // 1 megabyte (in Memibyte format)

export default function UploadPostGameImage({ scrim, isUploaded }) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef();
  const { fetchScrims } = useScrims();
  const { setCurrentAlert } = useAlerts();

  const config = {
    bucketName: 'lol-scrimsfinder-bucket',
    dirName: `postGameLobbyImages/${scrim._id}` /* optional */,
    region: 'us-east-1',
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  };

  const deleteS3Object = async () => {
    return new Promise((resolve, reject) => {
      try {
        let s3bucket = new AWS.S3({
          Bucket: config.bucketName,
          Key: scrim.postGameImage?.key, // location of file: /postgameLobbyImages/id/filename
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        });

        const params = {
          Bucket: config.bucketName,
          Key: scrim.postGameImage?.key,
        };

        s3bucket.deleteObject(params, function (err, data) {
          if (err) reject(err);
          // an error occurred
          else resolve(data); // successful response
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleUpload = async (e) => {
    if (e.target.files.length === 0) return;

    let file = e.target.files[0];
    file.name = `game-${scrim._id}-${Date.now()}`;

    const fileSize = file.size / 1024 / 1024; // in MiB

    if (!/^image\//.test(file.type)) {
      // if file type isn't an image, return
      fileInputRef.current.value = '';
      setCurrentAlert({
        type: 'Error',
        message: `File ${file.name} is not an image! \nonly images are allowed.`,
      });
      return;
    }

    if (fileSize > MAX_FILE_SIZE_MIB) {
      fileInputRef.current.value = '';
      setCurrentAlert({
        type: 'Error',
        message: `File ${file.name} is too big! \nmax allowed size: 1 MB.`,
      });
      return;
    }

    let yes = window.confirm('Are you sure you want to upload this image?');

    if (!yes) {
      // empty the value inside the file upload so user can retry again...
      fileInputRef.current.value = '';
      return;
    }

    try {
      const bucketData = await S3FileUpload.uploadFile(file, config);
      let dataSending = {
        ...bucketData,
        uploadedBy: { ...currentUser },
      };

      const addedImg = await addImageToScrim(scrim._id, dataSending);
      if (addedImg) {
        console.log(
          '%csuccessfully uploaded an image for scrim: ' + scrim._id,
          'color: lightgreen'
        );

        setCurrentAlert({
          type: 'Success',
          message: 'image uploaded successfully',
        });

        fetchScrims();
      }
    } catch (err) {
      console.log('error uploading image:', err);
      setCurrentAlert({
        type: 'Error',
        message: err,
      });
    }
  };

  // only show this if image hasn't been uploaded
  return !isUploaded ? (
    <Grid
      item
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      xs={12}>
      <Grid item xs={8}>
        <Typography variant="h3" className="text-black">
          Upload post-game lobby image:
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Tooltip
          title="Validate winner by uploading end of game results"
          position="top">
          <Button variant="contained" color="primary" component="label">
            Upload Image
            <input
              accept="image/*"
              ref={fileInputRef}
              hidden
              type="file"
              onChange={handleUpload}
            />
          </Button>
        </Tooltip>
      </Grid>
    </Grid>
  ) : (
    // if is uploaded
    // admin only, re-upload image
    <AdminArea>
      <Grid item xs={12}>
        <Button variant="contained" onClick={deleteS3Object}>
          Delete
        </Button>
        <Tooltip title="Re-upload image (admin only)" position="top">
          <Button variant="contained" color="primary" component="label">
            Re-upload Image
            <input
              ref={fileInputRef}
              hidden
              type="file"
              onChange={handleUpload}
            />
          </Button>
        </Tooltip>
      </Grid>
    </AdminArea>
  );
}
