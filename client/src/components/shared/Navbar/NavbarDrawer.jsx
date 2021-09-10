// hooks
import { useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/currentUser';
import { useHistory } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@material-ui/core';
// components
import { InnerColumn } from '../PageComponents';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import {
  Box,
  FormHelperText,
  TextField,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
  Hidden,
  makeStyles,
} from '@material-ui/core';
import AdminArea from '../AdminArea';

// icons
import SettingsIcon from '@material-ui/icons/Settings';
import ExitIcon from '@material-ui/icons/ExitToApp';
import CreateIcon from '@material-ui/icons/BorderColor';
// utils
import moment from 'moment';
import clsx from 'clsx';
import { KEYCODES } from '../../../utils/keycodes';
import { useScrims } from '../../../context/scrimsContext';

const useStyles = makeStyles({
  drawerList: {
    width: 250,
  },
  drawerFullList: {
    width: 'auto',
  },
});

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function NavbarDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  showCheckboxes,
  showDropdowns,
  showLess,
  hideProps,
  scrimsRegion, // the region the scrims are going to be filtered by
  setScrimsRegion,
  scrimsDate, // the date the scrims are going to be filtered by
  setScrimsDate,
}) {
  const { currentUser, logOutUser } = useAuth();
  const { fetchScrims } = useScrims();

  const classes = useStyles();
  const history = useHistory();

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));

  const drawerAnchor = useMemo(
    () => (matchesMd ? 'top' : 'right'),
    [matchesMd]
  );

  // this is terrible but I'm doing it this way because it will cause an error that it can't find props of undefined
  let hidePreviousScrims = hideProps?.hidePreviousScrims,
    hideCurrentScrims = hideProps?.hideCurrentScrims,
    hideUpcomingScrims = hideProps?.hideUpcomingScrims,
    setHidePreviousScrims = hideProps?.setHidePreviousScrims,
    setHideCurrentScrims = hideProps?.setHideCurrentScrims,
    setHideUpcomingScrims = hideProps?.setHideUpcomingScrims;

  const drawerNavPush = async (path) => {
    setIsDrawerOpen(false);

    // using sleep so the user sees the drawer close before the path gets redirected.
    await sleep(80);
    history.push(path);
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

    // it's asking to add a dep for the setter, disabling it with comment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen]);

  return (
    <Drawer
      anchor={drawerAnchor}
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}>
      <InnerColumn>
        <div
          className={clsx(classes.drawerList, {
            [classes.drawerFullList]:
              drawerAnchor === 'top' || drawerAnchor === 'bottom',
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
        </div>

        {!showLess && (
          // don't show checkboxes and filters at lg screens because they already are on navbar
          <Hidden lgUp>
            <Grid
              container
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              style={{ padding: '15px 10px 10px 10px' }}>
              {showDropdowns && (
                <Grid
                  item
                  container
                  xs={6}
                  md={4}
                  alignItems={matchesSm ? 'flex-start' : 'center'}
                  justifyContent="flex-start"
                  direction={matchesSm ? 'column' : 'row'}
                  id="nav__selects--container">
                  {/* date and regions filters */}
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
                        moment(new Date(scrimsDate)).format('yyyy-MM-DD') ||
                        moment().format('yyyy-MM-DD')
                      }
                      onChange={onSelectDate}
                    />

                    <FormHelperText className="text-white">
                      Filter scrims by date
                    </FormHelperText>
                  </Grid>

                  <Hidden xsDown>
                    <Box marginRight={4} />
                  </Hidden>

                  <Grid item id="nav__region-filter--container">
                    <InputLabel className="text-white">Region</InputLabel>

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

              {/* Show scrims (current, previous, upcoming) buttons */}
              {showCheckboxes && (
                <Grid
                  item
                  alignItems="center"
                  container
                  justifyContent="flex-end"
                  direction={matchesXs ? 'column' : 'row'}
                  spacing={2}
                  xs={6}
                  md={8}>
                  <FormGroup
                    row
                    className="text-white"
                    style={{
                      justifyContent: 'flex-end',
                    }}>
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
                      label="Show previous scrims"
                      labelPlacement="bottom"
                    />
                  </FormGroup>
                </Grid>
              )}
            </Grid>
          </Hidden>
        )}
      </InnerColumn>
    </Drawer>
  );
}
