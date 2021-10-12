import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import { useSelector, useDispatch } from 'react-redux';

// components
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '../Tooltip';
import RefreshScrimsButton from '../../scrim_components/RefreshScrimsButton';

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
        style={{
          justifyContent: !matchesMd ? 'flex-start' : 'center',
          alignItems: 'flex-end',
        }}>
        <RefreshScrimsButton />

        <Tooltip
          title={
            showPreviousScrims ? 'Hide previous scrims' : 'Show previous scrims'
          }>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={showPreviousScrims}
                onChange={toggleShowScrims}
                name="showPreviousScrims"
              />
            }
            label="Previous scrims"
            labelPlacement="bottom"
          />
        </Tooltip>

        <Tooltip
          title={
            showUpcomingScrims ? 'Hide upcoming scrims' : 'Show upcoming scrims'
          }>
          <FormControlLabel
            control={
              <Checkbox
                checked={showUpcomingScrims}
                color="primary"
                onChange={toggleShowScrims}
                name="showUpcomingScrims"
              />
            }
            label="Upcoming scrims"
            labelPlacement="bottom"
          />
        </Tooltip>

        <Tooltip
          title={
            showCurrentScrims ? 'Hide current scrims' : 'Show current scrims'
          }>
          <FormControlLabel
            control={
              <Checkbox
                checked={showCurrentScrims}
                color="primary"
                onChange={toggleShowScrims}
                name="showCurrentScrims"
              />
            }
            label="Current scrims"
            labelPlacement="bottom"
          />
        </Tooltip>
      </FormGroup>
    </Grid>
  );
}
