import { makeStyles } from '@mui/styles';

export const useProfileStyles = makeStyles((theme) => ({
  myCreatedScrimsList: {
    padding: 0,
    margin: 0,
    maxHeight: '300px',
    overflowY: 'auto',
    listStyle: 'inside',

    '& > li': {
      marginBottom: '10px',
    },
  },

  saveBackgroundBtn: {
    height: '50px',
    alignSelf: 'center',
    marginLeft: '10px',
    marginTop: '20px',
  },

  changeBgBlur: {
    marginLeft: '20px',
  },
}));
