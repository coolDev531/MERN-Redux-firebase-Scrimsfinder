import { useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';

export default function Scrims() {
  const [currentUser] = useContext(CurrentUserContext);
  console.log({ currentUser });
  return (
    <div>
      <h1>home</h1>
      <h2>welcome:</h2>
      {currentUser && <pre>{JSON.stringify(currentUser, null, 2)}</pre>}
    </div>
  );
}
