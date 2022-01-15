import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Navbar from '../../components/shared/Navbar/Navbar';
import { getAllBans } from './../../services/admin.services';
import BansTable from '../../components/BanHistory_components/BansTable';

export default function BanHistory() {
  const [allBans, setAllBans] = useState([]);

  useEffect(() => {
    const fetchBans = async () => {
      const bans = await getAllBans();
      setAllBans(bans);
      console.log(bans);
    };
    fetchBans();
  }, []);

  return (
    <>
      <Navbar showLess />
      <Grid container direction="column">
        <BansTable bans={allBans} />
      </Grid>
    </>
  );
}
