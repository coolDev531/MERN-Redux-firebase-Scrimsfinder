import { useState, useEffect } from 'react';
import { useScrimsActions } from './../hooks/useScrims';
import useAlerts from './../hooks/useAlerts';
import useAuth from './../hooks/useAuth';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from './../components/shared/Tooltip';
import { Redirect } from 'react-router-dom';
import {
  InnerColumn,
  PageContent,
  PageSection,
} from './../components/shared/PageComponents';
import Loading from '../components/shared/Loading';

// utils and services
import { createScrim } from '../services/scrims.services';
import moment from 'moment';
import 'moment-timezone';
import devLog from './../utils/devLog';

export default function ScrimCreate() {
  const { fetchScrims } = useScrimsActions();
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const [scrimData, setScrimData] = useState({
    gameStartTime: new Date().toISOString(),
    lobbyHost: 'random',
    region: currentUser?.region,
    createdBy: currentUser,
    title: '',
    isPrivate: false,
  });

  const [dateData, setDateData] = useState({
    gameStartDate: new Date(),
    gameStartHours: [new Date().getHours().toString(), new Date().getMinutes()],
  });

  const [createdScrim, setCreatedScrim] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    return () => {
      setScrimData((prevState) => ({
        ...prevState,
        gameStartTime: createdScrim?.createdScrim?.gameStartTime,
      }));
    };
  }, [dateData, createdScrim]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataSending = {
        ...scrimData,
        adminKey: currentUser?.adminKey ?? '', // to verify if is admin (authorize creation).
        lobbyHost: scrimData.lobbyHost === 'random' ? null : currentUser._id,
      };

      const newlyCreatedScrim = await createScrim(dataSending, setCurrentAlert);

      await fetchScrims();

      devLog('created new scrim!', newlyCreatedScrim);
      setCreatedScrim(newlyCreatedScrim);

      if (newlyCreatedScrim.isPrivate) {
        setCurrentAlert({
          type: 'Success',
          message:
            'Private scrim created, only users with the share link can access it',
        });
      } else {
        setCurrentAlert({
          type: 'Success',
          message: 'scrim created successfully!',
        });
      }
      setIsSubmitting(false);
    } catch (error) {
      const errorMsg = error?.response?.data?.error ?? 'error creating scrim';
      setCurrentAlert({ type: 'Error', message: errorMsg });
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!isCurrentUserAdmin) {
    return <Redirect to="/" />;
  }

  if (createdScrim) {
    return (
      <Redirect
        to={
          // if private push to scrim detail, else push to home
          createdScrim?.isPrivate ? `/scrims/${createdScrim?._id}` : '/scrims'
        }
      />
    );
  }

  if (isSubmitting) {
    return <Loading text="Creating new scrim..." />;
  }

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <PageSection>
          <InnerColumn>
            <Grid
              onSubmit={handleSubmit}
              style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              component="form"
              spacing={4}>
              <Grid
                item
                container
                sm={12}
                justifyContent="center"
                alignItems="center"
                direction="row"
                spacing={2}>
                <Grid item>
                  <FormHelperText className="text-white">
                    Scrim Title {`(example: ${currentUser?.name}'s Scrim)`}
                  </FormHelperText>
                  <TextField
                    variant="standard"
                    onChange={handleChange}
                    required
                    name="title"
                    placeholder="Scrim title"
                    value={scrimData.title}
                  />
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
                    variant="standard"
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
                    variant="standard"
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
                    variant="standard"
                    label="region"
                    name="region"
                    value={scrimData.region}
                    className="text-white"
                    onChange={handleChange}
                    fullWidth>
                    {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map((region, key) => (
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
                    name="lobbyHost"
                    onChange={(e) =>
                      setScrimData((prevState) => ({
                        ...prevState,
                        lobbyHost: e.target.value,
                      }))
                    }
                    value={scrimData.lobbyHost}>
                    {['random', currentUser?._id].map((value, key) => (
                      <MenuItem value={value} key={key}>
                        {value === currentUser._id
                          ? 'I will host the lobby'
                          : 'Random host!'}
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
          </InnerColumn>
        </PageSection>
      </PageContent>
    </>
  );
}
