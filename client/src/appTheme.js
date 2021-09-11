import { createTheme } from '@material-ui/core';

const appTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#FBC02D',
      contrastText: '#000',
    },

    // secondary: {},
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    h1: {
      color: '#fff',
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontSize: '2em',
      fontWeight: 'bold',
      marginTop: '0.67em',
      marginBottom: '0.67em',
      marginLeft: 0,
      marginRight: 0,
    },

    h2: {
      fontSize: '1.5em',
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 'bold',
      marginBlockStart: '0.83em',
      marginBlockEnd: '0.83em',
      color: 'black',
    },

    h3: {
      display: 'block',
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontSize: '1.17em',
      marginTop: '1em',
      marginBottom: '1em',
      marginLeft: 0,
      marginRight: 0,
      fontWeight: 'bold',
    },

    h5: {
      fontSize: '0.83em',
      fontWeight: 'bold',
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      lineHeight: '1.4',
      color: '#000',
    },

    p: {
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      color: 'green',
      fontWeight: 600,
      display: 'block',
      marginBlockStart: '1em',
      marginBlockEnd: '1em',
      marginInlineStart: '0px',
      marginInlineEnd: '0px',
      fontSize: '22px',
    },
  },
});

export default appTheme;
