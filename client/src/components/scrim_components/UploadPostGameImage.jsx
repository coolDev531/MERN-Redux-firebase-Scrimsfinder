import { useScrims } from './../../context/scrimsContext';
import { useContext, useRef } from 'react';
import { Tooltip, Grid, Button } from '@material-ui/core';
import S3FileUpload from 'react-s3';
import { addImageToScrim } from '../../services/scrims';
import AdminArea from '../shared/AdminArea';
import { CurrentUserContext } from '../../context/currentUser';

const MAX_FILE_SIZE_MIB = 0.953674; // 1 megabyte (in Memibyte format)

export default function UploadPostGameImage({ scrim, isUploaded }) {
  const { currentUser } = useContext(CurrentUserContext);
  const fileInputRef = useRef();
  const { fetchScrims } = useScrims();

  const config = {
    bucketName: 'lol-scrimsfinder-bucket',
    dirName: `postGameLobbyImages/${scrim._id}` /* optional */,
    region: 'us-east-1',
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  };

  const upload = (e) => {
    if (e.target.files.length === 0) return;

    let file = e.target.files[0];
    let fileName = [...file.name];

    const fileSize = file.size / 1024 / 1024; // in MiB

    if (!/^image\//.test(file.type)) {
      // if file type isn't an image, return
      fileInputRef.current.value = '';
      alert(`File ${file.name} is not an image! \nonly images are allowed.`);
      return;
    }

    if (fileSize > MAX_FILE_SIZE_MIB) {
      fileInputRef.current.value = '';
      alert(`File ${file.name} is too big! \nmax allowed size: 1 MB.`);
      return;
    }

    // if file name has sapces, return.
    if (fileName.includes(' ')) {
      fileInputRef.current.value = '';
      alert(`No spaces in name of file allowed \n name of file: ${file?.name}`);
      return;
    }

    let yes = window.confirm('Are you sure you want to upload this image?');

    if (!yes) {
      // empty the value inside the file upload so user can retry again...
      fileInputRef.current.value = '';
      return;
    }

    S3FileUpload.uploadFile(file, config)
      .then(async (bucketData) => {
        let dataSending = {
          ...bucketData,
          uploadedBy: { ...currentUser },
        };
        const addedImg = await addImageToScrim(scrim._id, dataSending);
        if (addedImg) {
          console.log(
            '%csuccessfully added an image for scrim: ' + scrim._id,
            'color: lightgreen'
          );
          fetchScrims();
        }
      })
      .catch((err) => {
        alert(err);
      });
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
        <h3 className="text-black">Upload post-game lobby image:</h3>
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
              onChange={upload}
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
        <Tooltip title="Re-upload image (admin only)" position="top">
          <Button variant="contained" color="primary" component="label">
            Re-upload Image
            <input ref={fileInputRef} hidden type="file" onChange={upload} />
          </Button>
        </Tooltip>
      </Grid>
    </AdminArea>
  );
}
