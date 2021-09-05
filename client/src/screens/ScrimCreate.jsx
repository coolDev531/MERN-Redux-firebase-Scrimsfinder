import { useState, useEffect, useContext } from 'react';
import Navbar from './../components/shared/Navbar';
import {
  Grid,
  TextField,
  Box,
  MenuItem,
  FormHelperText,
  Button,
} from '@material-ui/core';
import { Redirect } from 'react-router';
import moment from 'moment';
import 'moment-timezone';
import { createScrim } from './../services/scrims';
import { CurrentUserContext } from '../context/currentUser';
import { Select } from '@material-ui/core';
import { ScrimsContext } from '../context/scrimsContext';
import { getMinutes } from './../utils/getMinutes';

export default function ScrimCreate() {
  const { toggleFetch } = useContext(ScrimsContext);
  const { currentUser } = useContext(CurrentUserContext);
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

    const scrimToCreate = {
      ...scrimData,
      lobbyHost: scrimData.lobbyHost === 'random' ? null : currentUser,
    };

    const createdScrim = await createScrim(scrimToCreate);

    toggleFetch((prevState) => !prevState);

    setCreated({ createdScrim });
  };

  if (process.env.REACT_APP_ADMIN_KEY !== currentUser?.adminKey) {
    return <Redirect to="/" />;
  }

  if (isCreated) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page-section create-scrim">
          <div className="inner-column">
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
          </div>
        </section>
      </main>
    </>
  );
}
