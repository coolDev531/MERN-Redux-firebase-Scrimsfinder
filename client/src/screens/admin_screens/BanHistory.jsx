import { useState, useEffect } from 'react';

import Navbar from '../../components/shared/Navbar/Navbar';
import { getAllBans } from './../../services/admin.services';
import BansTable from '../../components/BanHistory_components/BansTable';
import withAdminRoute from './../../utils/withAdminRoute';
import Loading from '../../components/shared/Loading';

function BanHistory() {
  const [allBans, setAllBans] = useState([]);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBans = async () => {
      try {
        const bans = await getAllBans();
        setAllBans(bans);
        setLoaded(true);
      } catch (error) {
        console.error(error);
        setLoaded(true);
      }
    };
    fetchBans();
  }, []);

  if (!isLoaded) {
    return <Loading text="Loading Data" />;
  }

  return (
    <>
      <Navbar showLess />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '98%',
          maxWidth: '1100px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
        <BansTable bans={allBans} isLoaded={isLoaded} />
      </div>
    </>
  );
}

export default withAdminRoute(BanHistory);
