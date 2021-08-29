import { useState, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import ScrimSection from '../components/ScrimSection';
import { getScrimById } from '../services/scrims';

export default function ScrimDetail() {
  const { id } = useParams();
  const [scrim, setScrim] = useState(null);

  useEffect(() => {
    const fetchScrimData = async () => {
      const scrimData = await getScrimById(id);

      setScrim(scrimData);
    };
    fetchScrimData();
  }, [id]);

  if (!scrim) return <></>;

  return (
    <main className="page-content">
      <div id="scrim-container" className="centered">
        <Grid>
          <ScrimSection scrim={scrim} />
        </Grid>
      </div>
    </main>
  );
}
