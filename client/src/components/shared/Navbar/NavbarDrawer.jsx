// hooks
import { useMemo } from 'react';
import useOnKeyDown from './../../../hooks/useOnKeyDown';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';

// components
import { InnerColumn } from '../PageComponents';
import Grid from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import Hidden from '@mui/material/Hidden';
import NavbarCheckboxes from './NavbarCheckboxes';
import NavbarDropdowns from './NavbarDropdowns';
import NavbarDrawerItems from './NavbarDrawerItems';

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

export default function NavbarDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  showCheckboxes,
  showDropdowns,
  showLess,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const matchesLg = useMediaQuery(theme.breakpoints.down('lg'));

  const drawerAnchor = useMemo(
    () => (matchesLg ? 'top' : 'right'),
    [matchesLg]
  );

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
          {/* NavbarDrawerItems: links such as logout, settings, scrims, etc. */}
          <NavbarDrawerItems
            showCheckboxes={showCheckboxes}
            setIsDrawerOpen={setIsDrawerOpen}
          />
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
