import { useContext, useState, useEffect } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { mockScrims } from '../mocks/scrims.mock';

export default function Scrims() {
  const [currentUser] = useContext(CurrentUserContext);
  const [scrims, setScrims] = useState([]);

  useEffect(() => {
    setScrims(mockScrims);
  }, []);

  return (
    <div>
      <h1>home</h1>
      <h2>welcome:</h2>
      {currentUser && <pre>{JSON.stringify(currentUser, null, 2)}</pre>}

      <div id="scrims-container">
        {scrims.map((scrim) => (
          <div class="one-scrim-container">
            <h1>scrim</h1>
            <h2>
              Game Start: {new Date(scrim.gameStartTime).toLocaleString()}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
