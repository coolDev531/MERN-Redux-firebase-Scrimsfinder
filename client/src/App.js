import './App.css';
import { useEffect } from 'react';
import { CurrentUserContext } from './context/currentUser';
import { useContext } from 'react';
import AppRouter from './navigation/AppRouter';
import { useHistory } from 'react-router-dom';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

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
  const [currentUser] = useContext(CurrentUserContext);
  const { push } = useHistory();

  useEffect(() => {
    if (!currentUser) {
      return push('./user-setup');
    }
    // eslint-disable-next-line
  }, [currentUser]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* <main className="page-content"> */}
      <AppRouter />
      {/* </main> */}
    </ThemeProvider>
  );
}

export default App;
