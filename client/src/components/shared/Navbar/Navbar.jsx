// hooks
import { useState, useCallback } from 'react';
import useAuth, { useAuthActions } from './../../../hooks/useAuth';
import { makeStyles, useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useUsers from './../../../hooks/useUsers';
import { useDispatch } from 'react-redux';

// Mui components
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Hidden from '@mui/material/Hidden';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// components
import { Link } from 'react-router-dom';
import NavbarDrawer from './NavbarDrawer';
import HideOnScroll from '../HideOnScroll';
import { InnerColumn } from '../PageComponents';
import Tooltip from '../Tooltip';
import NavbarCheckboxes from './NavbarCheckboxes';
import NavbarDropdowns from './NavbarDropdowns';
import UserSearchBar from './UserSearchBar';
import NotificationsButton from './NotificationsButton';
import MessengerButton from '../../Messenger_components/MessengerButton';

// icons
import Logo from '../../../assets/images/bootcamp_llc_media_kit/coin_logo_new2021.png';
import KeyIcon from '@mui/icons-material/VpnKey';
import MenuIcon from '@mui/icons-material/Menu'; // burger icon
import SchoolIcon from '@mui/icons-material/School';

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.offset,
  toolbarDistance: theme.mixins.toolbar,

  toolbar: {
    paddingTop: '30px',
    paddingBottom: '20px',
  },
}));

export default function Navbar({
  showDropdowns,
  showLess,
  showCheckboxes,
  noLogin = false,
  noSpacer = false,
  noGuide = false,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessengerDropdownOpen, setIsMessengerDropdownOpen] = useState(false);

  const classes = useStyles();

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { usersLoaded, usersSearchValue } = useUsers();
  const { currentUser } = useAuth();
  const { handleLogin } = useAuthActions();
  const dispatch = useDispatch();

  const openMessengerDropdown = useCallback(() => {
    setIsMessengerDropdownOpen((prevState) => !prevState);
  }, []);

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
                    <Grid
                      item
                      container
                      alignItems="center"
                      flexWrap="nowrap"
                      spacing={1}>
                      <Grid item>
                        <Link
                          to="/"
                          className="link-2"
                          style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={Logo}
                            style={{
                              width: '100%',
                              maxWidth: '80px',
                              minWidth: '40px',
                            }}
                            alt="Logo"
                          />
                        </Link>
                      </Grid>

                      <Grid
                        item
                        container
                        alignItems="center"
                        flexWrap="nowrap">
                        <Hidden mdDown>
                          <Typography
                            component="h1"
                            variant={matchesSm ? 'h3' : 'h1'}
                            style={{
                              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                              transition: 'all 200ms ease-in-out',
                              opacity: isSearchOpen ? '0' : '1',
                              width: isSearchOpen ? '0' : 'auto',
                              whiteSpace: 'nowrap',
                            }}
                            className="text-white">
                            Bootcamp LoL Scrim Gym
                          </Typography>
                        </Hidden>

                        <ClickAwayListener
                          onClickAway={() => {
                            if (isSearchOpen) {
                              setIsSearchOpen(false);
                            }

                            if (usersSearchValue) {
                              dispatch({
                                type: 'users/setSearch',
                                payload: '',
                              });
                            }
                          }}>
                          <Box
                            onClick={() => setIsSearchOpen(true)}
                            marginLeft={2}
                            style={{ transition: 'all 250ms ease-in-out' }}
                            sx={{
                              minWidth: 140,
                              maxWidth: 300,
                            }}>
                            {usersLoaded && currentUser?.uid && (
                              <UserSearchBar
                                setIsSearchOpen={setIsSearchOpen}
                                isSearchOpen={isSearchOpen}
                              />
                            )}
                          </Box>
                        </ClickAwayListener>
                      </Grid>
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
                    {!currentUser?.uid && !noGuide && (
                      <Grid item>
                        <Tooltip title="Scrim Gym Simplified">
                          <Button
                            component={Link}
                            to="/guide"
                            variant="contained"
                            startIcon={<SchoolIcon />}
                            color="primary">
                            Guide
                          </Button>
                        </Tooltip>
                      </Grid>
                    )}

                    {/* if no user, show log in button */}
                    {!currentUser?.uid && !noLogin && (
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

                    {currentUser?.uid && (
                      <Grid item style={{ marginTop: '6px' }}>
                        {/* the MessangerButton component contains the button and the dropdown menu */}
                        <MessengerButton
                          isMessengerDropdownOpen={isMessengerDropdownOpen}
                          setIsMessengerDropdownOpen={
                            setIsMessengerDropdownOpen
                          }
                          isScrim={false}
                          onClick={openMessengerDropdown}
                        />
                      </Grid>
                    )}

                    {currentUser?.uid && <NotificationsButton />}

                    {/* BURGER ICON */}
                    {currentUser?.uid && (
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
                    )}
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
      {!noSpacer && <div className={classes.toolbarDistance} />}
    </>
  );
}
