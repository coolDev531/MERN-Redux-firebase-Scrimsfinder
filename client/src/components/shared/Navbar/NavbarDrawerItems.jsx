import { useDispatch } from 'react-redux';
import useAuth, { useAuthActions } from '../../../hooks/useAuth';
import { useHistory } from 'react-router-dom';

// components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExitIcon from '@mui/icons-material/ExitToApp';
import MyProfileIcon from '@mui/icons-material/AccountCircle';
import GamesIcon from '@mui/icons-material/Games';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function NavbarDrawerItems({ showCheckboxes, setIsDrawerOpen }) {
  const { currentUser } = useAuth();
  const { handleLogout } = useAuthActions();
  const dispatch = useDispatch();
  const history = useHistory();

  const drawerNavPush = async (path) => {
    setIsDrawerOpen(false);

    // using sleep so the user sees the drawer close before the path gets redirected.
    await sleep(80);
    history.push(path);
  };

  return (
    <List>
      {/* My Profile */}
      {currentUser?._id && (
        <>
          <ListItem
            button
            onClick={() =>
              drawerNavPush(
                `/users/${currentUser?.name}?region=${currentUser?.region}`
              )
            }>
            <ListItemIcon>
              <MyProfileIcon />
            </ListItemIcon>
            <ListItemText primary={`${currentUser?.name}`} />
          </ListItem>
          <Divider />
        </>
      )}

      {/* Scrims button */}
      {currentUser?._id && (
        <>
          <ListItem button onClick={() => drawerNavPush('/scrims')}>
            <ListItemIcon>
              <GamesIcon />
            </ListItemIcon>
            <ListItemText primary="Scrims" />
          </ListItem>

          <Divider />
        </>
      )}

      {currentUser?._id && (
        <>
          <ListItem
            button
            onClick={() => {
              dispatch({
                type: 'general/openOtherOptionsModal',
              });
              setIsDrawerOpen(false);
            }}>
            <ListItemIcon>
              <MoreHorizIcon />
            </ListItemIcon>
            <ListItemText primary="Other" />
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

      {/* Log out button */}
      {currentUser?._id && (
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
  );
}
