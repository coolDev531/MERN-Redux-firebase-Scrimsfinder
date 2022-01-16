import { useState, useEffect } from 'react';

import Navbar from '../../components/shared/Navbar/Navbar';
import { getAllBans } from './../../services/admin.services';
import BansTable from '../../components/BanHistory_components/BansTable';
import withAdminRoute from './../../utils/withAdminRoute';
<<<<<<< HEAD
import Loading from '../../components/shared/Loading';
=======
>>>>>>> d344858ef4c6b512bfd4de035c637280bec42ffc

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

<<<<<<< HEAD
  if (!isLoaded) {
    return <Loading text="Loading Data..." />;
  }

=======
>>>>>>> d344858ef4c6b512bfd4de035c637280bec42ffc
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
