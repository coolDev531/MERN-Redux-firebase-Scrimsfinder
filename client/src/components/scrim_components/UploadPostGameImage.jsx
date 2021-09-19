import { useRef, useState } from 'react';
import { useScrims } from './../../context/scrimsContext';
import { useAuth } from './../../context/currentUser';

// components
import AdminArea from '../shared/AdminArea';
import Tooltip from '../shared/Tooltip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// utils
import S3FileUpload from 'react-s3';
import { addImageToScrim, removeImageFromScrim } from '../../services/scrims';
import { useAlerts } from '../../context/alertsContext';

// icons
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/DeleteForever';

// constants
const MAX_FILE_SIZE_MIB = 0.953674; // 1 megabyte (in Memibyte format)

/**
 * @method changeFileName
 * takes a file and changes its name
 * @param {File} file the file that is going to have it's name changes
 * @param {String} scrimId {scrim._id}
 */
const changeFileName = async (file, scrimId) => {
  // does this have to be async?
  let fileExtension = file.name.substring(file.name.lastIndexOf('.')); // .jpg, .png, etc...
  let newFileName = `${scrimId}-${Date.now()}${fileExtension}`; // make a new name: scrim._id, current time, and extension

  // change name of file to something more traceable (I don't want users random names).
  return Object.defineProperty(file, 'name', {
    writable: true,
    value: newFileName, // file extension isn't necessary with this approach.
  });
};

// can also delete image here... maybe needs renaming
export default function UploadPostGameImage({ scrim, isUploaded }) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef();
  const { fetchScrims } = useScrims();
  const { setCurrentAlert } = useAlerts();
  const [buttonDisabled, setButtonDisabled] = useState(false); // disable when uploading / deleting img

  const config = {
    bucketName: 'lol-scrimsfinder-bucket',
    dirName: `postGameLobbyImages/${scrim._id}` /* optional */,
    region: 'us-east-1',
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  };

  const handleDeleteImage = async () => {
    try {
      let yes = window.confirm('Are you sure you want to delete this image?');

      if (!yes) return;

      setButtonDisabled(true);
      await removeImageFromScrim(scrim._id);

      setCurrentAlert({
        type: 'Success',
        message: 'image deleted successfully',
      });

      fetchScrims();
      setButtonDisabled(false);
    } catch (err) {
      setCurrentAlert({ type: 'Error', message: 'error removing image' });
      setButtonDisabled(false);
    }
  };

  const handleUpload = async (e) => {
    if (e.target.files.length === 0) return;
    let file = e.target.files[0];

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
      setButtonDisabled(true);

      // does this have to be a promise?
      await changeFileName(file, scrim._id); // change the file name to something more traceable.

      // upload the image to S3
      const bucketData = await S3FileUpload.uploadFile(file, config);

      // after it has been successfully uploaded to S3, put the new image data in the back-end
      let newImage = {
        ...bucketData,
        uploadedBy: { ...currentUser },
      };

      const addedImg = await addImageToScrim(
        scrim._id,
        newImage,
        setCurrentAlert
      );
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

        setButtonDisabled(false);
      }
    } catch (err) {
      console.log('error uploading image:', err);
      setCurrentAlert({
        type: 'Error',
        message: err,
      });
      setButtonDisabled(false);
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
        <Typography variant="h3">Upload post-game lobby image:</Typography>
      </Grid>
      <Grid item xs={4}>
        <Tooltip
          title="Validate winner by uploading end of game results"
          placement="top">
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            disabled={buttonDisabled}
            component="label">
            Upload
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
      <Grid item container direction="row" xs={12}>
        <Grid item>
          <Tooltip title="Delete post-game image (admin only)" position="top">
            <Button
              disabled={buttonDisabled}
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteImage}>
              Delete Image
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </AdminArea>
  );
}
