import { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ScrimSection from '../components/ScrimSection';
import { getScrimById } from '../services/scrims';
import { ScrimsContext } from '../context/scrimsContext';
import Navbar from '../components/shared/Navbar';
import { Helmet } from 'react-helmet';
import LoadingGif from '../assets/images/loading.gif';
import { Typography } from '@material-ui/core';

export default function ScrimDetail() {
  const { id } = useParams();
  const [scrim, setScrim] = useState(null);
  const { scrims } = useContext(ScrimsContext);
  const history = useHistory();

  useEffect(() => {
    const fetchScrimData = async () => {
      try {
        const scrimData = await getScrimById(id);
        if (scrimData) {
          setScrim(scrimData);
        }
        // push to / if scrim not found.
      } catch (error) {
        history.push('/');
      }
    };
    fetchScrimData();
    // run this on mount and everytime scrims change.
  }, [id, scrims, history]);

  if (!scrim)
    return (
      <main className="page-content">
        <div className="centered">
          <div className="loading-wrapper">
            <div className="content-container">
              <Typography variant="h4" align="center" gutterBottom>
                Loading Scrim Data...
              </Typography>
              <img className="loading" src={LoadingGif} alt="loading" />
            </div>
          </div>
        </div>
      </main>
    );

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>LoL Scrims Finder</title>
        <meta
          name="description"
          content="Visit this scrim at LoL Scrims Finder!"
        />
      </Helmet>

      <Navbar showLess />
      <main className="page-content">
        <div id={`scrim-container ${scrim._id}`}>
          <ScrimSection scrim={scrim} isInDetail />
        </div>
      </main>
    </div>
  );
}
