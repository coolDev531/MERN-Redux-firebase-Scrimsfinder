import { useState, useEffect } from 'react';
import { useScrims } from './../context/scrimsContext';
import { useAlerts } from './../context/alertsContext';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import {
  Grid,
  TextField,
  Box,
  MenuItem,
  FormHelperText,
  Button,
} from '@material-ui/core';
import { Redirect } from 'react-router';
import { useAuth } from './../context/currentUser';
import { Select } from '@material-ui/core';
import {
  InnerColumn,
  PageContent,
  PageSection,
} from './../components/shared/PageComponents';

// utils and services
import { createScrim } from './../services/scrims';
import { getMinutes } from './../utils/getMinutes';
import moment from 'moment';
import 'moment-timezone';
import devLog from './../utils/devLog';

export default function ScrimCreate() {
  const { fetchScrims } = useScrims();
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const [scrimData, setScrimData] = useState({
    gameStartTime: new Date().toISOString(),
    lobbyHost: currentUser,
    region: currentUser?.region,
    createdBy: currentUser,
    title: '',
  });
  const [dateData, setDateData] = useState({
    gameStartDate: new Date(),
    gameStartHours: [new Date().getHours().toString(), getMinutes(new Date())],
  });

  const [isCreated, setCreated] = useState(false);

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
      // we're setting minutes to 0, hours to 0 and milliseconds to 0
      date.setMinutes(0, 0, 0);

      // getTime() gives you the date's representation in milliseconds
      /* we're using getTime and converting timezone offset to time, 1 minute has 60 seconds, 
      to convert it to milliseconds you multiply it by a thousand */
      date = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000); // value doesn't get time zone offset so we're taking care of it here.
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

  useEffect(() => {
    let [hours, minutes] = dateData.gameStartHours;

    let gameStartTime = dateData['gameStartDate'];

    let selectedDate = new Date(gameStartTime) ?? new Date();
    selectedDate.setHours(hours, minutes);

    setScrimData((prevState) => ({
      ...prevState,
      gameStartTime: selectedDate.toISOString(),
    }));
  }, [dateData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scrimToCreate = {
        ...scrimData,
        lobbyHost: scrimData.lobbyHost === 'random' ? null : currentUser,
      };

      const createdScrim = await createScrim(scrimToCreate);

      fetchScrims();

      devLog('created new scrim!', createdScrim);
      setCreated({ createdScrim });

      setCurrentAlert({
        type: 'Success',
        message: 'scrim created successfully!',
      });
    } catch (error) {
      setCurrentAlert({ type: 'Error', message: 'error creating scrim' });
      console.error(error);
    }
  };

  if (!isCurrentUserAdmin) {
    return <Redirect to="/" />;
  }

  if (isCreated) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <PageSection>
          <InnerColumn>
            <form
              onSubmit={handleSubmit}
              style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
              <Grid
                container
                direction="column"
                alignItems="center"
                justifyContent="center"
                spacing={4}>
                <Grid item sm={12}>
                  <Grid item>
                    <FormHelperText className="text-white">
                      Scrim Title {`(example: ${currentUser?.name}'s Scrim)`}
                    </FormHelperText>
                  </Grid>
                  <TextField
                    onChange={handleChange}
                    required
                    name="title"
                    placeholder="Scrim title"
                    value={scrimData.title}
                  />
                </Grid>

                <Grid
                  item
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}>
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
                        new Date(dateData.gameStartDate).toISOString()
                      ).format('yyyy-MM-DD')}
                    />
                  </Grid>
                  <Box marginRight={2} />
                  <Grid item>
                    <FormHelperText className="text-white">
                      Game Start Time
                    </FormHelperText>

                    <TextField
                      onChange={handleChange}
                      required
                      type="time"
                      name="gameStartHours"
                      value={
                        moment(scrimData?.gameStartTime).format('HH:mm') ||
                        moment().format('HH:mm')
                      }
                    />
                  </Grid>
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
                      value={scrimData.lobbyHost}>
                      {[currentUser, 'random'].map((value, key) => (
                        <MenuItem value={value} key={key}>
                          {value === currentUser
                            ? 'I will host the lobby'
                            : 'Choose a random player from the teams to host'}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText className="text-white">
                      Lobby host
                    </FormHelperText>
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
