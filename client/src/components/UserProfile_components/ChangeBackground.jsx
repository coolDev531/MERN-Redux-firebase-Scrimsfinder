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

  const handleChangeBackground = async (e) => {
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

      devLog('updated user background', updatedUser.profileBackgroundImg);
    }, 100);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel>Change Profile Background</InputLabel>
        <Select
          value={userBg.img}
          label="background image"
          onChange={handleChangeBackground}>
          <MenuItem value="Summoners Rift">Summoners Rift</MenuItem>
          <MenuItem value="Anniversary">Anniversary</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
