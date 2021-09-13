// hooks
import { useState } from 'react';
import { useAuth } from '../../../context/currentUser';
import { useScrims } from '../../../context/scrimsContext';
import { useLocation, useHistory } from 'react-router-dom';
import Logo from '../../../assets/images/bootcamp_llc_media_kit/coin_logo_new2021.png';
import { useTheme } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';

// components
import {
  Button,
  Grid,
  makeStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Box,
  Select,
  Hidden,
  FormControlLabel,
  FormGroup,
  Checkbox,
  InputLabel,
  TextField,
  FormHelperText,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import NavbarDrawer from './NavbarDrawer';
import moment from 'moment';
import 'moment-timezone';
import HideOnScroll from '../HideOnScroll';
import { InnerColumn } from '../PageComponents';
import Tooltip from '../Tooltip';

// icons
import KeyIcon from '@material-ui/icons/VpnKey';
import MenuIcon from '@material-ui/icons/Menu'; // burger icon

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.offset,
  toolbarDistance: theme.mixins.toolbar,
  siteHeader: {
    top: '0',
    zIndex: '5',
    backgroundColor: 'rgba(18,25,35,.80)',
    borderBottom: '1px solid white',
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

  const noBackButtonPaths = [
    /^\/user-setup/,
    /^\/scrims$/,
    /^\/scrims\/$/,
    /^\/$/,
  ];

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
                    <Grid item container aligmItems="center">
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
                      <Button
                        className="mr-3"
                        variant="contained"
                        color="primary"
                        onClick={() => history.goBack()}>
                        Go Back
                      </Button>
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
                  <Hidden mdDown>
                    <Grid
                      container
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      item
                      xs={12}>
                      {showCheckboxes && (
                        <Hidden mdDown>
                          {/* Show scrims (current, previous, upcoming) buttons */}
                          <Grid item xs={6} alignItems="center" container>
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
                        </Hidden>
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
