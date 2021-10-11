// hooks
import { useMemo } from 'react';
import useOnKeyDown from './../../../hooks/useOnKeyDown';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import useAuth, { useAuthActions } from './../../../hooks/useAuth';

// components
import { InnerColumn } from '../PageComponents';
import Grid from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Hidden from '@mui/material/Hidden';
import AdminArea from '../AdminArea';
import NavbarCheckboxes from './NavbarCheckboxes';
import NavbarDropdowns from './NavbarDropdowns';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExitIcon from '@mui/icons-material/ExitToApp';
import CreateIcon from '@mui/icons-material/BorderColor';
import MyProfileIcon from '@mui/icons-material/AccountCircle';

// utils
import clsx from 'clsx';
import { KEYCODES } from '../../../utils/keycodes';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  drawerRoot: {
    background: 'rgba(18,25,35) !important',
  },

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
}) {
  const { currentUser } = useAuth();
  const { handleLogout } = useAuthActions();

  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const matchesLg = useMediaQuery(theme.breakpoints.down('lg'));

  const drawerAnchor = useMemo(
    () => (matchesLg ? 'top' : 'right'),
    [matchesLg]
  );

  const drawerNavPush = async (path) => {
    setIsDrawerOpen(false);

    // using sleep so the user sees the drawer close before the path gets redirected.
    await sleep(80);
    history.push(path);
  };

  useOnKeyDown(
    KEYCODES.ESCAPE,
    () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return;
      }
    },
    [isDrawerOpen]
  );

  return (
    <Drawer
      anchor={drawerAnchor}
      open={isDrawerOpen}
      classes={{ paper: classes.drawerRoot }}
      onClose={() => setIsDrawerOpen(false)}>
      <InnerColumn>
        <div
          className={clsx(classes.drawerList, {
            [classes.drawerFullList]:
              drawerAnchor === 'top' || drawerAnchor === 'bottom',
          })}>
          <List>
            {/* My Profile */}
            {currentUser?.uid && (
              <>
                <ListItem
                  button
                  onClick={() => drawerNavPush(`/users/${currentUser._id}`)}>
                  <ListItemIcon>
                    <MyProfileIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItem>
                <Divider />
              </>
            )}

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
                <ListItem button onClick={handleLogout}>
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
              {/* Show scrims (current, previous, upcoming) buttons */}
              {showCheckboxes && <NavbarCheckboxes />}

              {/* region, date filters */}
              {showDropdowns && <NavbarDropdowns />}
            </Grid>
          </Hidden>
        )}
      </InnerColumn>
    </Drawer>
  );
}
