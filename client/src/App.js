import './App.css';
import { useEffect } from 'react';
import { CurrentUserContext } from './context/currentUser';
import { useContext } from 'react';
import AppRouter from './navigation/AppRouter';
import { useHistory } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Footer from './components/shared/Footer';
import devLog from './utils/devLog';
import Navbar from './components/shared/Navbar';
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
});

function App() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const { push } = useHistory();

  useEffect(() => {
    if (!currentUser?.uid) {
      setCurrentUser(null); // for older users that didn't use google
      return push('./user-setup');
    }
    // eslint-disable-next-line
  }, [currentUser]);

  useEffect(() => {
    //  dev mode testing commands
    if (process.env.NODE_ENV === 'development') {
      window.setUsername = (value) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          name: value,
        }));
      };

      window.setUserUid = (value) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          uid: value,
        }));
      };

      window.setAdminKey = (value) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          adminKey: value,
        }));
      };

      window.setUserId = (value) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          _id: value,
        }));
      };

      window.getEnv = () => devLog(process.env);
    }

    // eslint-disable-next-line
  }, [currentUser]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />

      <Footer />
    </ThemeProvider>
  );
}

export default App;
