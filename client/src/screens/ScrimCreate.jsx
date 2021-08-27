import Navbar from './../components/shared/Navbar';
import { Grid, TextField, Input, Box } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { Redirect } from 'react-router';
import moment from 'moment';
import 'moment-timezone';
import { createScrim } from './../services/scrims';

//  casters: { type: Array, default: [] },
//   gameStartTime: {
//     type: Date,
//     default: getThirtyMinFromNow(),
//     required: true,
//   },
//   lobbyHost: { type: Object, default: null },
//   lobbyPassword: { type: String, default: generatePassword() },
//   lobbyName: {
//     type: String,
//   },
//   region: { type: String, default: 'NA', required: true },
//   createdBy: { type: Object, required: true },

export default function ScrimCreate() {
  const [scrimData, setScrimData] = useState({
    gameStartTime: new Date().toISOString(),
    lobbyHost: null,
  });

  const [dateData, setDateData] = useState({
    gameStartDate: new Date(),
    gameStartHours: [
      new Date().getHours().toString(),
      new Date().getMinutes().toString(),
    ],
  });

  const [isCreated, setCreated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdScrim = await createScrim(scrimData);

    setCreated({ createdScrim });
  };

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

  if (isCreated) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navbar />
      <Grid container direction="column" justify="center" alignItems="center">
        <form onSubmit={handleSubmit}>
          <Grid item container direction="row" justify="space-evenly">
            <Grid item>
              <TextField
                onChange={handleChange}
                required
                type="date"
                name="gameStartDate"
                label="Game start date  "
                value={moment(dateData.gameStartDate).format('yyyy-MM-DD')}
              />
            </Grid>
            <Box marginRight={2} />
            <Grid item>
              <TextField
                onChange={handleChange}
                required
                label="Game start time"
                type="time"
                name="gameStartHours"
                value={moment(scrimData.gameStartTime).format('hh:mm A')}
              />
            </Grid>
          </Grid>
        </form>
      </Grid>
    </>
  );
}
