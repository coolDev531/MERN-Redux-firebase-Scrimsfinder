import { useEffect, useState, useMemo, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import useAlerts from './../../hooks/useAlerts';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import useSocket from './../../hooks/useSocket';
import { useScrimSocket } from './../../hooks/useScrims';

//  components
import ScrimTeamList from './ScrimTeamList';
import ScrimSectionMiddleAreaBox from './ScrimSectionMiddleAreaBox';
import ScrimSectionHeader from './ScrimSectionHeader';
import { PageSection } from '../shared/PageComponents';
import ScrimSectionExpander from './ScrimSectionExpander';

// services
import {
  deleteScrim,
  getScrimById,
  removeCasterFromScrim,
  swapPlayersInScrim,
} from '../../services/scrims.services';
import { insertCasterInScrim } from '../../services/scrims.services';

// utils
import { compareDates } from '../../utils/compareDates';
import devLog from './../../utils/devLog';

const MAX_CASTER_AMOUNT = 2;

export default function ScrimSection({ scrimData, isInDetail }) {
  const { currentUser } = useAuth();
  const { setCurrentAlert } = useAlerts();

  // the expand controls at bottom (dont show if we have the isInDetail prop, aka only one scrim page)
  const [isBoxExpanded, setIsBoxExpanded] = useState(() => {
    return isInDetail ? scrimData?._id : false;
  });

  const { socket } = useSocket();

  const [playerEntered, setPlayerEntered] = useState(false);
  const [casterEntered, setCasterEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false); // for when players spam joining or leaving.

  const [scrim, setScrim] = useScrimSocket(scrimData, isBoxExpanded);
  const [swapPlayers, setSwapPlayers] = useState({
    playerOne: null,
    playerTwo: null,
  });

  const scrimBoxRef = useRef(null); // element container

  const dispatch = useDispatch();

  // if the scrim has a winning team, it means it has ended.
  const gameEnded = useMemo(() => scrim?.teamWon, [scrim?.teamWon]);

  const classes = useScrimSectionStyles({ scrim, isBoxExpanded });

  const history = useHistory();

  const { teamOne, teamTwo, casters } = scrim;

  // when the user first expands this scrim and this isn't on detail page, refetch data.
  useEffect(() => {
    const fetchOneScrim = async () => {
      if (isBoxExpanded && !isInDetail) {
        devLog(`scrim box expanded ${isBoxExpanded}, fetching data`);

        const oneScrim = await getScrimById(scrimData?._id);
        // for when it's deleted
        if (oneScrim?.createdBy) {
          setScrim(oneScrim);
        } else {
          setScrim(null);
        }
      }
    };

    fetchOneScrim();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBoxExpanded, isInDetail, scrimData?._id]);

  useEffect(() => {
    let gameHasStarted = compareDates(scrim) > 0;

    if (gameHasStarted) {
      setGameStarted(scrim._id);
    }
  }, [scrim]);

  useEffect(() => {
    const teams = [...teamOne, ...teamTwo];

    let foundPlayer = teams.find(
      (player) => player?._user?._id === currentUser?._id
    );

    let foundCaster = scrim.casters.find(
      (caster) => caster?._id === currentUser?._id
    );

    if (foundCaster) {
      setCasterEntered(foundCaster);
    } else {
      setCasterEntered(false);
    }

    if (foundPlayer) {
      setPlayerEntered(foundPlayer);
    } else {
      setPlayerEntered(false);
    }
  }, [scrim, currentUser?._id, teamOne, teamTwo]);

  useEffect(() => {
    if (scrim.postGameImage) {
      setImageUploaded(scrim._id);
    } else {
      setImageUploaded(false);
    }
  }, [scrim]);

  useEffect(() => {
    const checkSwap = async () => {
      if (swapPlayers?.playerOne?.role && swapPlayers?.playerTwo?.role) {
        if (swapPlayers?.playerOne?._user === swapPlayers?.playerTwo?._user) {
          setSwapPlayers({ playerOne: null, playerTwo: null });
          return;
        }

        const updatedScrim = await swapPlayersInScrim({
          scrimId: scrim._id,
          swapPlayers,
          setButtonsDisabled,
          setAlert: setCurrentAlert,
          setScrim,
        });

        socket?.emit('sendScrimTransaction', updatedScrim);

        setSwapPlayers({ playerOne: null, playerTwo: null });
      }
    };
    checkSwap();

    // eslint-disable-next-line
  }, [swapPlayers, scrim?._id]);

  const joinCast = async () => {
    if (playerEntered) {
      setCurrentAlert({
        type: 'Error',
        message: (
          <span>
            cannot join cast:&nbsp;
            <strong>You're already in a team!</strong>
          </span>
        ),
      });
      return;
    }

    if (casterEntered) return;
    if (casters.length === MAX_CASTER_AMOUNT) return;

    setButtonsDisabled(true);

    const updatedScrim = await insertCasterInScrim({
      scrimId: scrim._id,
      userId: currentUser?._id,
      setAlert: setCurrentAlert,
      setButtonsDisabled,
      setScrim,
    });

    // using .createdBy because on error it wont return populated scrim, so we don't set the scrim
    if (updatedScrim?.createdBy) {
      setScrim(updatedScrim);
      socket?.emit('sendScrimTransaction', updatedScrim);
    }

    setButtonsDisabled(false);
  };

  const leaveCast = async () => {
    setButtonsDisabled(true);

    const updatedScrim = await removeCasterFromScrim({
      scrimId: scrim._id,
      userId: casterEntered?._id,
      setAlert: setCurrentAlert,
      setButtonsDisabled,
    });

    if (updatedScrim?.createdBy) {
      setScrim(updatedScrim);
      socket?.emit('sendScrimTransaction', updatedScrim);
    }

    setButtonsDisabled(false);
  };

  const handleDeleteScrim = async () => {
    try {
      let yes = window.confirm('Are you sure you want to close this scrim?');
      if (!yes) return;

      let deletedScrim = await deleteScrim(scrim._id);

      if (deletedScrim) {
        dispatch({ type: 'scrims/deleteScrim', payload: scrim });

        if (isInDetail) {
          history.push('/');
        }

        setCurrentAlert({
          type: 'Success',
          message: 'Scrim removed successfully',
        });
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.error ?? 'error removing scrim';

      setCurrentAlert({ type: 'Error', message: errorMsg });
    }
  };

  if (!scrim) return null;

  // the "Scrim Box"
  return (
    <PageSection aria-label="scrim section">
      <div className={classes.scrimBox} ref={scrimBoxRef}>
        <ScrimSectionHeader
          scrim={scrim}
          joinCast={joinCast}
          leaveCast={leaveCast}
          handleDeleteScrim={handleDeleteScrim}
          gameEnded={gameEnded}
          casterEntered={casterEntered}
          buttonsDisabled={buttonsDisabled}
          isBoxExpanded={isBoxExpanded}
          isInDetail={isInDetail}
        />

        {isBoxExpanded && (
          /* don't render teams and countdown timer if not expanded,
           that avoids unnecessary rerenders from the CountDownTimer and Teams List */
          // this will default to true if in ScrimDetail page, which is the expected behaviour.
          <div className={classes.teamsContainer}>
            {/* teamOne */}
            <ScrimTeamList
              teamData={{
                teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
                teamName: 'teamOne',
                teamTitleName: 'Team 1 (Blue Side)',
                teamArray: teamOne,
              }}
              setScrim={setScrim}
              scrim={scrim}
              playerEntered={playerEntered}
              casterEntered={casterEntered}
              gameStarted={gameStarted === scrim._id}
              buttonsDisabled={buttonsDisabled}
              setButtonsDisabled={setButtonsDisabled}
              socket={socket}
              setSwapPlayers={setSwapPlayers}
            />

            {/* the middle box that contains the countdown timer and other details. */}
            <ScrimSectionMiddleAreaBox
              imageUploaded={imageUploaded === scrim._id}
              scrim={scrim}
              setScrim={setScrim}
              gameStarted={gameStarted === scrim._id}
              setGameStarted={setGameStarted}
              gameEnded={gameEnded}
              playerEntered={playerEntered}
              socket={socket}
              casterEntered={casterEntered}
            />

            {/* teamTwo */}
            <ScrimTeamList
              teamData={{
                teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
                teamName: 'teamTwo',
                teamTitleName: 'Team 2 (Red Side)',
                teamArray: teamTwo,
              }}
              scrim={scrim}
              setScrim={setScrim}
              playerEntered={playerEntered}
              casterEntered={casterEntered}
              gameStarted={gameStarted === scrim._id}
              buttonsDisabled={buttonsDisabled}
              setButtonsDisabled={setButtonsDisabled}
              socket={socket}
              setSwapPlayers={setSwapPlayers}
            />
          </div>
        )}
      </div>

      {!isInDetail && (
        <ScrimSectionExpander
          scrimBoxRef={scrimBoxRef}
          isBoxExpanded={isBoxExpanded}
          setIsBoxExpanded={setIsBoxExpanded}
          scrimId={scrim._id}
        />
      )}
    </PageSection>
  );
}
