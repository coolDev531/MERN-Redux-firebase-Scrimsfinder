import './App.css';
import AppRouter from './navigation/AppRouter';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Footer from './components/shared/Footer';
import { useAuth } from './context/currentUser';
import Loading from './components/shared/Loading';
import appTheme from './appTheme';
import Snackbar from '@material-ui/core/Snackbar';
import { useAlerts } from './context/alertsContext';
import Alert from '@material-ui/lab/Alert';

function App() {
  const { loading: verifyingUser } = useAuth();
  const { currentAlert, closeAlert } = useAlerts();

  if (verifyingUser) {
    return <Loading text="Verifying user..." />;
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />

      {currentAlert && (
        // if there is an alert in the context, show it
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={6000}
          open={currentAlert}
          onClose={closeAlert}
          message={currentAlert.message}>
          <Alert
            variant="filled"
            onClose={closeAlert}
            severity={currentAlert.type}>
            <strong>{currentAlert.type}</strong> - {currentAlert.message}
          </Alert>
        </Snackbar>
      )}

      <AppRouter />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
