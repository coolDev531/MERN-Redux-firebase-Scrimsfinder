import { useContext, useEffect, useState } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { updateScrim } from '../services/scrims';
import CountdownTimer from './CountdownTimer';
import ExitIcon from '@material-ui/icons/ExitToApp';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';
import ScrimPlayersData from './ScrimTeamsData';

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

export default function ScrimSection({ scrim, idx, toggleFetch }) {
  const [currentUser] = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const classes = useScrimSectionStyles();

  const { teamOne, teamTwo, casters } = scrim;

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

  const excludeSeconds = { hour: '2-digit', minute: '2-digit' };

  return (
    <div className="page-section one-scrim__container">
      <div className="inner-column">
        <div className="scrim__metadata">
          <h1>scrim {idx + 1}</h1>
          <div className={classes.gameMetaInfo}>
            <h2>
              Game Start:&nbsp;
              {new Date(scrim.gameStartTime).toLocaleString([], excludeSeconds)}
            </h2>

            <CountdownTimer
              gameStarted={gameStarted}
              setGameStarted={setGameStarted}
              scrim={scrim}
            />
          </div>
          {gameStarted ? 'GAMESTARTED!' : 'still waiting...'}
          <h2>Casters: {casters.map((caster) => caster).join(' & ')}</h2>
        </div>

        <div
          className="teams-container"
          style={{ display: 'flex', gap: '10%' }}>
          <ScrimPlayersData
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

          <ScrimPlayersData
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
            getNewScrimsData={() => toggleFetch((prevState) => !prevState)}
          />
        </div>
      </div>
    </div>
  );
}
