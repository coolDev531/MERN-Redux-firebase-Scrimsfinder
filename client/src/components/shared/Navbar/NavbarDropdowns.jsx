import { useSelector, useDispatch } from 'react-redux';
import { useScrimsActions } from '../../../hooks/useScrims';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';

// components
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Hidden from '@mui/material/Hidden';

// utils
import moment from 'moment';
import 'moment-timezone';

export default function NavbarDropdowns() {
  const [{ currentUser }, { scrimsDate, scrimsRegion }] = useSelector(
    ({ auth, scrims }) => [auth, scrims]
  );

  const { fetchScrims } = useScrimsActions();

  const theme = useTheme();

  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const dispatch = useDispatch();

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const onSelectRegion = async (e) => {
    const region = e.target.value;
    dispatch({ type: 'scrims/setScrimsRegion', payload: region });
    await fetchScrims(); // not necessary, trying to ping the server.
  };

  const onSelectDate = async (e) => {
    const newDateValue = moment(e.target.value);
    dispatch({ type: 'scrims/setScrimsDate', payload: newDateValue });
    await fetchScrims();
  };

  return (
    <Grid
      item
      container
      xs={6}
      sm={6}
      md={4}
      alignItems={matchesSm ? 'flex-start' : 'center'}
      justifyContent="flex-end"
      direction={matchesSm ? 'column' : 'row'}
      id="nav__selects--container">
      {/* date regions and filters */}
      <Grid item>
        <TextField
          variant="standard"
          id="date"
          required
          label="Scrims Date"
          type="date"
          name="scrimsDate"
          InputLabelProps={{
            shrink: true,
          }}
          value={
            moment(new Date(scrimsDate)).format('yyyy-MM-DD') ||
            moment().format('yyyy-MM-DD')
          }
          onChange={onSelectDate}
        />

        <FormHelperText className="text-white">
          Filter&nbsp;
          <Hidden lgDown>scrims&nbsp;</Hidden>by date
        </FormHelperText>
      </Grid>

      <Box marginRight={4} />

      <Hidden mdUp>
        <Box marginTop={2} />
      </Hidden>

      <Grid item id="nav__region-filter--container">
        <InputLabel className="text-white">Region</InputLabel>

        <Select
          variant="standard"
          value={scrimsRegion}
          className="text-white"
          onChange={onSelectRegion}>
          {selectRegions.map((region, key) => (
            <MenuItem value={region} key={key}>
              {region}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText className="text-white">
          Filter&nbsp;
          <Hidden lgDown>scrims&nbsp;</Hidden>by region
        </FormHelperText>
      </Grid>
    </Grid>
  );
}
