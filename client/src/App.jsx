import './App.css';
// hooks
import { useLayoutEffect, useRef } from 'react';
import useAlerts from './hooks/useAlerts';
import useAuth, { useAuthVerify } from './hooks/useAuth';
import {
  useFetchScrims,
  useFetchScrimsInterval,
  useSetScrimsRegion,
} from './hooks/useScrims';
import { useLocation } from 'react-router-dom';

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
import { Helmet } from 'react-helmet';

import SummonersRiftImg from './assets/images/backgrounds/summoners_rift.jpg';

function App() {
  const { isVerifyingUser } = useAuth();
  const { currentAlert, closeAlert } = useAlerts();
  const { pathname } = useLocation();
  const classes = useAppStyles();
  const appWrapper = useRef();

  useAuthVerify(); // verify user is authenticated.
  useSetScrimsRegion(); // set scrims region to users region on mount and when user changes it on settings
  useFetchScrims(); // fetch scrims on mount or path change
  useFetchScrimsInterval(); // fetch scrims on 10 sec interval

  useLayoutEffect(() => {
    console.log('appwrapper');
    // this will change the background back to summoners rift when user clicks back from UserProfile
    appWrapper.current?.style.setProperty(
      '--bgImg',
      `url(${SummonersRiftImg})`
    );

    // eslint-disable-next-line
  }, [appWrapper.current, pathname]);

  if (isVerifyingUser) {
    return (
      <div ref={appWrapper} className={classes.root}>
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

      <div className={classes.root} ref={appWrapper} id="app__wrapper">
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

          <AppRouter appWrapper={appWrapper} />
          <Footer />
        </ThemeProvider>
      </div>
    </>
  );
}

export default App;
