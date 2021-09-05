// hooks
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/currentUser';

// components
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Grid,
  makeStyles,
  AppBar,
  Toolbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
} from '@material-ui/core';
import { Link, useHistory, useLocation } from 'react-router-dom';
// import { BOOTCAMP_LOL_SRC } from '../../utils/bootcampImg'; // need license
import 'moment-timezone';
import AdminArea from './AdminArea';
import HideOnScroll from './HideOnScroll';
import { InnerColumn } from './PageComponents';
import Tooltip from './Tooltip';

// utils
import { KEYCODES } from './../../utils/keycodes';
import moment from 'moment';
import clsx from 'clsx';

// icons
import SettingsIcon from '@material-ui/icons/Settings';
import KeyIcon from '@material-ui/icons/VpnKey';
import ExitIcon from '@material-ui/icons/ExitToApp';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CreateIcon from '@material-ui/icons/BorderColor';
import MenuIcon from '@material-ui/icons/Menu'; // burger icon
const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.offset,
  toolbarDistance: theme.mixins.toolbar,
  siteHeader: {
    top: '0',
    zIndex: '5',
    backgroundColor: 'black',
    borderBottom: '1px solid white',
  },
  toolbar: {
    paddingTop: '30px',
    paddingBottom: '20px',
  },
  drawerList: {
    width: 250,
  },
  drawerFullList: {
    width: 'auto',
  },
}));

const DRAWER_ANCHOR = 'top';

export default function Navbar({
  toggleFetch,
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
  const history = useHistory();
  const { pathname } = useLocation();
  const { currentUser, logOutUser, logInUser } = useAuth();
  const classes = useStyles();

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  // this is terrible but I'm doing it this way because it will cause an error that it can't find props of uudefined
  let hidePreviousScrims = hideProps?.hidePreviousScrims,
    hideCurrentScrims = hideProps?.hideCurrentScrims,
    hideUpcomingScrims = hideProps?.hideUpcomingScrims,
    setHidePreviousScrims = hideProps?.setHidePreviousScrims,
    setHideCurrentScrims = hideProps?.setHideCurrentScrims,
    setHideUpcomingScrims = hideProps?.setHideUpcomingScrims;

  const drawerNavPush = (path) => {
    setIsDrawerOpen(false);

    // using settimeout so the user sees the drawer close before the path gets redirected.
    setTimeout(() => {
      history.push(path);
    }, 100);
  };

  useEffect(() => {
    const handleKeyUp = ({ keycode }) => {
      // close drawer if user is pressing escape
      if (keycode === KEYCODES.ESCAPE) {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
          return;
        }
      }
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDrawerOpen]);

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
                  justifyContent="space-between"
                  spacing={0}>
                  <Grid item container alignItems="center" xs={12} sm={5}>
                    {/* need license to use img */}
                    {/* <img
                  src={BOOTCAMP_LOL_SRC}
                  alt="logo"
                  style={{ marginRight: '10px' }}
                /> */}
                    &nbsp;
                    <Link to="/" className="link">
                      <Typography component="h1" variant="h1">
                        LoL Scrims Finder
                      </Typography>
                    </Link>
                  </Grid>

                  <Grid
                    item
                    container
                    xs={12}
                    sm={7}
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
                {!showLess && (
                  <Grid
                    container
                    item
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between">
                    {pathname !== '/user-setup' && (
                      <Grid item>
                        <Typography variant="h2" component="h2">
                          Welcome: {currentUser?.name}
                        </Typography>
                      </Grid>
                    )}

                    {showDropdowns && (
                      <div
                        id="nav__selects--container"
                        className="d-flex align-center">
                        <div id="nav__date-filter--container">
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
                            onChange={(e) => {
                              setScrimsDate(moment(e.target.value));
                            }}
                          />

                          <FormHelperText className="text-white">
                            Filter scrims by date
                          </FormHelperText>
                        </div>
                        <Box marginRight={4} />

                        <div id="nav__region-filter--container">
                          <InputLabel className="text-white">Region</InputLabel>

                          <Select
                            value={scrimsRegion}
                            className="text-white"
                            onChange={(e) => {
                              const region = e.target.value;
                              toggleFetch((prev) => !prev);
                              setScrimsRegion(region); // set the navbar select value to selected region
                            }}>
                            {selectRegions.map((region, key) => (
                              <MenuItem value={region} key={key}>
                                {region}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText className="text-white">
                            Filter scrims by region
                          </FormHelperText>
                        </div>
                      </div>
                    )}
                  </Grid>
                )}
              </Grid>
            </InnerColumn>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Additional navbar (drawer). */}
      <Drawer
        anchor={DRAWER_ANCHOR}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}>
        <div
          className={clsx(classes.drawerList, {
            [classes.drawerFullList]:
              DRAWER_ANCHOR === 'top' || DRAWER_ANCHOR === 'bottom',
          })}>
          <List>
            {/* Settings button */}
            <ListItem button onClick={() => drawerNavPush('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>

            <Divider />

            {/* Create scrim button (admins only) */}
            <AdminArea>
              <ListItem button onClick={() => drawerNavPush('/scrims/new')}>
                <ListItemIcon>
                  <CreateIcon />
                </ListItemIcon>
                <ListItemText primary="Create Scrim" />
              </ListItem>
              <Divider />
            </AdminArea>

            {/* Log out button */}
            {currentUser?.uid && (
              <>
                <ListItem button onClick={logOutUser}>
                  <ListItemIcon>
                    <ExitIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </ListItem>
              </>
            )}
            {/* don't show divider if there isn't anything else to show below... */}
            {showCheckboxes && <Divider />}
          </List>

          {showCheckboxes && (
            <Grid
              item
              container
              alignItems="center"
              style={{ padding: '20px' }}>
              <FormGroup
                row
                className="text-white"
                style={{ justifyContent: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      // the UI says "show X scrims", so in this case we are reversing the boolean for checked, lol.
                      // doesn't matter functionally.
                      checked={!hideCurrentScrims}
                      color="primary"
                      onChange={() =>
                        setHideCurrentScrims((prevState) => !prevState)
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
                      checked={!hideUpcomingScrims}
                      color="primary"
                      onChange={() =>
                        setHideUpcomingScrims((prevState) => !prevState)
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
                      checked={!hidePreviousScrims}
                      onChange={() =>
                        setHidePreviousScrims((prevState) => !prevState)
                      }
                      name="hidePreviousScrims"
                    />
                  }
                  label="Show Previous Scrims"
                  labelPlacement="bottom"
                />
              </FormGroup>
            </Grid>
          )}
        </div>
      </Drawer>

      <div className={classes.offset} />
      <div className={classes.toolbarDistance} />
    </>
  );
}
