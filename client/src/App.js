import './App.css';
// hooks
import { useAuth } from './context/currentUser';
import { useAlerts } from './context/alertsContext';

// styles
import { appTheme } from './appTheme';
import { useAppStyles } from './styles/App.styles';

// components
import AppRouter from './navigation/AppRouter';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Loading from './components/shared/Loading';
import Footer from './components/shared/Footer';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

function App() {
  const { loading: verifyingUser } = useAuth();
  const { currentAlert, closeAlert } = useAlerts();
  const classes = useAppStyles();

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
              {/* example: success - scrim created successfully! */}
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
