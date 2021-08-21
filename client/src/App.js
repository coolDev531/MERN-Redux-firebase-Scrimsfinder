import './App.css';
import { CurrentUserContext } from './services/context/currentUser';
import { useContext } from 'react';
import Intro from './screens/Intro';

function App() {
  const [currentUser] = useContext(CurrentUserContext);

  return (
    <div className="App">
      {/* get hacking! */}
      {JSON.stringify(currentUser)}
      <Intro />
      League of Legends Scrim Finder
    </div>
  );
}

export default App;
