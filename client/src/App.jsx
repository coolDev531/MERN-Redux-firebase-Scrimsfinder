import './App.css';

// hooks
import useAppBackground from './hooks/useAppBackground';
import useAuth, { useAuthVerify } from './hooks/useAuth';
import { useFetchScrims, useSetScrimsRegion } from './hooks/useScrims';
import { useFetchUsers } from './hooks/useUsers';
import useMessenger from './hooks/useMessenger';
import useNotifications from './hooks/useNotifications';
import useServerStatus from './hooks/useServerStatus';
import { useCreateSocket } from './hooks/useSocket';

// styles
import { useAppStyles } from './styles/App.styles';

// components
import AppRouter from './navigation/AppRouter';
import CssBaseline from '@mui/material/CssBaseline';
import Loading from './components/shared/Loading';
import Footer from './components/shared/Footer';
import AppModals from './components/modals/AppModals';
import CurrentAlertSnackbar from './components/shared/CurrentAlertSnackbar';
import { Helmet } from 'react-helmet';

function App() {
  const classes = useAppStyles();

  const { isVerifyingUser } = useAuth();

  const appWrapperRef = useAppBackground(); // change the background image and blur whenever appBackground or appBgBlur change in the redux store

  useServerStatus(); // check if server is online, if it's not redirects to error page.
  useCreateSocket(); // create socket for messenger
  useAuthVerify(); // verify user is authenticated.
  useFetchUsers(); // fetch all users (for search and settings page)
  useSetScrimsRegion(); // set scrims region to users region on mount and when user changes it on settings
  useFetchScrims(); // fetch scrims on mount or path change
  useMessenger(); // listen for messenger socket events
  useNotifications(); // reload user notifications on socket events

  if (isVerifyingUser) {
    return (
      <div ref={appWrapperRef} className={classes.root}>
        <Loading text="Verifying user" />;
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
        <CssBaseline />
        <CurrentAlertSnackbar />
        <AppRouter />
        <Footer />
        <AppModals />
      </div>
    </>
  );
}

export default App;
