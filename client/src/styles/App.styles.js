// utils
import { makeStyles } from '@mui/styles';

import BgImage from '../assets/images/backgrounds/summoners_rift.jpg';
import { COLORS } from './../appTheme';

export const useAppStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: COLORS.GREY_DEFAULT, // fallback for no rgba support
    backgroundColor: COLORS.DARK_TRANSPARENT, // dark filter to darken bg image

    '&::before': {
      background: `url(${BgImage})`, // background image
      backgroundSize: 'cover',
      content: '""',
      position: 'fixed', // background scrolls with user (user doesn't notice), absolute: doesn't scroll with user
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      filter: 'blur(20px)', // blurred
      zIndex: -1, // behind page-content z-index
    },
  },
});
