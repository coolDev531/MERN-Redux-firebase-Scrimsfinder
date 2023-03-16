import { useState, useEffect } from 'react';
import useScrims from './../hooks/useScrims';
import { useParams, useHistory } from 'react-router-dom';
import ScrimSection from '../components/scrim_components/ScrimSection';
import Navbar from '../components/shared/Navbar/Navbar';
import { Helmet } from 'react-helmet';
import Loading from '../components/shared/Loading';
import { PageContent } from '../components/shared/PageComponents';
import { getScrimById } from '../services/scrims.services';
import useAlerts from './../hooks/useAlerts';

export default function ScrimDetail() {
  const { id } = useParams();
  const [scrim, setScrim] = useState(null);
  const { scrims } = useScrims();
  const history = useHistory();
  const { setCurrentAlert } = useAlerts();

  useEffect(() => {
    const fetchScrimData = async () => {
      try {
        const scrimData = await getScrimById(id);
        if (scrimData?.createdBy) {
          setScrim(scrimData);
        } else {
          setCurrentAlert({
            type: 'Error',
            message: 'Scrim not found!, redirecting to home',
          });
          history.push('/scrims');
        }
      } catch (error) {
        console.log({ error });
        setCurrentAlert({
          type: 'Error',
          message: 'Error finding scrim, redirecting to home',
        });

        history.push('/scrims');
      }
    };
    fetchScrimData();
    // run this on mount and everytime scrims change.

    // eslint-disable-next-line
  }, [id, scrims, history]);

  if (!scrim) return <Loading text="Loading Scrim Data" />;

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {scrim?.title ?? `${scrim.createdBy.name}'s Scrim`} | Bootcamp LoL
          Scrim Gym
        </title>
        <meta
          name="description"
          content={`Visit ${
            scrim?.title ?? 'this scrim'
          } at Bootcamp LoL Scrim Gym!`}
        />
      </Helmet>

      <Navbar showLess />
      <PageContent>
        <div className={`scrim__container ${scrim?._id}`}>
          <ScrimSection scrimData={scrim} isInDetail />
        </div>
      </PageContent>
    </div>
  );
}
