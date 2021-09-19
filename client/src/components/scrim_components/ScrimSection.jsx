import { useEffect, useState, useMemo } from 'react';
import { useScrims } from './../../context/scrimsContext';
import { useAuth } from './../../context/currentUser';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import { useAlerts } from '../../context/alertsContext';
import { useHistory } from 'react-router-dom';

//  components
import ScrimTeamList from './ScrimTeamList';
import ScrimSectionMiddleAreaBox from './ScrimSectionMiddleAreaBox';
import ScrimSectionHeader from './ScrimSectionHeader';
import { PageSection } from '../shared/PageComponents';

// utils / services
import { deleteScrim, removeCasterFromScrim } from '../../services/scrims';
import { insertCasterInScrim } from '../../services/scrims';

const compareDates = (scrim) => {
  let currentTime = new Date().getTime();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();

  if (currentTime < gameStartTime) {
    // if the currentTime is less than the game start time, that means the game didn't start
    return -1;
  } else if (currentTime > gameStartTime) {
    // if the current time is greater than the game start time, that means the game started
    return 1;
  } else {
    return 0;
  }
};

const MAX_CASTER_AMOUNT = 2;

export default function ScrimSection({ scrim, isInDetail }) {
  const { setScrims, fetchScrims } = useScrims();
  const { currentUser } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const [playerEntered, setPlayerEntered] = useState(false);
  const [casterEntered, setCasterEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false); // for when players spam joining or leaving.

  // if the scrim has a winning team, it means it has ended.
  const gameEnded = useMemo(() => scrim.teamWon, [scrim.teamWon]);

  const classes = useScrimSectionStyles({ imageUploaded, scrim });
  const history = useHistory();

  const { teamOne, teamTwo, casters } = scrim;

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

    fetchScrims();

    const updatedScrim = await insertCasterInScrim({
      scrimId: scrim._id,
      userId: currentUser?._id,
      setAlert: setCurrentAlert,
    });

    if (updatedScrim) {
      console.log(
        `%cadded ${currentUser?.name} as a caster for scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      fetchScrims();
    }
  };

  const leaveCast = async () => {
    fetchScrims();

    const updatedScrim = await removeCasterFromScrim({
      scrimId: scrim._id,
      userId: casterEntered?._id,
      setAlert: setCurrentAlert,
    });

    if (updatedScrim) {
      console.log(
        `%cremoved ${currentUser?.name} from the caster list for scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      fetchScrims();
    }
  };

  const handleDeleteScrim = async () => {
    try {
      let yes = window.confirm('Are you sure you want to close this scrim?');
      if (!yes) return;

      let deletedScrim = await deleteScrim(scrim._id);

      if (deletedScrim) {
        setScrims((prevState) => prevState.filter((s) => s._id !== scrim._id));

        setCurrentAlert({
          type: 'Success',
          message: 'Scrim removed successfully',
        });

        if (isInDetail) {
          history.push('/');
          fetchScrims();
        }
      }
    } catch (err) {
      console.error(err);
      setCurrentAlert({ type: 'Error', message: 'Error removing scrim' });
    }
  };

  // the "Scrim Box"
  return (
    <PageSection aria-label="scrim section">
      <div className={classes.scrimBox}>
        <ScrimSectionHeader
          scrim={scrim}
          joinCast={joinCast}
          leaveCast={leaveCast}
          handleDeleteScrim={handleDeleteScrim}
          gameEnded={gameEnded}
          casterEntered={casterEntered}
        />

        <div className={classes.teamsContainer}>
          {/* teamOne */}
          <ScrimTeamList
            teamData={{
              teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
              teamName: 'teamOne',
              teamTitleName: 'Team 1 (Blue Side)',
              teamArray: teamOne,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            gameStarted={gameStarted === scrim._id}
            buttonsDisabled={buttonsDisabled}
            setButtonsDisabled={setButtonsDisabled}
          />

          {/* the middle box that contains the countdown timer and other details. */}
          <ScrimSectionMiddleAreaBox
            imageUploaded={imageUploaded === scrim._id}
            scrim={scrim}
            gameStarted={gameStarted === scrim._id}
            setGameStarted={setGameStarted}
            gameEnded={gameEnded}
            playerEntered={playerEntered}
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
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            gameStarted={gameStarted === scrim._id}
            buttonsDisabled={buttonsDisabled}
            setButtonsDisabled={setButtonsDisabled}
          />
        </div>
      </div>
    </PageSection>
  );
}
