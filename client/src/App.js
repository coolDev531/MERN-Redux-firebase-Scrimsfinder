import './App.css';
import { useEffect } from 'react';
import { CurrentUserContext } from './context/currentUser';
import { useContext } from 'react';
import AppRouter from './navigation/AppRouter';
import { useHistory } from 'react-router-dom';

function App() {
  const [currentUser] = useContext(CurrentUserContext);
  const { push } = useHistory();

  useEffect(() => {
    if (!currentUser) {
      return push('user-setup');
    }
    // eslint-disable-next-line
  }, [currentUser]);

  return (
    <main className="page-content">
      <AppRouter />
    </main>
  );
}

export default App;
