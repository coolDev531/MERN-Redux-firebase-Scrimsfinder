import { useContext, useEffect, useState } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import CountdownTimer from './CountdownTimer';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';
import { updateScrim } from '../services/scrims';
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

export default function ScrimSection({ scrim, idx, toggleFetch }) {
  const [currentUser] = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);
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
    let foundPlayer = scrim.casters.find(
      (casterName) => casterName === currentUser.name
    );

    if (foundPlayer) return;
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

  return (
    <div className="page-section one-scrim__container">
      <div className="inner-column">
        <div className="scrim__metadata">
          <h1>scrim {idx + 1}</h1>
          <div className={classes.gameMetaInfo}>
            <div className="ml-4">
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
                  </div>
                )}
              </div>
            </div>

            {/* <div className="">
              <h2>Game starting in...</h2>
              <CountdownTimer
                gameStarted={gameStarted}
                setGameStarted={setGameStarted}
                scrim={scrim}
              />
            </div> */}
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
            getNewScrimsData={() => toggleFetch((prevState) => !prevState)}
          />

          <div className={classes.teamsVersusSeparator}>
            {/* <h1>VS</h1> */}

            {/* <img
              src={
                'https://pa1.narvii.com/5779/8d76b2b8112e6aa9494a93f0ca6bbffe96e2f6c3_hq.gif'
              }
            /> */}
            <div>
              <h2>Game starting in...</h2>
              <CountdownTimer
                gameStarted={gameStarted}
                setGameStarted={setGameStarted}
                scrim={scrim}
              />
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
            getNewScrimsData={getNewScrimsData}
          />
        </div>
      </div>
    </div>
  );
}
