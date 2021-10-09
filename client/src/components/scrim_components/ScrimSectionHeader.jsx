import { useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom';
import useAlerts from './../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';

// components
import Moment from 'react-moment';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

// utils
import 'moment-timezone';
import { copyTextToClipboard } from './../../utils/copyToClipboard';
import AdminArea from './../shared/AdminArea';

// icons
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';

const MAX_CASTER_AMOUNT = 2;

export default function ScrimSectionHeader({
  // props passed from ScrimSection.jsx
  scrim,
  gameEnded,
  casterEntered,
  joinCast,
  leaveCast,
  handleDeleteScrim,
  buttonsDisabled,
}) {
  const { casters } = scrim;
  const { setCurrentAlert } = useAlerts();
  const classes = useScrimSectionStyles();
  const history = useHistory();
  const theme = useTheme();
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));

  const gameUrl = useMemo(
    () => `${window.location.origin}/scrims/${scrim._id}`,
    [scrim._id]
  );

  return (
    <Grid container direction="column" className={classes.scrimSectionHeader}>
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between">
        <Grid item sm={6}>
          <Link
            className="link"
            style={{ textDecorationColor: '#000' }}
            to={`/scrims/${scrim._id}`}>
            <Typography variant="h1" style={{ fontSize: '1.6rem' }}>
              {/* if scrim has a title show title, else show createdby.name's scrim */}
              {`${scrim.title ?? `${scrim.createdBy.name}'s Scrim`} (${
                scrim.region
              })`}
            </Typography>
          </Link>
        </Grid>
        <Grid
          item
          container
          sm={8}
          md={6}
          alignItems="center"
          direction="row"
          justifyContent={matchesMd ? 'flex-start' : 'flex-end'}
          spacing={2}>
          {/* Share button */}
          <Grid item>
            <Tooltip arrow placement="top" title="Copy game link to clipboard">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setCurrentAlert({
                    type: 'Success',
                    message: 'copied game link to clipboard!',
                  });
                  copyTextToClipboard(gameUrl);
                }}>
                <ShareIcon /> Share
              </Button>
            </Tooltip>
          </Grid>

          <AdminArea>
            {/* Edit and close event buttons */}
            <Grid item>
              <Tooltip
                arrow
                placement="top"
                title="Admin only: edit game details (name, password, etc...)">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => history.push(`/scrims/${scrim._id}/edit`)}>
                  <SettingsIcon />
                  &nbsp; Edit
                </Button>
              </Tooltip>
            </Grid>

            <Grid item>
              <Tooltip arrow placement="top" title="Admin only: delete scrim">
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={handleDeleteScrim}>
                  Close event
                </Button>
              </Tooltip>
            </Grid>
          </AdminArea>
        </Grid>
      </Grid>

      <Grid container>
        <Typography variant="h2">
          Game Start:&nbsp;
          <Moment format="MM/DD/yyyy | hh:mm A">{scrim.gameStartTime}</Moment>
        </Typography>

        {/*  casters text and buttons*/}
        <Grid container direction="column">
          {casters.length === 2 ? (
            <Typography variant="h2">
              Casters: {casters.map((caster) => caster?.name).join(' & ')}
            </Typography>
          ) : (
            <Grid item container direction="column" alignItems="flex-start">
              {casters.length === 0 ? (
                <Typography variant="h2">No Casters</Typography>
              ) : null}
              {casters[0] && (
                <Typography variant="h2">
                  {/* if game didn't and say current casters, else say one caster: */}
                  {!gameEnded ? 'Current Casters:' : 'Caster:'}&nbsp;
                  {casters[0].name}
                </Typography>
              )}
            </Grid>
          )}

          {/* don't show cast buttons if game ended or we have max casters or currentUser has joined cast*/}
          {!gameEnded && (
            <Grid container alignItems="center" direction="row" spacing={2}>
              {casters.length !== MAX_CASTER_AMOUNT && !casterEntered && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={
                      casters.length === MAX_CASTER_AMOUNT ||
                      casterEntered ||
                      buttonsDisabled
                    }
                    onClick={joinCast}>
                    join cast
                  </Button>
                </Grid>
              )}

              {casterEntered && (
                <Grid item>
                  <Button
                    color="secondary"
                    variant="contained"
                    disabled={buttonsDisabled}
                    onClick={leaveCast}>
                    Leave cast
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
