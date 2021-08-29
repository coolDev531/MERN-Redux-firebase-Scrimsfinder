import { Grid, Typography } from '@material-ui/core';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ScrimDetail() {
  const { id } = useParams();
  const [scrim, setScrim] = useState(null);

  return (
    <Grid>
      <Typography>Scrim detail {id.toString()}</Typography>
    </Grid>
  );
}
