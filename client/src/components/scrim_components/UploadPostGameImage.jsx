import { useRef, useState } from 'react';
import useAuth from './../../hooks/useAuth';
import useAlerts from '../../hooks/useAlerts';

// components
import AdminArea from '../shared/AdminArea';
import Tooltip from '../shared/Tooltip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

// utils
import {
  addImageToScrim,
  removeImageFromScrim,
} from '../../services/scrims.services';
import * as FileManipulator from '../../models/FileManipulator';
import * as ImageManipulator from '../../models/ImageManipulator';

// icons
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/DeleteForever';

// can also delete image here... maybe needs renaming
export default function UploadPostGameImage({
  scrim,
  setScrim,
  isUploaded,
  socket,
}) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef();
  const { setCurrentAlert } = useAlerts();
  const [buttonDisabled, setButtonDisabled] = useState(false); // disable when uploading / deleting img

  const handleDeleteImage = async () => {
    try {
      let yes = window.confirm('Are you sure you want to delete this image?');

      if (!yes) return;

      setButtonDisabled(true);

      let updatedScrim = await removeImageFromScrim(scrim._id);

      if (updatedScrim?.createdBy) {
        setCurrentAlert({
          type: 'Success',
          message: 'image deleted successfully',
        });

        setScrim(updatedScrim);
        socket?.emit('sendScrimTransaction', updatedScrim);
      }

      setButtonDisabled(false);
    } catch (error) {
      setButtonDisabled(false);

      const errorMsg = error?.response?.data?.error ?? 'error removing image';
      setCurrentAlert({ type: 'Error', message: JSON.stringify(errorMsg) });
    }
  };

  const handleUpload = async (e) => {
    if (e.target.files.length === 0) return;
    let file = e.target.files[0];

    const isImage = await FileManipulator.checkIsImage({
      file,
      fileInputRef,
      setCurrentAlert,
    });

    if (!isImage) return;

    const isValidSize = await FileManipulator.checkFileSize({
      file,
      fileInputRef,
      maxFileSizeMib: 1.9073500003815,
    });

    if (!isValidSize) {
      if (setCurrentAlert) {
        setCurrentAlert({
          type: 'Error',
          message: `File ${file.name} is too big! \nmax allowed size: 2 MB.`,
        });
      }
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

      const base64 = await ImageManipulator.resize(file);

      const requestBody = {
        timestampNow: Date.now(),
        base64,
        uploadedBy: currentUser._id,
      };

      const updatedScrim = await addImageToScrim(
        scrim._id,
        requestBody,
        setCurrentAlert
      );

      if (updatedScrim?.createdBy) {
        setCurrentAlert({
          type: 'Success',
          message: 'image uploaded successfully',
        });

        setScrim(updatedScrim);

        socket?.emit('sendScrimTransaction', updatedScrim);
      }

      setButtonDisabled(false);
    } catch (error) {
      setButtonDisabled(false);
      const errorMsg = error?.response?.data?.error ?? JSON.stringify(error);

      setCurrentAlert({
        type: 'Error',
        message: errorMsg.toString(),
      });
    }
  };

  return !isUploaded ? (
    <Grid
      item
      container
      direction="column"
      alignItems="flex-start"
      justifyContent="center"
      xs={12}
      spacing={1}>
      <Grid item>
        <FormHelperText style={{ userSelect: 'none' }}>
          Upload post-game lobby image
        </FormHelperText>
      </Grid>
      <Grid item>
        <Tooltip
          title={
            <Typography
              style={{
                fontSize: 'clamp(0.8rem, 4vw, 1rem)',
                fontWeight: 700,
              }}
              variant="body2">
              Validate winner by uploading end of game results. <br />
              <strong style={{ color: 'red' }}>* image format only</strong>
            </Typography>
          }
          placement="top">
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            disabled={buttonDisabled}
            component="label">
            Upload
            <input
              accept="image/jpeg, image/png"
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
          <Tooltip title="Delete post-game image (admin only)" placement="top">
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
