import { useState, useEffect, useCallback, Fragment } from 'react';

// components
import { Redirect } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import { Button, Grid, Typography } from '@material-ui/core';
import IntroForms from '../components/IntroForms';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Navbar from './../components/shared/Navbar';
import {
  InnerColumn,
  PageSection,
  PageContent,
} from '../components/shared/PageComponents';

// utils
import { auth, provider } from '../firebase';
import { useAuth } from './../context/currentUser';

// services
import { registerUser } from '../services/auth';

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

// the page where users sign up.
// can also be named Signup.
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
  const { currentUser } = useAuth();
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
      // don't throw errors for adminKey, it's not a required field.
      .filter(([k]) => k !== 'adminKey')
      .map(([key, value]) =>
        // if value is empty and errors DON'T already have the key, add it to the errors map state.
        value === ''
          ? !errors.has(key) &&
            setErrors(
              (prevState) => new Map(prevState.set(key, `${key} is empty!`))
            )
          : errors.has(key) &&
            // else if they do have the key, remove it from the errors map state.
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
          // refreshToken: result.user.refreshToken, // prob don't need.
        };

        return newUser;
      }
    } catch (error) {
      console.error({ error });
      return false;
    }
  }, [userData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      let newUser = await createGoogleAccount(); // google pop up verify acc

      if (newUser) {
        // has to confirm.
        // settimeout so google popup doesn't cover confirmation alert.
        // google popup closes by then.
        setTimeout(async () => {
          let yes =
            window.confirm(`Are you sure you want to create this account? \n
        Summoner Name: ${userData.name} \n
        Discord: ${userData.discord} \n
        Rank: ${userData.rank} \n
        Region: ${userData.region} \n
        Email: ${newUser.email} 
        `);

          if (!yes) return;

          // HANDLE SIGN UP.
          let decodedUser = await registerUser(newUser);

          return decodedUser;
        }, 200);
      }
    },
    [
      createGoogleAccount,
      userData.name,
      userData.discord,
      userData.rank,
      userData.region,
    ]
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
      <PageContent>
        <PageSection>
          <InnerColumn>
            <h1>Welcome to LoL Scrims Finder, please fill in your details</h1>

            <Grid container item direction="column" md={12}>
              {[...errors.values()].map((error, key) => (
                <Fragment key={key}>
                  <Alert severity="error">
                    Please correct the following error —{' '}
                    <strong>{error}</strong>
                  </Alert>
                  <br />
                </Fragment>
              ))}
            </Grid>
            <Stepper activeStep={currentFormIndex}>
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};

                if (index === 0) {
                  labelProps.optional = (
                    <Typography variant="caption" key={label}>
                      ( Admin key optional )
                    </Typography>
                  );
                }

                return (
                  <Step key={index} {...stepProps}>
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
          </InnerColumn>
        </PageSection>
      </PageContent>
    </>
  );
}
