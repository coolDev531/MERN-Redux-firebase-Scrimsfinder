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
} from '@material-ui/core';
import { useContext } from 'react';
import { CurrentUserContext } from '../../context/currentUser';
import { useHistory, useLocation } from 'react-router-dom';
import { BOOTCAMP_LOL_SRC } from '../../utils/bootcampImg';
import moment from 'moment';
import 'moment-timezone';

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
}) {
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const history = useHistory();
  const { pathname } = useLocation();

  const classes = useStyles();

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];
  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const handleLogOut = () => {
    let yes = window.confirm(
      "Are you sure you want to log out? \n you'll have to set-up all over again"
    );
    if (!yes) return;

    history.push('./user-setup');
    setCurrentUser(null);
  };

  return (
    <>
      <AppBar className="page-section site-header" position="sticky">
        <Toolbar>
          <div className="inner-column">
            <div className="d-flex align-center justify-between">
              <div className="logo d-flex align-center">
                <img
                  src={BOOTCAMP_LOL_SRC}
                  alt="logo"
                  style={{ marginRight: '10px' }}
                />
                &nbsp;
                <h1>Scrims finder</h1>
              </div>

              <div className="d-flex mr-3">
                {pathname !== '/scrims/new' ? (
                  <>
                    <Button
                      className="mr-3"
                      variant="contained"
                      color="primary"
                      onClick={() => history.push('/scrims/new')}>
                      Create Scrim
                    </Button>
                  </>
                ) : (
                  <Button
                    className="mr-3"
                    variant="contained"
                    color="primary"
                    onClick={() => history.goBack()}>
                    Go Back
                  </Button>
                )}
                <Box marginRight={2} />
                &nbsp;
                <Button
                  onClick={handleLogOut}
                  variant="contained"
                  color="secondary">
                  Log Out
                </Button>
              </div>
            </div>
            <br />
            <Grid container direction="row" justify="space-between">
              <div>
                <h2>Welcome: {currentUser?.name}</h2>
              </div>

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
                      value={moment(scrimsDate).format('yyyy-MM-DD')}
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
          </div>
        </Toolbar>
      </AppBar>
      <div className={classes.offset} />
      <div className={classes.toolbarDistance} />
    </>
  );
}
