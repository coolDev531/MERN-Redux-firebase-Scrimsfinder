import { createTheme } from '@mui/material/styles';

export const COLORS = {
  DARK: '#101820',
  DARK_TRANSPARENT: 'rgba(0, 0, 0, 0.61)', // dark filter to darken bg image

  DK_BLUE: 'rgba(18,25,35)',
  DK_BLUE_TRANSPARENT: 'rgba(18,25,35,.85)', // dark filter to darken bg image

  EGGSHELL_WHITE: '#d1dcde',
  BROWN: '#573625',

  GREY_DEFAULT: '#303030',
  GREY_PAPER: '#424242',
};

export const appTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  palette: {
    mode: 'dark',

    primary: {
      main: COLORS.EGGSHELL_WHITE,
      contrastText: COLORS.BROWN,
      linkColor: '#fff',
    },

    secondary: {
      main: COLORS.BROWN,
      linkColor: COLORS.DARK,
      contrastText: '#fff',
    },

    background: {
      default: COLORS.GREY_DEFAULT,
      paper: COLORS.GREY_PAPER,
    },
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: ['Montserrat', 'sans-serif'].join(','),

    h1: {
      color: '#fff',
      fontSize: '2em',
      fontWeight: 'bold',
      marginTop: '0.67em',
      marginBottom: '0.67em',
      marginLeft: 0,
      marginRight: 0,
    },

    h2: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      marginBlockStart: '0.83em',
      marginBlockEnd: '0.83em',
      color: '#fff',
    },

    span: {
      color: '#fff',
    },

    h3: {
      display: 'block',
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
      lineHeight: '1.4',
      color: '#000',
    },

    p: {
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

  // https://mui.com/customization/theme-components/
  components: {
    // Name of the component
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },

    // step component in signup page
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.DK_BLUE,
          boxShadow: '1px 0px 7px 1px #fff',
          padding: '20px',
          borderRadius: '4px',
        },
      },
    },

    // Navbar styles
    MuiAppBar: {
      styleOverrides: {
        root: {
          top: '0',
          zIndex: '5',
          borderBottom: '1px solid white',
          background: '#101820 !important', // fallback for no rgba support
          backgroundColor: `${COLORS.DK_BLUE_TRANSPARENT} !important`,
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
});
