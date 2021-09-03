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
import { loginUser } from '../../services/auth';
import { auth, provider } from '../../firebase';

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
      const verifiedUser = await loginUser(googleParams);

      if (verifiedUser) {
        setCurrentUser(verifiedUser);
        history.push('/');
      }
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

                <div className="d-flex mr-3">
                  {/*  don't show Create Scrim button at /new or /edit pages */}
                  {pathname !== '/scrims/new' && !pathname.includes('/edit') && (
                    <AdminArea>
                      <Button
                        className="mr-3"
                        variant="contained"
                        color="primary"
                        startIcon={<CreateIcon />}
                        onClick={() => history.push('/scrims/new')}>
                        Create Scrim
                      </Button>
                    </AdminArea>
                  )}

                  <Box marginRight={2} />

                  {/* don't show go back button at home or /scrims or /user-setup*/}
                  {pathname !== '/scrims' &&
                    pathname !== '/' &&
                    pathname !== '/user-setup' && (
                      <Button
                        className="mr-3"
                        variant="contained"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => history.goBack()}>
                        Go Back
                      </Button>
                    )}
                  {currentUser?.uid ? (
                    <>
                      {pathname !== '/settings' && (
                        <>
                          <Tooltip title="User settings">
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => history.push('/settings')}
                              startIcon={<SettingsIcon />}>
                              Settings
                            </Button>
                          </Tooltip>
                        </>
                      )}
                      <>
                        <Box marginRight={2} />

                        <Button
                          onClick={handleLogOut}
                          variant="contained"
                          startIcon={<ExitIcon />}
                          color="secondary">
                          Log Out
                        </Button>
                      </>
                    </>
                  ) : (
                    <Button
                      onClick={handleSignIn}
                      variant="contained"
                      startIcon={<KeyIcon />}
                      color="primary">
                      Log In
                    </Button>
                  )}
                </div>
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
                            moment(new Date(scrimsDate).toISOString()).format(
                              'yyyy-MM-DD'
                            ) || moment().format('yyyy-MM-DD')
                          }
                          onChange={(e) => {
                            setScrimsDate(
                              new Date(e.target.value.replace('-', '/'))
                            );
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
