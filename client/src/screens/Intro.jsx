import { useEffect, useCallback } from 'react';
import { useState, useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { Redirect } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import { Button, Grid, Typography } from '@material-ui/core';
import IntroForms from '../components/IntroForms';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { auth, provider } from '../firebase';
import Navbar from './../components/shared/Navbar';
import { createUser } from './../services/users';

const KEYCODES = {
  ENTER: 13,
  BACKSPACE: 8,
};

function getSteps() {
  return [
    'Summoner Name and Discord',
    'Rank division and number',
    'Region and sign up with google',
  ];
}

export default function Intro() {
  const [userData, setUserData] = useState({
    name: '',
    rank: '',
    region: 'NA',
    discord: '',
    // need to be admin to create scrims
    adminKey: '',
  });
  const [rankData, setRankData] = useState({
    rankDivision: 'Iron',
    rankNumber: '4',
  });
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [errors, setErrors] = useState(new Map()); // using a map to keep unique errors.

  const steps = getSteps();

  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
  ];

  const handleErrors = useCallback(() => {
    /* if the text input value is empty and the errors map doesn't have it as a key:
    add it as a key and it's value as the message to the error map */
    Object.entries(userData)
      // don't throw errors for adminKey
      .filter(([k]) => k !== 'adminKey')
      .map(([key, value]) =>
        value === ''
          ? !errors.has(key) &&
            setErrors(
              (prevState) => new Map(prevState.set(key, `${key} is empty!`))
            )
          : errors.has(key) &&
            setErrors((prevState) => {
              /* else if the text input value isn't empty and the key exists (input.name) in the errors map, 
              remove it from the errors map */
              let newState = new Map(prevState);
              newState.delete(key);
              return newState;
            })
      );
  }, [errors, userData]);

  const handleChange = ({ target }, setter) => {
    const { name, value } = target;

    setter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const { rankNumber, rankDivision } = rankData;
    let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

    let rankResult = isDivisionWithNumber
      ? `${rankDivision} ${rankNumber}`
      : rankDivision;
    // doing this because number and division are separate selects.
    setUserData((prevState) => ({
      ...prevState,
      rank: rankResult,
    }));
    // eslint-disable-next-line
  }, [rankData]);

  const goNextStep = useCallback(
    (e) => {
      e.preventDefault();
      if (currentFormIndex === steps.length - 1) return; // if final step, stop.

      if (document.querySelector('#form').checkValidity()) {
        setCurrentFormIndex((prevState) => (prevState += 1));
        setErrors(new Map());
      } else {
        // if the input value is empty, add it in the Map as an error.
        // else: if the input value isn't empty and it was already in the map previously (already was an error): remove it from the map.
        handleErrors();
      }
    },
    [currentFormIndex, handleErrors, steps.length]
  );

  const goPreviousStep = useCallback(
    (e) => {
      e.preventDefault();
      if (currentFormIndex === 0) return;
      setCurrentFormIndex((prevState) => (prevState -= 1));
    },
    [currentFormIndex]
  );

  const createGoogleAccount = useCallback(async () => {
    try {
      const result = await auth.signInWithPopup(provider);
      if (result.user) {
        let newUser = {
          uid: result.user.uid, // google id
          name: userData.name,
          region: userData.region,
          discord: userData.discord,
          rank: userData.rank,
          adminKey: userData.adminKey?.trim() ?? '',
          email: result.user.email,
        };

        let yes =
          window.confirm(`Are you sure you want to create this account? \n
      Summoner Name: ${userData.name} \n
      Discord: ${userData.discord} \n
      Rank: ${userData.rank} \n
      Region: ${userData.region} \n
      Email: ${newUser.email} 
      `);

        if (!yes) return;

        let createdUser = await createUser(newUser);

        if (createdUser) {
          return createdUser;
        } else {
          console.error('Error creating user.');
          return false;
        }
      }
    } catch (error) {
      console.error({ error });
      return false;
    }
  }, [userData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        let createdUser = await createGoogleAccount();

        if (createdUser) {
          setCurrentUser(createdUser);

          console.log(
            '%cuser created with the summoner name: ' + userData.name,
            'color: lightgreen'
          );

          localStorage.setItem('currentUser', JSON.stringify(createdUser));
        }
      } catch (error) {
        return;
      }
      return;
    },
    [createGoogleAccount, setCurrentUser, userData.name]
  );

  useEffect(() => {
    const handleKeyUp = (e) => {
      switch (e.keyCode) {
        case KEYCODES.ENTER:
          // if is last step, submit.
          if (currentFormIndex === steps.length - 1) return handleSubmit(e);
          return goNextStep(e);
        case KEYCODES.BACKSPACE:
          // if pressing backspace but even.target doesn't have a name (a.k.a user isn't backspacing while typing on an input)
          if (e.target.name) return;
          return goPreviousStep(e);
        default:
          break;
      }
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    goNextStep,
    currentFormIndex,
    handleSubmit,
    goPreviousStep,
    steps.length,
  ]);

  if (currentUser) {
    console.log('redirecting to /');
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="page-section">
          <div className="inner-column">
            <h1>Welcome to LoL scrim finder, please fill in your details</h1>

            <Grid container direction="column" md={12}>
              {[...errors.values()].map((error) => (
                <>
                  <Alert severity="error">
                    Please correct the following error —{' '}
                    <strong>{error}</strong>
                  </Alert>
                  <br />
                </>
              ))}
            </Grid>
            <Stepper activeStep={currentFormIndex}>
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};

                if (index === 0) {
                  labelProps.optional = (
                    <Typography variant="caption">
                      ( Admin key optional )
                    </Typography>
                  );
                }

                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            <form onSubmit={handleSubmit} id="form">
              <IntroForms
                handleChange={handleChange}
                currentFormIndex={currentFormIndex}
                userData={userData}
                setUserData={setUserData}
                rankData={rankData}
                setRankData={setRankData}
                divisionsWithNumbers={divisionsWithNumbers}
              />
              <div className="page-break" />
              {currentFormIndex === steps.length - 1 ? (
                <Grid container item spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={goPreviousStep}>
                      Previous
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      color="primary"
                      type="submit">
                      Create my account with google
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container item spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={currentFormIndex === 0}
                      onClick={goPreviousStep}>
                      Previous
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={goNextStep}>
                      Next
                    </Button>
                  </Grid>
                </Grid>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
