import './App.css';
import { useEffect } from 'react';
import { CurrentUserContext } from './context/currentUser';
import { useContext } from 'react';
import AppRouter from './navigation/AppRouter';
import { useHistory } from 'react-router-dom';
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
});

function App() {
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const { push } = useHistory();

  useEffect(() => {
    if (!currentUser) {
      return push('./user-setup');
    }
    // eslint-disable-next-line
  }, [currentUser]);

  useEffect(() => {
    //  dev mode testing commands
    if (process.env.NODE_ENV === 'development') {
      window.setUser = (data) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          name: data,
        }));
      };

      window.setAdminKey = (data) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          adminKey: data,
        }));
      };

      window.getEnv = () => console.log(process.env);
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
