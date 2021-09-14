import './App.css';
import AppRouter from './navigation/AppRouter';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Footer from './components/shared/Footer';
import { useAuth } from './context/currentUser';
import Loading from './components/shared/Loading';
import appTheme from './appTheme';
import Snackbar from '@material-ui/core/Snackbar';
import { useAlerts } from './context/alertsContext';
import Alert from '@material-ui/lab/Alert';
import BgImage from './assets/images/summoners_rift.jpg';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#121923', // fallback for no rgba support
    background: 'rgba(0, 0, 0, 0.61)', // dark filter to darken bg image

    '&::before': {
      background: `url(${BgImage})`, // background image
      backgroundSize: 'cover',
      content: '""',
      position: 'fixed', // background scrolls with user (user doesn't notice), absolute: doesn't scroll with user
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      filter: 'blur(6px)', // blurred
      zIndex: -1, // behind page-content z-index
    },
  },
});

function App() {
  const { loading: verifyingUser } = useAuth();
  const { currentAlert, closeAlert } = useAlerts();
  const classes = useStyles();

  if (verifyingUser) {
    return (
      <div className={classes.root}>
        <Loading text="Verifying user..." />;
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />

        {currentAlert && (
          // if there is an alert in the context, show it
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={6000} // autohide will set the current alert to null in the state.
            open={currentAlert.message ? true : false}
            onClose={closeAlert}
            message={currentAlert.message}>
            <Alert
              variant="filled"
              onClose={closeAlert}
              severity={currentAlert.type.toLowerCase()}>
              <strong>{currentAlert.type}</strong> - {currentAlert.message}
            </Alert>
          </Snackbar>
        )}

        <AppRouter />
        <Footer />
      </ThemeProvider>
    </div>
  );
}

export default App;
