import { useSelector } from 'react-redux';

// components
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/FormControl';

// services
import { updateUser } from './../../services/auth';

// utils
import devLog from './../../utils/devLog';

export default function ChangeBackground({ userBg, setUserBg, userId }) {
  const { currentUser } = useSelector(({ auth }) => auth);

  const handleChangeImage = async (e) => {
    if (currentUser._id !== userId) return;

    setUserBg((prevState) => ({
      ...prevState,
      img: e.target.value,
    }));

    setTimeout(async () => {
      let updatedUser = await updateUser(userId, {
        ...currentUser,
        profileBackgroundImg: e.target.value,
      });

      devLog('updated user background', updatedUser.user.profileBackgroundImg);
    }, 100);
  };

  const handleChangeBlur = async (e) => {
    if (currentUser._id !== userId) return;

    setUserBg((prevState) => ({
      ...prevState,
      blur: e.target.value,
    }));

    setTimeout(async () => {
      let updatedUser = await updateUser(userId, {
        ...currentUser,
        profileBackgroundBlur: e.target.value,
      });

      devLog(
        'updated user background blur',
        updatedUser.user.profileBackgroundBlur
      );
    }, 100);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel>Change Profile Background</InputLabel>
        <Select
          value={userBg.img}
          label="background image"
          onChange={handleChangeImage}>
          <MenuItem value="Summoners Rift">Summoners Rift</MenuItem>
          <MenuItem value="Anniversary">Anniversary</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Change Background Blur</InputLabel>
        <Select
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
    </Box>
  );
}
