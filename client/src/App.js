import './App.css';
import AppRouter from './navigation/AppRouter';
import { createTheme, ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Footer from './components/shared/Footer';

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
    },

    p: {
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      color: 'green',
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
