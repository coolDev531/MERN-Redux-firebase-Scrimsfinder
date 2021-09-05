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
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Link, useHistory, useLocation } from 'react-router-dom';
// import { BOOTCAMP_LOL_SRC } from '../../utils/bootcampImg'; // need license
import 'moment-timezone';
import AdminArea from './AdminArea';
import HideOnScroll from './HideOnScroll';
import { InnerColumn } from './PageComponents';

// utils
import moment from 'moment';
import { useAuth } from '../../context/currentUser';

// icons
import SettingsIcon from '@material-ui/icons/Settings';
import KeyIcon from '@material-ui/icons/VpnKey';
import ExitIcon from '@material-ui/icons/ExitToApp';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CreateIcon from '@material-ui/icons/Create';

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
  const history = useHistory();
  const { pathname } = useLocation();
  const { currentUser, logOutUser, logInUser } = useAuth();
  const classes = useStyles();

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  let hidePreviousScrims = hideProps?.hidePreviousScrims,
    hideCurrentScrims = hideProps?.hideCurrentScrims,
    hideUpcomingScrims = hideProps?.hideUpcomingScrims,
    setHidePreviousScrims = hideProps?.setHidePreviousScrims,
    setHideCurrentScrims = hideProps?.setHideCurrentScrims,
    setHideUpcomingScrims = hideProps?.setHideUpcomingScrims;

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

                  {/* SETTINGS, LOGOUT BUTTONS */}
                  <Grid
                    item
                    container
                    xs={12}
                    sm={7}
                    alignItems="center"
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end">
                    {/* don't show Create Scrim button at /new or /edit pages */}
                    {!pathname.includes('/scrims/new') &&
                      !pathname.includes('/edit') && (
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
                    {/* TODO: this can be done more elegantly, lol. */}
                    {!pathname.match(/^\/scrims$/) &&
                      !pathname.match(/^\/scrims\/$/) &&
                      pathname !== '/' &&
                      !pathname.match(/^\/user-setup/) && (
                        <Grid item>
                          <Box onClick={() => history.goBack()}>
                            <Button
                              className="mr-3"
                              variant="contained"
                              color="primary"
                              startIcon={<ArrowBackIcon />}>
                              Go Back
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    {currentUser?.uid ? (
                      <>
                        {pathname !== '/settings' && (
                          <Grid item>
                            <Tooltip title="User settings">
                              <Box onClick={() => history.push('/settings')}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<SettingsIcon />}>
                                  Settings
                                </Button>
                              </Box>
                            </Tooltip>
                          </Grid>
                        )}
                        <Grid item>
                          <Button
                            onClick={logOutUser}
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
                          onClick={logInUser}
                          variant="contained"
                          startIcon={<KeyIcon />}
                          color="primary">
                          Log In
                        </Button>
                      </Grid>
                    )}
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
                    {showCheckboxes && (
                      <div className="d-flex align-center">
                        <FormGroup row className="text-white">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hideCurrentScrims}
                                color="primary"
                                onChange={() =>
                                  setHideCurrentScrims(
                                    (prevState) => !prevState
                                  )
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
                                  setHideUpcomingScrims(
                                    (prevState) => !prevState
                                  )
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
                                  setHidePreviousScrims(
                                    (prevState) => !prevState
                                  )
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

      <div className={classes.offset} />
      <div className={classes.toolbarDistance} />
    </>
  );
}
