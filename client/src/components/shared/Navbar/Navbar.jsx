// hooks
import { useState } from 'react';
import { useAuth } from '../../../context/currentUser';
import { useScrims } from '../../../context/scrimsContext';
import { useLocation, useHistory } from 'react-router-dom';
import Logo from '../../../assets/images/bootcamp_llc_media_kit/coin_logo_new2021.png';
import { makeStyles, useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mui components
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Hidden from '@mui/material/Hidden';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';

// components
import { Link } from 'react-router-dom';
import NavbarDrawer from './NavbarDrawer';
import moment from 'moment';
import 'moment-timezone';
import HideOnScroll from '../HideOnScroll';
import { InnerColumn } from '../PageComponents';
import Tooltip from '../Tooltip';

// icons
import KeyIcon from '@mui/icons-material/VpnKey';
import MenuIcon from '@mui/icons-material/Menu'; // burger icon
import GoBackIcon from '@mui/icons-material/ArrowBack';

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.offset,
  toolbarDistance: theme.mixins.toolbar,
  siteHeader: {
    top: '0',
    zIndex: '5',
    borderBottom: '1px solid white',
    background: '#101820 !important', // fallback
    backgroundColor: 'rgba(18,25,35,.85) !important',
    backdropFilter: 'blur(8px)',
  },
  toolbar: {
    paddingTop: '30px',
    paddingBottom: '20px',
  },
}));

export default function Navbar({
  setScrimsRegion,
  scrimsRegion,
  scrimsDate,
  setScrimsDate,
  showDropdowns,
  showLess,
  showCheckboxes,
  hideProps,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentUser, logInUser } = useAuth();
  const classes = useStyles();
  const { pathname } = useLocation();
  const history = useHistory();
  const { fetchScrims } = useScrims();
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const noBackButtonPaths = [/^\/signup/, /^\/scrims$/, /^\/scrims\/$/, /^\/$/];

  const renderBackButton = () => {
    for (let url of noBackButtonPaths) {
      if (url.test(pathname)) {
        return false;
      }
    }
    return true;
  };

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const onSelectRegion = (e) => {
    const region = e.target.value;
    fetchScrims(); // not necessary, trying to ping the server.
    setScrimsRegion(region); // set the navbar select value to selected region
  };

  const onSelectDate = (e) => {
    setScrimsDate(moment(e.target.value));
  };

  return (
    <>
      <HideOnScroll>
        <AppBar className={classes.siteHeader} position="sticky">
          <Toolbar className={classes.toolbar}>
            <InnerColumn>
              <Grid
                container
                direction="column"
                spacing={4}
                alignItems="center">
                <Grid
                  item
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between">
                  <Grid
                    item
                    container
                    direction="row"
                    alignItems="center"
                    xs={6}
                    sm={6}>
                    <Grid item container alignItems="center">
                      <Link
                        to="/"
                        className="link-2"
                        style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={Logo} width="80px" alt="Logo" />
                        <Box marginLeft={2}>
                          <Typography
                            component="h1"
                            variant={matchesSm ? 'h3' : 'h1'}
                            className="text-white">
                            Bootcamp LoL Scrim Gym
                          </Typography>
                        </Box>
                      </Link>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    container
                    xs={6}
                    alignItems="center"
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end">
                    {/* if no user, show log in button */}
                    {!currentUser?.uid && (
                      <Grid item>
                        <Button
                          onClick={logInUser}
                          variant="contained"
                          startIcon={<KeyIcon />}
                          color="primary">
                          Log In
                        </Button>
                      </Grid>
                    )}
                    {/* don't show go back button at home or /scirms
                     ? means an optional extra slash after /scrims.
                     | means or.
                    */}
                    {renderBackButton() ? (
                      <Grid item>
                        <Button
                          startIcon={<GoBackIcon />}
                          className="mr-3"
                          variant="contained"
                          color="primary"
                          onClick={() => history.goBack()}>
                          Go Back
                        </Button>
                      </Grid>
                    ) : null}

                    {/* BURGER ICON */}
                    <Grid item>
                      <Tooltip title="More options" placement="top">
                        <IconButton
                          // prevent active class from staying on button after clicking (was noticeable when pressing escape)
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setIsDrawerOpen(true)}>
                          <MenuIcon fontSize="large" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
                <br />

                {/* checkboxes for hide/show scrims, repeating in drawer, need separate component */}
                {!showLess && (
                  <Hidden lgDown>
                    <Grid
                      container
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      item
                      xs={12}>
                      {showCheckboxes && (
                        <>
                          {/* Show scrims (current, previous, upcoming) buttons */}
                          <Grid item xs={7} alignItems="center" container>
                            <FormGroup
                              row
                              className="text-white"
                              style={{ justifyContent: 'center' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    // the UI says "show X scrims", so in this case we are reversing the boolean for checked, lol.
                                    // doesn't matter functionally.
                                    checked={!hideProps?.hideCurrentScrims}
                                    color="primary"
                                    onChange={() =>
                                      hideProps?.setHideCurrentScrims(
                                        (prevState) => !prevState
                                      )
                                    }
                                    name="hideCurrentScrims"
                                  />
                                }
                                label="Show current scrims"
                                labelPlacement="bottom"
                              />

                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={!hideProps?.hideUpcomingScrims}
                                    color="primary"
                                    onChange={() =>
                                      hideProps?.setHideUpcomingScrims(
                                        (prevState) => !prevState
                                      )
                                    }
                                    name="hideUpcomingScrims"
                                  />
                                }
                                label="Show upcoming scrims"
                                labelPlacement="bottom"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    color="primary"
                                    checked={!hideProps?.hidePreviousScrims}
                                    onChange={() =>
                                      hideProps?.setHidePreviousScrims(
                                        (prevState) => !prevState
                                      )
                                    }
                                    name="hidePreviousScrims"
                                  />
                                }
                                label="Show previous scrims"
                                labelPlacement="bottom"
                              />
                            </FormGroup>
                          </Grid>
                        </>
                      )}

                      {/* date filter and region filter */}
                      {showDropdowns && (
                        <Grid
                          item
                          container
                          md={12}
                          lg={4}
                          justifyContent="flex-end"
                          alignItems="center"
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
                                moment(new Date(scrimsDate)).format(
                                  'yyyy-MM-DD'
                                ) || moment().format('yyyy-MM-DD')
                              }
                              onChange={onSelectDate}
                            />

                            <FormHelperText className="text-white">
                              Filter scrims by date
                            </FormHelperText>
                          </Grid>

                          <Box marginRight={4} />

                          <Grid item id="nav__region-filter--container">
                            <InputLabel className="text-white">
                              Region
                            </InputLabel>

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
                              Filter scrims by region
                            </FormHelperText>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Hidden>
                )}
              </Grid>
            </InnerColumn>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <NavbarDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        showCheckboxes={showCheckboxes}
        showDropdowns={showDropdowns}
        showLess={showLess}
        hideProps={hideProps}
        scrimsRegion={scrimsRegion}
        setScrimsRegion={setScrimsRegion}
        scrimsDate={scrimsDate}
        setScrimsDate={setScrimsDate}
      />

      <div className={classes.offset} />
      <div className={classes.toolbarDistance} />
    </>
  );
}
