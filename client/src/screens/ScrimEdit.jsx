import { useState, useEffect, useMemo } from 'react';
import { useScrimsActions } from './../hooks/useScrims';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import useAlerts from '../hooks/useAlerts';
import useAuth from './../hooks/useAuth';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import {
  PageContent,
  PageSection,
  InnerColumn,
} from '../components/shared/PageComponents';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from './../components/shared/Tooltip';
import Loading from './../components/shared/Loading';

// utils // services
import moment from 'moment';
import 'moment-timezone';
import { getDateAndTimeSeparated } from '../utils/getDateAndTimeSeparated';
import devLog from '../utils/devLog';
import { updateScrim, getScrimById } from '../services/scrims';

/**
 * @method sample
 * @param {Array} array of users
 * @return {Object} takes an array of objects and returns a random element, the random element being a object.
 */
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const RANDOM_HOST_CODE = '_$random'; // because input doesn't want value to be null, if lobbyhost is equal to this, send it as null in the back end

export default function ScrimEdit() {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { fetchScrims } = useScrimsActions();
  const { setCurrentAlert } = useAlerts();

  const [scrimData, setScrimData] = useState({
    teamWon: '',
    region: '',
    title: '',
    casters: [],
    teamOne: [],
    teamTwo: [],
    gameStartTime: new Date().toISOString(),
    lobbyName: '',
    lobbyPassword: '',
    lobbyHost: null,
    createdBy: null,
    previousLobbyHost: null,
    isPrivate: false,
    _lobbyHost: RANDOM_HOST_CODE, // _id
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

  const [isUpdating, setIsUpdating] = useState(false);
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
        previousLobbyHost: oneScrim?.lobbyHost ?? null,
        createdBy: oneScrim?.createdBy,
        casters: oneScrim?.casters,
        isPrivate: oneScrim?.isPrivate ?? false,
        _lobbyHost: oneScrim?.lobbyHost?._id ?? RANDOM_HOST_CODE,
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

  let usersArr = useMemo(() => {
    let teamOne = scrimData?.teamOne.map((player) => player?._user);
    let teamTwo = scrimData?.teamTwo.map((player) => player?._user);
    let casters = scrimData?.casters.map((player) => player);

    let result = [
      ...teamOne,
      ...teamTwo,
      ...casters,
      scrimData.createdBy,
      currentUser,
    ];

    // unique values, currentUser can be createdBy and can be a caster or player.
    return [...new Set([...result])];
  }, [
    scrimData?.teamOne,
    scrimData?.casters,
    scrimData?.teamTwo,
    currentUser,
    scrimData.createdBy,
  ]);

  let idsArr = useMemo(() => {
    let teamOne = scrimData?.teamOne.map((player) => player?._user?._id);
    let teamTwo = scrimData?.teamTwo.map((player) => player?._user?._id);

    let casters = scrimData?.casters.map((player) => player?._id);

    let result = [
      ...teamOne,
      ...teamTwo,
      ...casters,
      scrimData.createdBy?._id,
      currentUser?._id,
    ];

    // unique values, currentUser can be createdBy and can be a caster or player.
    return [...new Set([...result])];
  }, [
    scrimData?.teamOne,
    scrimData?.casters,
    scrimData?.teamTwo,
    currentUser?._id,
    scrimData.createdBy?._id,
  ]);

  const getLobbyHost = async () => {
    const { teamOne, teamTwo } = scrimData;

    // if he didn't change values.
    if (scrimData._lobbyHost === scrimData.previousLobbyHost?._id) {
      devLog('previous lobby host');
      return scrimData?.previousLobbyHost;
    } else if (scrimData._lobbyHost === currentUser?._id) {
      //  if lobby host is current User
      devLog('current user');
      return currentUser;

      // if admin chose random
    } else if (scrimData._lobbyHost === RANDOM_HOST_CODE) {
      // if the lobby is full get a random player from the lobby to be the host.
      if ([...teamOne, ...teamTwo].length === 10) {
        devLog('getting random user to host');
        return sample([...teamOne, ...teamTwo])._user;
      } else {
        devLog("team size isn't 10, returning null (lobbyHost)");
        // if lobby isn't full return null so it will generate a host on the backend.
        return null;
      }
    }
    // if scrimData._lobbyHost has a value and it's not the previous host or currentUser.
    return usersArr.find((user) => user._id === scrimData._lobbyHost);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let yes = window.confirm('are you sure you want to update this scrim?');
      if (!yes) {
        setIsUpdating(false);
        return;
      }

      const dataSending = {
        ...scrimData,
        lobbyHost: await getLobbyHost(),
        // if user selected N//A send null for teamWon, else send the actual value and result to null if undefined
        teamWon:
          scrimData?.teamWon === 'N/A' ? null : scrimData?.teamWon ?? null,
      };

      const updatedScrim = await updateScrim(id, dataSending, setCurrentAlert);

      if (updatedScrim) {
        await fetchScrims();
        console.log(`%c updated scrim: ${id}`, 'color: lightgreen');
        setCurrentAlert({
          type: 'Success',
          message: 'Scrim updated successfully!',
        });
        setUpdated(true);
        setIsUpdating(false);
        return;
      }
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error updating Scrim',
      });
      setIsUpdating(false);

      return;
    }
  };

  useEffect(() => {
    let [hours, minutes] = dateData.gameStartHours;

    let gameStartDate = dateData['gameStartDate'];

    let gameStartTime = new Date(gameStartDate) ?? new Date();
    gameStartTime.setHours(hours, minutes);

    gameStartTime = new Date(
      gameStartTime.getTime() + gameStartTime.getTimezoneOffset()
    );

    setScrimData((prevState) => ({
      ...prevState,
      gameStartTime: gameStartTime.toISOString(),
    }));

    return () => {
      setScrimData((prevState) => ({
        ...prevState,
        gameStartTime: gameStartTime.toISOString(),
      }));
    };
  }, [dateData]);

  //  if user doesn't have admin key, push to '/'
  if (!isCurrentUserAdmin) {
    return <Redirect to="/" />;
  }

  if (isUpdated) {
    return <Redirect to={`/scrims/${id}`} />;
  }

  // if scrim isn't loaded, return loading component
  if (!scrimData?.createdBy || isUpdating) {
    return <Loading text={isUpdating ? 'Updating scrim...' : 'Loading...'} />;
  }

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <PageSection>
          <InnerColumn>
            <form
              onSubmit={handleSubmit}
              style={{
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
              <Grid
                mt={2}
                container
                direction="column"
                alignItems="center"
                spacing={4}
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  width: '100%',
                }}>
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}>
                  <Grid item>
                    <FormHelperText className="text-white">
                      Game Start Date
                    </FormHelperText>
                    <TextField
                      variant="standard"
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
                      variant="standard"
                      value={
                        moment(scrimData?.gameStartTime).format('HH:mm') ||
                        moment().format('HH:mm')
                      }
                    />
                  </Grid>
                </Grid>

                <Grid
                  mt={2}
                  container
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}>
                  <Grid item>
                    <FormHelperText className="text-white">
                      Scrim Title
                    </FormHelperText>
                    <TextField
                      onChange={handleChange}
                      required
                      type="text"
                      name="title"
                      variant="standard"
                      value={scrimData.title}
                      helperText={`Example: ${scrimData?.createdBy?.name}'s Scrim`}
                    />
                  </Grid>

                  <Grid item>
                    <FormHelperText className="text-white">
                      Lobby Name
                    </FormHelperText>
                    <TextField
                      onChange={handleChange}
                      required
                      type="text"
                      name="lobbyName"
                      variant="standard"
                      value={scrimData.lobbyName}
                    />
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
                      variant="standard"
                      value={scrimData.lobbyPassword}
                    />
                  </Grid>

                  {/*  */}
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
                      fullWidth
                      variant="standard">
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
                      variant="standard"
                      name="_lobbyHost"
                      onChange={handleChange}
                      value={scrimData._lobbyHost || RANDOM_HOST_CODE}>
                      {/* check that names aren't repeating */}
                      {[RANDOM_HOST_CODE, ...idsArr].map((id, key) => {
                        if (id === RANDOM_HOST_CODE)
                          return (
                            <MenuItem
                              value={RANDOM_HOST_CODE}
                              key={RANDOM_HOST_CODE}>
                              Random Host!
                            </MenuItem>
                          );

                        if (id === currentUser?._id) {
                          return (
                            <MenuItem value={id} key={key}>
                              I will host!
                            </MenuItem>
                          );
                        }

                        return (
                          <MenuItem value={id} key={key}>
                            {usersArr.find((user) => user?._id === id)?.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText className="text-white">
                      Lobby host
                    </FormHelperText>
                  </Grid>
                </Grid>

                <Grid
                  item
                  container
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  direction="row">
                  <Grid item>
                    <FormHelperText className="text-white">
                      Who Won?
                    </FormHelperText>
                    <Select
                      variant="standard"
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
                    <FormControlLabel
                      control={
                        <Tooltip title="Is the scrim private?" placement="top">
                          <Checkbox
                            color="primary"
                            checked={scrimData.isPrivate}
                            onChange={() => {
                              setScrimData((prevState) => ({
                                ...prevState,
                                isPrivate: !prevState.isPrivate,
                              }));
                            }}
                            name="isPrivate"
                          />
                        </Tooltip>
                      }
                      label={
                        <p
                          style={{
                            fontSize: '0.75rem',
                            marginBottom: 0,
                            marginTop: '19px',
                          }}>
                          Private
                        </p>
                      }
                      labelPlacement="top"
                    />
                  </Grid>
                </Grid>

                <Grid item>
                  <div className="page-break" />
                  <Button variant="contained" color="primary" type="submit">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </InnerColumn>
        </PageSection>
      </PageContent>
    </>
  );
}
