import './App.css';
import AppRouter from './navigation/AppRouter';
import { createTheme, ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Footer from './components/shared/Footer';
import { useAuth } from './context/currentUser';
import Loading from './components/shared/Loading';

const theme = createTheme({
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
    },

    h2: {
      fontSize: '1.5em',
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 'bold',
      marginBlockStart: '0.83em',
      marginBlockEnd: '0.83em',
      color: 'black',
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

function App() {
  const { loading: verifyingUser } = useAuth();

  if (verifyingUser) {
    return <Loading text="Verifying user..." />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
