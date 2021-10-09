import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import { useSelector, useDispatch } from 'react-redux';

// components
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Hidden from '@mui/material/Hidden';

/* Show scrims (current, previous, upcoming) buttons */

export default function NavbarCheckboxes() {
  const dispatch = useDispatch();

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));

  const { showPreviousScrims, showCurrentScrims, showUpcomingScrims } =
    useSelector(({ scrims }) => scrims);

  const toggleShowScrims = (e) => {
    dispatch({ type: 'scrims/toggleHideScrims', payload: e.target.name });
  };

  return (
    <Grid
      item
      alignItems="center"
      container
      justifyContent="flex-start"
      direction={matchesXs ? 'column' : 'row'}
      xs={6}
      sm={4}
      md={8}>
      <FormGroup
        row={!matchesSm}
        className="text-white"
        style={{ justifyContent: !matchesMd ? 'flex-start' : 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={showPreviousScrims}
              onChange={toggleShowScrims}
              name="showPreviousScrims"
            />
          }
          label={
            <>
              <Hidden mdDown>Show</Hidden> previous scrims
            </>
          }
          labelPlacement="bottom"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={showUpcomingScrims}
              color="primary"
              onChange={toggleShowScrims}
              name="showUpcomingScrims"
            />
          }
          label={
            <>
              <Hidden mdDown>Show</Hidden> upcoming scrims
            </>
          }
          labelPlacement="bottom"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={showCurrentScrims}
              color="primary"
              onChange={toggleShowScrims}
              name="showCurrentScrims"
            />
          }
          label={
            <>
              <Hidden mdDown>Show</Hidden> current scrims
            </>
          }
          labelPlacement="bottom"
        />
      </FormGroup>
    </Grid>
  );
}
