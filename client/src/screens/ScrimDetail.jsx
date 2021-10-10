import { useState, useEffect } from 'react';
import useScrims from './../hooks/useScrims';
import { useParams, useHistory } from 'react-router-dom';
import ScrimSection from '../components/scrim_components/ScrimSection';
import Navbar from '../components/shared/Navbar/Navbar';
import { Helmet } from 'react-helmet';
import Loading from '../components/shared/Loading';
import { PageContent } from '../components/shared/PageComponents';
import { getScrimById } from '../services/scrims';

export default function ScrimDetail() {
  const { id } = useParams();
  const [scrim, setScrim] = useState(null);
  const { scrims } = useScrims();
  const history = useHistory();

  useEffect(() => {
    const fetchScrimData = async () => {
      try {
        const scrimData = await getScrimById(id);
        if (scrimData) {
          setScrim(scrimData);
        }
        // push to /scrims if scrim not found.
      } catch (error) {
        history.push('/scrims');
      }
    };
    fetchScrimData();
    // run this on mount and everytime scrims change.
  }, [id, scrims, history]);

  if (!scrim) return <Loading text="Loading Scrim Data..." />;

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          Bootcamp LoL Scrim Gym |{' '}
          {scrim?.title ?? `${scrim.createdBy.name}'s Scrim`}
        </title>
        <meta
          name="description"
          content="Visit this scrim at LoL Scrims Finder!"
        />
      </Helmet>

      <Navbar showLess onClickBack={() => history.push('/scrims')} />
      <PageContent>
        <div className={`scrim__container ${scrim?._id}`}>
          <ScrimSection scrim={scrim} isInDetail />
        </div>
      </PageContent>
    </div>
  );
}
