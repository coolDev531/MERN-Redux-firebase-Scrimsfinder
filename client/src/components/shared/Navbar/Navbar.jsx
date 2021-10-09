// hooks
import { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { makeStyles, useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useAuth, { useAuthActions } from './../../../hooks/useAuth';

// Mui components
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Hidden from '@mui/material/Hidden';

// components
import { Link } from 'react-router-dom';
import NavbarDrawer from './NavbarDrawer';
import HideOnScroll from '../HideOnScroll';
import { InnerColumn } from '../PageComponents';
import Tooltip from '../Tooltip';
import NavbarCheckboxes from './NavbarCheckboxes';
import NavbarDropdowns from './NavbarDropdowns';

// icons
import Logo from '../../../assets/images/bootcamp_llc_media_kit/coin_logo_new2021.png';
import KeyIcon from '@mui/icons-material/VpnKey';
import MenuIcon from '@mui/icons-material/Menu'; // burger icon
import GoBackIcon from '@mui/icons-material/ArrowBack';

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.offset,
  toolbarDistance: theme.mixins.toolbar,

  toolbar: {
    paddingTop: '30px',
    paddingBottom: '20px',
  },
}));

export default function Navbar({ showDropdowns, showLess, showCheckboxes }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const classes = useStyles();
  const { pathname } = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { currentUser } = useAuth();
  const { handleLogin } = useAuthActions();

  const noBackButtonPaths = [/^\/signup/, /^\/scrims$/, /^\/scrims\/$/, /^\/$/];

  const renderBackButton = () => {
    for (let url of noBackButtonPaths) {
      if (url.test(pathname)) {
        return false;
      }
    }
    return true;
  };

  return (
    <>
      <HideOnScroll>
        <AppBar position="sticky">
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
                          onClick={handleLogin}
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
                      {showCheckboxes && <NavbarCheckboxes xs={7} />}

                      {/* date filter and region filter */}
                      {showDropdowns && <NavbarDropdowns />}
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
      />

      <div className={classes.offset} />
      <div className={classes.toolbarDistance} />
    </>
  );
}
