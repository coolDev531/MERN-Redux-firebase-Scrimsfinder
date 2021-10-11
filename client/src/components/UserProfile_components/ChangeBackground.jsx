import { useState } from 'react';
import { useSelector } from 'react-redux';
// components
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';

// services
import { updateUser } from './../../services/auth';

// utils
import devLog from './../../utils/devLog';

export default function ChangeBackground({ userBg, setUserBg, userId }) {
  const [disabled, setDisabled] = useState(false);
  const { currentUser } = useSelector(({ auth }) => auth);
  const handleChangeImage = async (e) => {
    if (currentUser._id !== userId) return;
    const bgImg = e.target.value;
    setDisabled(true);

    setUserBg((prevState) => ({
      ...prevState,
      img: bgImg,
    }));

    setTimeout(async () => {
      const updatedUser = await updateUser(userId, {
        ...currentUser,
        profileBackgroundImg: bgImg,
      });

      devLog('updated user background', updatedUser.user.profileBackgroundImg);

      setTimeout(() => {
        setDisabled(false);
      }, 1000);
    }, 200);
  };

  const handleChangeBlur = async (e) => {
    if (currentUser._id !== userId) return;
    setDisabled(true);
    let blurValue = e.target.value;

    setUserBg((prevState) => ({
      ...prevState,
      blur: blurValue,
    }));

    setTimeout(async () => {
      let updatedUser = await updateUser(userId, {
        ...currentUser,
        profileBackgroundBlur: blurValue,
      });

      devLog(
        'updated user background blur',
        updatedUser.user.profileBackgroundBlur
      );

      setTimeout(() => {
        setDisabled(false);
      }, 1000);
    }, 200);
  };

  return (
    <FormGroup row>
      <FormControl>
        <InputLabel>Change Profile Background</InputLabel>
        <Select
          value={userBg.img}
          disabled={disabled}
          label="background image"
          onChange={handleChangeImage}>
          <MenuItem value="Summoners Rift">Summoners Rift</MenuItem>
          <MenuItem value="Anniversary">Anniversary</MenuItem>
          <MenuItem value="GitCat">GitCat</MenuItem>
        </Select>
      </FormControl>

      <FormControl style={{ marginLeft: '20px' }}>
        <InputLabel>Change Background Blur</InputLabel>
        <Select
          disabled={disabled}
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
    </FormGroup>
  );
}
