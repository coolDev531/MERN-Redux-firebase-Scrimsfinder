import { useState } from 'react';
import { useSelector } from 'react-redux';
import useAlerts from './../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';

// services
import { updateUser } from '../../services/auth.services';

// utils
import devLog from './../../utils/devLog';

// icons
import SaveIcon from '@mui/icons-material/Create';
import { BG_IMAGES } from '../../utils/imageMaps';

export default function ChangeBackground({ userBg, setUserBg, userId }) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const { currentUser } = useSelector(({ auth }) => auth);
  const { setCurrentAlert } = useAlerts();

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'));

  const handleChangeImage = async (e) => {
    if (currentUser._id !== userId) return;
    const bgImgValue = e.target.value;

    setUserBg((prevState) => ({
      ...prevState,
      img: bgImgValue,
    }));
  };

  const handleChangeBlur = async (e) => {
    if (currentUser._id !== userId) return;
    let blurValue = e.target.value;

    setUserBg((prevState) => ({
      ...prevState,
      blur: blurValue,
    }));
  };

  const onSaveBackground = async () => {
    const blurValue = userBg.blur ?? '20';
    const bgImgValue = userBg.img ?? 'Summoners Rift';

    setButtonsDisabled(true);

    try {
      const updatedUser = await updateUser({
        ...currentUser,
        profileBackgroundImg: bgImgValue,
        profileBackgroundBlur: blurValue,
      });

      if (updatedUser) {
        devLog('updated user background details', updatedUser.user);
        setCurrentAlert({
          type: 'Success',
          message: 'Profile background updated!',
        });
      }
      setButtonsDisabled(false);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error updating background',
      });

      setButtonsDisabled(false);
      throw error;
    }
  };

  return (
    <FormGroup row>
      <FormControl>
        <InputLabel>Change Profile Background</InputLabel>
        <Select
          style={{ maxWidth: '200px' }}
          value={userBg.img}
          disabled={buttonsDisabled}
          label="background image"
          onChange={handleChangeImage}>
          {[...Object.keys(BG_IMAGES)].map((imgKey) => (
            <MenuItem value={imgKey} key={imgKey}>
              {imgKey}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl style={{ marginLeft: !matchesSm ? '0' : '20px' }}>
        <InputLabel>Change Background Blur</InputLabel>
        <Select
          disabled={buttonsDisabled}
          value={userBg.blur}
          label="background image"
          onChange={handleChangeBlur}>
          <MenuItem value="4">Min</MenuItem>
          <MenuItem value="6">Low</MenuItem>
          <MenuItem value="10">Medium</MenuItem>
          <MenuItem value="14">Ultra</MenuItem>
          <MenuItem value="20">Max</MenuItem>
        </Select>
      </FormControl>

      <Button
        style={{
          height: '50px',
          alignSelf: 'center',
          marginLeft: !matchesSm ? '0' : '20px',
          marginTop: '20px',
        }}
        startIcon={<SaveIcon />}
        variant="contained"
        disabled={buttonsDisabled}
        onClick={onSaveBackground}>
        Save
      </Button>
    </FormGroup>
  );
}
