import { useMemo, Fragment, memo, useState, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import useAlerts from './../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import { useDispatch } from 'react-redux';

// components
import Moment from 'react-moment';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import AdminArea from './../shared/AdminArea';
import MessengerButton from './../Messenger_components/MessengerButton';

// utils
import 'moment-timezone';
import { copyTextToClipboard } from './../../utils/copyToClipboard';
import { truncate } from './../../utils/truncate';
import { getTeamBackgroundColor } from '../../utils/scrimMisc';

// icons
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROLE_IMAGES } from './../../utils/imageMaps';

// services
import { findScrimConversation } from '../../services/conversations.services';

export default function ScrimSectionHeader({
  // props passed from ScrimSection.jsx
  scrim,
  gameEnded,
  casterEntered,
  joinCast,
  leaveCast,
  handleDeleteScrim,
  buttonsDisabled,
  isBoxExpanded,
  isInDetail,
}) {
  const { casters } = scrim;
  const { setCurrentAlert } = useAlerts();
  const classes = useScrimSectionStyles({ isBoxExpanded });
  const history = useHistory();
  const theme = useTheme();
  const dispatch = useDispatch();
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const showPlayers = useMediaQuery('(min-width:1000px)');

  const [isHover, setIsHover] = useState(false);

  const gameUrl = useMemo(
    () => `${window.location.origin}/scrims/${scrim._id}`,
    [scrim._id]
  );

  const handleOpenConversation = useCallback(async () => {
    try {
      const conversation = await findScrimConversation(scrim._id);

      dispatch({
        type: 'general/scrimChatRoomOpen',
        payload: {
          conversation,
          isOpen: true,
          scrimId: scrim._id,
          extraTitle: `${scrim.title} (${scrim.region})`,
        },
      });
      return;
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error opening chat for scrim',
      });
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrim._conversation]);

  return (
    <Grid
      id="parent"
      container
      direction="column"
      flexWrap="nowrap"
      className={classes.scrimSectionHeader}>
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between">
        <Grid item sm={6}>
          <Tooltip
            arrow
            placement="top"
            title="Redirect to scrim page"
            open={!isInDetail && isHover}>
            <Link
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              className="link"
              style={{
                textDecorationColor: '#000',
                display: 'flex',
                alignItems: 'center',
                width: 'fit-content',
              }}
              to={`/scrims/${scrim._id}`}>
              <Typography variant="h1" style={{ fontSize: '1.6rem' }}>
                {/* if scrim has a title show title, else show createdby.name's scrim */}
                {`${scrim.title ?? `${scrim.createdBy.name}'s Scrim`} (${
                  scrim.region
                })`}
              </Typography>

              {scrim.isPrivate && (
                <Typography
                  variant="h3"
                  style={{ fontSize: '1.6rem', color: '#999' }}>
                  &nbsp;private
                </Typography>
              )}
            </Link>
          </Tooltip>
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
          {/* messenger button */}
          {scrim._conversation && (
            <Grid item>
              <MessengerButton
                withDropdown={false}
                onClick={handleOpenConversation}
                tooltipTitle="Open scrim chat room"
                tooltipType="secondary"
              />
            </Grid>
          )}

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

      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={6}>
          <Typography variant="h2">
            Game Start:&nbsp;
            <Moment format="MM/DD/yyyy | hh:mm A">{scrim.gameStartTime}</Moment>
          </Typography>
        </Grid>

        {!isBoxExpanded && showPlayers && (
          <Grid item xs={4}>
            <Typography
              style={{ marginRight: '10px' }}
              variant="h2"
              textAlign="center">
              {[...scrim.teamOne, ...scrim.teamTwo].length
                ? 'Players:'
                : 'No players'}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Grid
        container
        direction="row"
        justifyContent={scrim.isWithCasters ? 'space-between' : 'flex-end'}>
        {/*  casters text and buttons*/}
        {scrim.isWithCasters && (
          <CastersSection
            showCasters={isInDetail ? true : showPlayers || isBoxExpanded}
            casters={casters}
            gameEnded={gameEnded}
            data={{
              maxCastersAllowedCount: scrim.maxCastersAllowedCount ?? 2, // didn't exist in old versions of db
              casterEntered,
              casters,
              buttonsDisabled,
              joinCast,
              leaveCast,
              isBoxExpanded,
            }}
          />
        )}

        {/* dont show players in header if isBoxExpanded or smaller screen */}
        {!isBoxExpanded && showPlayers && (
          <Grid
            item
            container
            xs={6}
            spacing={2}
            direction="row"
            justifyContent="flex-end">
            <OneTeam
              teamName="teamOne"
              winnerTeam={scrim?.teamWon || null}
              teamArr={scrim.teamOne}
              teamRoles={['Top', 'Jungle', 'Mid', 'ADC', 'Support']}
              alignContent="flex-end"
            />

            <OneTeam
              teamName="teamTwo"
              winnerTeam={scrim?.teamWon || null}
              teamArr={scrim.teamTwo}
              alignContent="flex-start"
              teamRoles={['Top', 'Jungle', 'Mid', 'ADC', 'Support']}
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

const CastersSection = memo(
  ({ casters, gameEnded, data, showCasters }) =>
    showCasters && (
      <Grid container direction="column" item xs={6}>
        {casters.length === 2 ? (
          <Typography variant="h2">
            Casters:{' '}
            {casters.map((caster, idx) => (
              <Fragment key={caster._id}>
                <Tooltip
                  arrow
                  placement="top"
                  title={`visit ${caster?.name}'s profile`}>
                  <Link
                    className="link"
                    to={`/users/${caster?.name}?region=${caster?.region}`}>
                    {caster?.name}
                  </Link>
                </Tooltip>
                {idx === 0 ? ' & ' : ''}
              </Fragment>
            ))}
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
                <Tooltip
                  arrow
                  placement="top"
                  title={`visit ${casters[0]?.name}'s profile`}>
                  <Link
                    className="link"
                    to={`/users/${casters[0]?.name}?region=${casters[0]?.region}`}>
                    {casters[0].name}
                  </Link>
                </Tooltip>
              </Typography>
            )}
          </Grid>
        )}

        <JoinCastButtons data={data} gameEnded={gameEnded} />
      </Grid>
    )
);

const JoinCastButtons = memo(({ data, gameEnded }) => {
  const {
    casterEntered,
    casters,
    buttonsDisabled,
    joinCast,
    leaveCast,
    maxCastersAllowedCount,
  } = data;

  // // don't show cast buttons if game ended or we have max casters or currentUser has joined cast
  if (gameEnded) return null;

  return (
    <Grid container alignItems="center" direction="row" spacing={2}>
      {casters.length !== maxCastersAllowedCount && !casterEntered && (
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disabled={
              casters.length === maxCastersAllowedCount ||
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
  );
});

const OneTeam = memo(
  ({ teamArr, teamRoles, alignContent, teamName, winnerTeam }) => {
    const background = getTeamBackgroundColor(teamName, winnerTeam);

    return (
      <Grid
        item
        container
        direction="column"
        style={{
          alignContent,
          backgroundColor: background.normal,
          backgroundImage: background.gradient,
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
        flexWrap="nowrap"
        alignItems="flex-start"
        xs={4}>
        {teamRoles.map((teamRole) => {
          const playerAssigned = teamArr.find(
            (player) => player?.role === teamRole
          );

          if (!playerAssigned) return null;

          const userInfo = playerAssigned?._user ?? null;

          if (!userInfo) return null;

          return (
            <Grid item key={userInfo?._id} xs={10}>
              <Tooltip
                arrow
                placement="top"
                title={`Visit ${userInfo?.name}'s profile`}>
                <Link
                  className={'link'}
                  to={`/users/${userInfo?.name}?region=${userInfo?.region}`}>
                  <img
                    alt={playerAssigned?.role}
                    src={ROLE_IMAGES[teamRole]}
                    style={{
                      position: 'relative',
                      top: '5px',
                      width: '20px',
                      marginRight: '2px',
                    }}
                  />
                  {truncate(userInfo.name, 12)}
                </Link>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    );
  }
);
