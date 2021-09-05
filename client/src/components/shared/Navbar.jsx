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
  Tooltip,
} from '@material-ui/core';
import { useContext } from 'react';
import { CurrentUserContext } from '../../context/currentUser';
import { Link, useHistory, useLocation } from 'react-router-dom';
// import { BOOTCAMP_LOL_SRC } from '../../utils/bootcampImg';
import moment from 'moment';
import 'moment-timezone';
import AdminArea from './AdminArea';
import HideOnScroll from './HideOnScroll';

// icons
import SettingsIcon from '@material-ui/icons/Settings';
import KeyIcon from '@material-ui/icons/VpnKey';
import ExitIcon from '@material-ui/icons/ExitToApp';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CreateIcon from '@material-ui/icons/Create';

// services
import { loginUser, setAuthToken } from '../../services/auth';
import { auth, provider } from '../../firebase';
import jwt_decode from 'jwt-decode';

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.offset,
  toolbarDistance: theme.mixins.toolbar,
}));

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
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const history = useHistory();
  const { pathname } = useLocation();

  const classes = useStyles();

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const handleLogOut = async () => {
    console.log('logging out...');
    auth.signOut();
    setCurrentUser(null);

    history.push('./user-setup');
  };

  const handleSignIn = async () => {
    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      let googleParams = {
        uid: result.user.uid, // google id
        email: result.user.email,
      };

      // verifying user with google, then getting rest of data.
      const { token } = await loginUser(googleParams); // data.token
      localStorage.setItem('jwtToken', token);
      setAuthToken(token);
      const decoded = jwt_decode(token);

      setCurrentUser(decoded);

      history.push('/');
    }
  };

  let hidePreviousScrims = hideProps?.hidePreviousScrims,
    hideCurrentScrims = hideProps?.hideCurrentScrims,
    hideUpcomingScrims = hideProps?.hideUpcomingScrims,
    setHidePreviousScrims = hideProps?.setHidePreviousScrims,
    setHideCurrentScrims = hideProps?.setHideCurrentScrims,
    setHideUpcomingScrims = hideProps?.setHideUpcomingScrims;

  return (
    <>
      <HideOnScroll>
        <AppBar className="page-section site-header" position="sticky">
          <Toolbar>
            <div className="inner-column">
              <div className="d-flex align-center justify-between">
                <div className="logo d-flex align-center">
                  {/* need license to use img */}
                  {/* <img
                  src={BOOTCAMP_LOL_SRC}
                  alt="logo"
                  style={{ marginRight: '10px' }}
                /> */}
                  &nbsp;
                  <Link to="/" className="link">
                    <h1>LoL Scrims Finder</h1>
                  </Link>
                </div>

                <Grid
                  item
                  container
                  alignItems="center"
                  spacing={2}
                  direction="row"
                  justifyContent="flex-end">
                  {/*  don't show Create Scrim button at /new or /edit pages */}
                  {pathname !== '/scrims/new' && !pathname.includes('/edit') && (
                    <AdminArea>
                      <Grid item>
                        <Button
                          className="mr-3"
                          variant="contained"
                          color="primary"
                          startIcon={<CreateIcon />}
                          onClick={() => history.push('/scrims/new')}>
                          Create Scrim
                        </Button>
                      </Grid>
                    </AdminArea>
                  )}

                  {/* don't show go back button at home or /scrims or /user-setup*/}
                  {pathname !== '/scrims' &&
                    pathname !== '/' &&
                    pathname !== '/user-setup' && (
                      <Grid item>
                        <Button
                          className="mr-3"
                          variant="contained"
                          color="primary"
                          startIcon={<ArrowBackIcon />}
                          onClick={() => history.goBack()}>
                          Go Back
                        </Button>
                      </Grid>
                    )}
                  {currentUser?.uid ? (
                    <>
                      {pathname !== '/settings' && (
                        <Grid item>
                          <Tooltip title="User settings">
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => history.push('/settings')}
                              startIcon={<SettingsIcon />}>
                              Settings
                            </Button>
                          </Tooltip>
                        </Grid>
                      )}
                      <Grid item>
                        <Button
                          onClick={handleLogOut}
                          variant="contained"
                          startIcon={<ExitIcon />}
                          color="secondary">
                          Log Out
                        </Button>
                      </Grid>
                    </>
                  ) : (
                    <Grid item>
                      <Button
                        onClick={handleSignIn}
                        variant="contained"
                        startIcon={<KeyIcon />}
                        color="primary">
                        Log In
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </div>
              <br />
              {!showLess && (
                <Grid
                  container
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between">
                  {pathname !== '/user-setup' && (
                    <div>
                      <h2>Welcome: {currentUser?.name}</h2>
                    </div>
                  )}
                  {showCheckboxes && (
                    <div className="d-flex align-center">
                      <FormGroup row className="text-white">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={hideCurrentScrims}
                              color="primary"
                              onChange={() =>
                                setHideCurrentScrims((prevState) => !prevState)
                              }
                              name="hideCurrentScrims"
                            />
                          }
                          label="Hide current scrims"
                          labelPlacement="bottom"
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={hideUpcomingScrims}
                              color="primary"
                              onChange={() =>
                                setHideUpcomingScrims((prevState) => !prevState)
                              }
                              name="hideUpcomingScrims"
                            />
                          }
                          label="Hide upcoming scrims"
                          labelPlacement="bottom"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              checked={hidePreviousScrims}
                              onChange={() =>
                                setHidePreviousScrims((prevState) => !prevState)
                              }
                              name="hidePreviousScrims"
                            />
                          }
                          label="Hide Previous Scrims"
                          labelPlacement="bottom"
                        />
                      </FormGroup>
                    </div>
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
                            moment(new Date(scrimsDate)).format('yyyy-MM-DD') ||
                            moment().format('yyyy-MM-DD')
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
            </div>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <div className={classes.offset} />
      <div className={classes.toolbarDistance} />
    </>
  );
}
