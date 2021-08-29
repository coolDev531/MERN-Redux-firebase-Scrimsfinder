import { useState, useEffect, useContext } from 'react';
import { Grid } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import ScrimSection from '../components/ScrimSection';
import { getScrimById } from '../services/scrims';
import { ScrimsContext } from '../context/scrimsContext';
import Navbar from '../components/shared/Navbar';

export default function ScrimDetail() {
  const { id } = useParams();
  const [scrim, setScrim] = useState(null);
  const { scrims } = useContext(ScrimsContext);

  useEffect(() => {
    const fetchScrimData = async () => {
      const scrimData = await getScrimById(id);
      setScrim(scrimData);
    };
    fetchScrimData();
    // run this on mount and everytime scrims change.
  }, [id, scrims]);

  if (!scrim) return <></>;

  return (
    <div>
      <Navbar showLess />
      <main className="page-content" style={{ paddingBottom: '40px' }}>
        <section className="page-section scrim">
          <div id={`scrim-container ${scrim._id}`}>
            <ScrimSection scrim={scrim} />
          </div>
        </section>
      </main>
    </div>
  );
}
