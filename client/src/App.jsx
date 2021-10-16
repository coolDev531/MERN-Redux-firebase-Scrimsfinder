import './App.css';

// hooks
import useAppBackground from './hooks/useAppBackground';
import useAlerts from './hooks/useAlerts';
import useAuth, {
  useAuthVerify,
  useRefreshNotifications,
} from './hooks/useAuth';
import { useFetchScrims, useSetScrimsRegion } from './hooks/useScrims';
import { useFetchUsers } from './hooks/useUsers';

// styles
import { appTheme } from './appTheme';
import { useAppStyles } from './styles/App.styles';

// components
import AppRouter from './navigation/AppRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Loading from './components/shared/Loading';
import Footer from './components/shared/Footer';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AppModals from './components/modals/AppModals';
import { Helmet } from 'react-helmet';
import useMessenger from './hooks/useMessenger';

function App() {
  const classes = useAppStyles();

  const { isVerifyingUser } = useAuth();
  const { currentAlert, closeAlert } = useAlerts();

  const appWrapperRef = useAppBackground(); // change the background image and blur whenever appBackground or appBgBlur change in the redux store

  useAuthVerify(); // verify user is authenticated.
  useFetchUsers(); // fetch all users (for search and settings page)
  useSetScrimsRegion(); // set scrims region to users region on mount and when user changes it on settings
  useFetchScrims(); // fetch scrims on mount or path change
  useRefreshNotifications(); // reload user notifications on every path change.
  useMessenger();

  if (isVerifyingUser) {
    return (
      <div ref={appWrapperRef} className={classes.root}>
        <Loading text="Verifying user..." />;
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Bootcamp LoL Scrim Gym</title>
        <meta name="description" content="Find LoL Custom Lobbies!" />
      </Helmet>

      <div className={classes.root} ref={appWrapperRef}>
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
                {/* example: success - scrim created successfully! */}
                <strong>{currentAlert.type}</strong> - {currentAlert.message}
              </Alert>
            </Snackbar>
          )}

          <AppRouter />
          <Footer />

          <AppModals />
        </ThemeProvider>
      </div>
    </>
  );
}

export default App;
