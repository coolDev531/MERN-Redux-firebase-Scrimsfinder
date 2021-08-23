import { useContext, useEffect, useState } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import CountdownTimer from './CountdownTimer';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';
import { updateScrim, deleteScrim } from '../services/scrims';
import ScrimTeamList from './ScrimTeamList';

const compareDates = (scrim) => {
  let currentTime = new Date().getTime();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();

  if (currentTime < gameStartTime) {
    return -1;
  } else if (currentTime > gameStartTime) {
    return 1;
  } else {
    return 0;
  }
};

const MAX_CASTER_AMOUNT = 2;

export default function ScrimSection({ scrim, toggleFetch, setScrims }) {
  const [currentUser] = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);
  const [casterEntered, setCasterEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const classes = useScrimSectionStyles();

  const { teamOne, teamTwo, casters } = scrim;

  const getNewScrimsData = () => toggleFetch((prevState) => !prevState);

  useEffect(() => {
    let gameHasStarted = compareDates(scrim) > 0;

    if (gameHasStarted) {
      setGameStarted(gameHasStarted);
    }
  }, [scrim]);

  useEffect(() => {
    const teams = [...teamOne, ...teamTwo];

    let foundPlayer = teams.find((player) => player.name === currentUser.name);

    let foundCaster = scrim.casters.find(
      (casterName) => casterName === currentUser.name
    );

    if (foundCaster) {
      setCasterEntered(foundCaster);
    } else {
      setCasterEntered(false);
    }

    return foundPlayer
      ? setPlayerEntered(foundPlayer)
      : setPlayerEntered(false);
  }, [scrim, currentUser.name, teamOne, teamTwo]);

  const excludeSeconds = {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  const joinCast = async () => {
    if (playerEntered) {
      alert("You're already in a team!");
      return;
    }

    if (casterEntered) return;
    if (casters.length === MAX_CASTER_AMOUNT) return;

    const scrimData = {
      ...scrim,
      casters: [...scrim.casters, currentUser.name],
    };

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      console.log(
        `%cadded ${currentUser.name} as a caster for scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  const leaveCast = async () => {
    const scrimData = {
      ...scrim,
      casters: scrim.casters.filter(
        (caster) => caster.name !== casterEntered.name
      ),
    };

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      console.log(
        `%removed ${currentUser.name} from the caster list for scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };
  const cancelScrim = async () => {
    let deletedScrim = await deleteScrim(scrim._id);

    if (deletedScrim) {
      setScrims((prevState) => prevState.filter((s) => s._id !== scrim._id));
    }
  };

  return (
    <div className="page-section one-scrim__container">
      <div className="inner-column">
        <div className="scrim__metadata">
          <h1>{scrim.createdBy?.name}'s scrim</h1>
          <div className={classes.gameMetaInfo}>
            <div>
              <h2>
                Game Start:&nbsp;
                {new Date(scrim.gameStartTime).toLocaleString(
                  [],
                  excludeSeconds
                )}
              </h2>

              <div className="casters-container">
                {casters.length === 2 ? (
                  <h2>Casters {casters.map((caster) => caster).join(' & ')}</h2>
                ) : (
                  <div className="d-flex align-center gap-20">
                    {casters.length === 0 ? <h2>No Casters</h2> : null}
                    {casters[0] && <h2>Current Casters: {casters[0]}</h2>}

                    <button
                      disabled={
                        casters.length === MAX_CASTER_AMOUNT ||
                        scrim.casters.find(
                          (casterName) => casterName === currentUser.name
                        )
                      }
                      onClick={joinCast}>
                      join casting
                    </button>
                    {casterEntered && (
                      <button onClick={leaveCast}>Leave cast</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={classes.teamsContainer}>
          {/* teamOne */}
          <ScrimTeamList
            teamOne={teamOne}
            teamTwo={teamTwo}
            teamData={{
              teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
              teamName: 'teamOne',
              teamTitleName: 'Team One',
              teamArray: teamOne,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            getNewScrimsData={() => toggleFetch((prevState) => !prevState)}
          />

          <div className={classes.teamsVersusSeparator}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '10px',
                borderRadius: '4px',
              }}>
              {!gameStarted && (
                <h2 className="text-black">Game starting in...</h2>
              )}
              <CountdownTimer
                gameStarted={gameStarted}
                setGameStarted={setGameStarted}
                scrim={scrim}
              />

              {gameStarted &&
                (scrim.lobbyHost ? (
                  <h2 className="text-black">Lobby host: {scrim.lobbyHost}</h2>
                ) : (
                  <>
                    <h2 className="text-black">Not enough players</h2>
                    {scrim.createdBy.name === currentUser.name ? (
                      <button onClick={cancelScrim}>Cancel event</button>
                    ) : scrim.createdBy.name !== currentUser.name &&
                      currentUser.ADMIN_SECRET_KEY ===
                        process.env.REACT_APP_ADMIN_SECRET_KEY ? (
                      <button onClick={cancelScrim}>Cancel event</button>
                    ) : null}
                  </>
                ))}
            </div>
          </div>

          {/* teamTwo */}
          <ScrimTeamList
            teamOne={teamOne}
            teamTwo={teamTwo}
            teamData={{
              teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
              teamName: 'teamTwo',
              teamTitleName: 'Team Two',
              teamArray: teamTwo,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            getNewScrimsData={getNewScrimsData}
          />
        </div>
      </div>
    </div>
  );
}
