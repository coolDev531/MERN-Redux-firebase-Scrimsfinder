import { useContext, useState, useEffect, useMemo } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { updateScrim, getScrimById } from '../services/scrims';
import { ScrimsContext } from '../context/scrimsContext';
import Navbar from './../components/shared/Navbar';
import {
  Button,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import moment from 'moment';
import 'moment-timezone';
import { getDateAndTimeSeparated } from '../utils/getDateAndTimeSeparated';
import devLog from '../utils/devLog';

/**
 * @method sample
 * @param {Array} array
 * @return {String} takes an array of strings and returns a random element, the random element being a string.
 */
const sample = (array) => array[Math.floor(Math.random() * array.length)];

export default function ScrimEdit() {
  const { currentUser } = useContext(CurrentUserContext);
  const { toggleFetch } = useContext(ScrimsContext);

  const [scrimData, setScrimData] = useState({
    teamWon: '',
    region: '',
    title: '',
    casters: [],
    gameStartTime: new Date().toISOString(),
    lobbyName: '',
    lobbyPassword: '',
    lobbyHost: null,
  });

  const [dateData, setDateData] = useState({
    gameStartDate: new Date(),
    gameStartHours: [
      new Date().getHours().toString(),
      new Date().getMinutes().toString(),
    ],
  });

  const { id } = useParams();
  const history = useHistory();
  const [isUpdated, setUpdated] = useState(false);

  useEffect(() => {
    const prefillFormData = async () => {
      const oneScrim = await getScrimById(id);

      const {
        region,
        lobbyName,
        lobbyPassword,
        gameStartTime,
        teamOne,
        teamTwo,
      } = oneScrim;

      const { date, hours, minutes } = getDateAndTimeSeparated(gameStartTime);

      setDateData((prevState) => ({
        ...prevState,
        gameStartDate: date,
        gameStartHours: [hours, minutes],
      }));

      setScrimData({
        region,
        title: oneScrim?.title ?? `${oneScrim.createdBy.name}'s Scrim`, // default to this if no title exists in scrim
        lobbyName,
        lobbyPassword,
        teamWon: oneScrim?.teamWon ?? null,
        gameStartTime,
        teamOne,
        teamTwo,
        lobbyHost: oneScrim?.lobbyHost?.name ?? null, // for input values not wanting objects, we will return the object in the submit.
        previousLobbyHost: oneScrim?.lobbyHost ?? null,
        createdBy: oneScrim?.createdBy,
      });
    };
    prefillFormData();
  }, [history, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'gameStartHours' && value) {
      let hoursResult = value?.split(':');
      const [hours, minutes] = hoursResult;
      let gameStartDate = scrimData['gameStartTime'];
      let selectedDate = new Date(gameStartDate) ?? new Date();
      selectedDate.setHours(hours, minutes);

      setDateData((prevState) => ({
        ...prevState,
        gameStartDate: selectedDate.toISOString(),
        gameStartHours: [hours, minutes],
      }));
    } else if (name === 'gameStartDate' && value) {
      let date = new Date(value);
      date.setMinutes(0, 0, 0);

      date = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
      setDateData((prevState) => ({
        ...prevState,
        gameStartDate: date,
      }));
    } else {
      setScrimData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  let teamsArr = useMemo(() => {
    if (
      [...(scrimData?.teamOne ?? []), ...(scrimData?.teamTwo ?? [])].length > 0
    ) {
      return [...(scrimData?.teamOne ?? []), ...(scrimData?.teamTwo ?? [])].map(
        (item) => item
      );
    }
    return [];
  }, [scrimData]);

  const getLobbyHost = async () => {
    const { teamOne, teamTwo } = scrimData;

    // if he didn't change values.
    if (scrimData.lobbyHost === scrimData.previousLobbyHost.name) {
      devLog('previous lobby host');
      return scrimData.previousLobbyHost;
    } else if (scrimData.lobbyHost === currentUser?.name) {
      //  if lobby host is current User
      devLog('current user');
      return currentUser;
    } else if (scrimData.lobbyHost === 'random') {
      // if the lobby is full get a random player from the lobby to be the host.
      if ([...teamOne, ...teamTwo].length === 10) {
        devLog('getting random user to host');
        return sample([...teamOne, ...teamTwo]);
      } else {
        devLog("team size isn't 10, returning null");
        // if lobby isn't full return null so it will generate a host on the backend.
        return null;
      }
    }

    return teamsArr.find((p) => p.name === scrimData.lobbyHost);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let yes = window.confirm('are you sure you want to update this scrim?');
    if (!yes) return;

    const dataSending = {
      ...scrimData,
      lobbyHost: await getLobbyHost(),
      // if user selected N//A send null for teamWon, else send the actual value and result to null if undefined
      teamWon: scrimData?.teamWon === 'N/A' ? null : scrimData?.teamWon ?? null,
    };

    const updatedScrim = await updateScrim(id, dataSending);

    if (updatedScrim) {
      toggleFetch((prev) => !prev);
      console.log(`%c updated scrim: ${id}`, 'color: lightgreen');
      setUpdated(true);
    }
  };

  useEffect(() => {
    let [hours, minutes] = dateData.gameStartHours;

    let gameStartDate = dateData['gameStartDate'];

    let gameStartTime = new Date(gameStartDate) ?? new Date();
    gameStartTime.setHours(hours, minutes);

    setScrimData((prevState) => ({
      ...prevState,
      gameStartTime: gameStartTime.toISOString(),
    }));
  }, [dateData]);

  //  if user doesn't have admin key, push to '/'
  if (process.env.REACT_APP_ADMIN_KEY !== currentUser?.adminKey) {
    return <Redirect to="/" />;
  }

  if (isUpdated) {
    return <Redirect to={`/scrims/${id}`} />;
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page-section create-scrim">
          <div className="inner-column">
            <form
              onSubmit={handleSubmit}
              style={{
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
              <Grid container direction="column" alignItems="center">
                <Grid
                  container
                  item
                  direction="column"
                  alignItems="center"
                  xs={8}
                  spacing={4}
                  justifyContent="center">
                  <Grid
                    item
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    xs={6}>
                    <Grid item container justifyContent="space-evenly">
                      <Grid item>
                        <FormHelperText className="text-white">
                          Game Start Date
                        </FormHelperText>
                        <TextField
                          onChange={handleChange}
                          required
                          type="date"
                          name="gameStartDate"
                          value={moment(
                            new Date(scrimData.gameStartTime).toISOString()
                          ).format('yyyy-MM-DD')}
                        />
                      </Grid>
                      <Grid item>
                        <FormHelperText className="text-white">
                          Game Start Time
                        </FormHelperText>

                        <TextField
                          onChange={handleChange}
                          required
                          type="time"
                          name="gameStartHours"
                          value={[...dateData.gameStartHours].join(':')}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item sm={12}>
                    <Grid item>Scrim Title</Grid>
                    <TextField
                      onChange={handleChange}
                      required
                      name="title"
                      value={scrimData.title}
                      helperText={`Example: ${currentUser?.name}'s scrim`}
                    />
                  </Grid>

                  <Grid container xs={4} item direction="column">
                    <Grid item>
                      <FormHelperText className="text-white">
                        Lobby Name
                      </FormHelperText>
                    </Grid>
                    <Grid item sm={12}>
                      <TextField
                        fullWidth
                        onChange={handleChange}
                        required
                        type="text"
                        name="lobbyName"
                        value={scrimData.lobbyName}
                      />
                    </Grid>
                  </Grid>
                  <Grid item>
                    <FormHelperText className="text-white">
                      Lobby Password
                    </FormHelperText>
                    <TextField
                      onChange={handleChange}
                      required
                      type="text"
                      name="lobbyPassword"
                      value={scrimData.lobbyPassword}
                    />
                  </Grid>

                  <Grid
                    item
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}>
                    <Grid item xs={12} sm={2} md={2}>
                      <Select
                        label="region"
                        name="region"
                        value={scrimData.region}
                        className="text-white"
                        onChange={handleChange}
                        fullWidth>
                        {['NA', 'EUW', 'EUNE', 'LAN'].map((region, key) => (
                          <MenuItem value={region} key={key}>
                            {region}
                          </MenuItem>
                        ))}
                      </Select>

                      <FormHelperText className="text-white">
                        Scrim region
                      </FormHelperText>
                    </Grid>

                    <Grid item>
                      <Select
                        name="lobbyHost"
                        onChange={(e) =>
                          setScrimData((prevState) => ({
                            ...prevState,
                            lobbyHost: e.target.value,
                          }))
                        }
                        value={scrimData.lobbyHost || ''}>
                        {/* check that names aren't repeating */}
                        {[
                          ...new Set([
                            scrimData.createdBy?.name,
                            scrimData?.lobbyHost ?? 'random',
                            currentUser?.name,
                            'random',
                            ...teamsArr.map((user) => user.name),
                          ]),
                        ].flatMap((value, key) => {
                          return (
                            <MenuItem value={value || ''} key={key}>
                              {value === currentUser?.name
                                ? 'I will host the lobby'
                                : value === 'random'
                                ? 'Choose a random player from the teams to host'
                                : value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      <FormHelperText className="text-white">
                        Lobby host
                      </FormHelperText>
                    </Grid>
                  </Grid>

                  <Grid item>
                    <FormHelperText className="text-white">
                      Who Won?
                    </FormHelperText>
                    <Select
                      name="teamWon"
                      value={scrimData.teamWon || 'N/A'}
                      onChange={handleChange}>
                      {['Team 1 (Blue Side)', 'Team 2 (Red Side)', 'N/A'].map(
                        (team, key) => (
                          <MenuItem value={team} key={key}>
                            {team}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </Grid>

                  <Grid item>
                    <div className="page-break" />
                    <Button variant="contained" color="primary" type="submit">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
