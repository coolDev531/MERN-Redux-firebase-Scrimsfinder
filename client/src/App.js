import './App.css';
import AppRouter from './navigation/AppRouter';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Footer from './components/shared/Footer';
import { useAuth } from './context/currentUser';
import Loading from './components/shared/Loading';
import appTheme from './appTheme';

function App() {
  const { loading: verifyingUser } = useAuth();

  if (verifyingUser) {
    return <Loading text="Verifying user..." />;
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppRouter />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
