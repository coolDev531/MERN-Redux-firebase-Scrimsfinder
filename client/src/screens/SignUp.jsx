import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import useAlerts from '../hooks/useAlerts';
import useAuth, { useAuthActions } from '../hooks/useAuth';

// components
import { Redirect } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Navbar from '../components/shared/Navbar/Navbar';
import {
  InnerColumn,
  PageSection,
  PageContent,
} from '../components/shared/PageComponents';
import SignUpForms from '../components/SignUp_components/SignUpForms';

// utils
import { auth, provider } from '../firebase';
import { KEYCODES } from '../utils/keycodes';

// services
import { registerUser } from '../services/auth.services';

function getSteps() {
  return [
    'Summoner Name, region and Discord',
    'Rank division and / or number',
    'Verification and sign-up',
  ];
}

// the page where users sign up.
export default function SignUp() {
  const { currentUser } = useAuth();
  const { setCurrentUser } = useAuthActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    rank: '',
    region: 'NA',
    discord: '',
    canSendEmailsToUser: false,
  });
  const [rankData, setRankData] = useState({
    rankDivision: 'Iron',
    rankNumber: '4',
  });
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const { setCurrentAlert } = useAlerts();
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
    Object.entries(userData).map(([key, value]) =>
      // if value is empty and errors DON'T already have the key, add it to the errors map state.
      value === ''
        ? !errors.has(key) &&
          setErrors(
            (prevState) => new Map(prevState.set(key, `${key} is empty!`))
          )
        : errors.has(key) &&
          /* else if the text input value isn't empty and the key exists (ex: input.name) in the errors map, 
            remove it from the errors map, therefore removing the alert from the page */
          setErrors((prevState) => {
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
          canSendEmailsToUser: userData.canSendEmailsToUser,
          rank: userData.rank,
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
      try {
        if (isSubmitting) return;
        setIsSubmitting(true);

        e.preventDefault();

        let userCredentials = await createGoogleAccount(); // google pop up verify acc

        if (userCredentials) {
          // HANDLE SIGN UP.
          let createdUser = await registerUser(
            userCredentials,
            setCurrentAlert
          );
          if (createdUser) {
            setCurrentUser(createdUser);

            setCurrentAlert({
              type: 'Success',
              message: 'Account created successfully, welcome!',
            });
            return createdUser;
          }
        }
      } catch (err) {
      } finally {
        setIsSubmitting(false);
      }
    },
    [createGoogleAccount, setCurrentUser, setCurrentAlert, isSubmitting]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    goNextStep,
    currentFormIndex,
    handleSubmit,
    goPreviousStep,
    steps.length,
  ]);

  let isLastStep = useMemo(
    () => currentFormIndex === steps.length - 1,
    [currentFormIndex, steps.length]
  );

  if (currentUser) {
    console.log('Already logged in!, redirecting to /');
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <PageSection>
          <InnerColumn>
            <Typography variant="h1">
              Welcome to Bootcamp LoL Scrim Gym, please fill in your details
            </Typography>

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

                return (
                  <Step key={index} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            <form onSubmit={handleSubmit} id="form">
              <SignUpForms
                handleChange={handleChange}
                currentFormIndex={currentFormIndex}
                userData={userData}
                setUserData={setUserData}
                rankData={rankData}
                setRankData={setRankData}
                divisionsWithNumbers={divisionsWithNumbers}
              />
              <div className="page-break" />

              <Grid container item spacing={2} ml={0}>
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
                    disabled={isSubmitting}
                    onClick={(e) => {
                      if (isLastStep) {
                        return handleSubmit(e);
                      }

                      return goNextStep(e);
                    }}
                    variant="contained"
                    color="primary"
                    type="submit">
                    {isLastStep ? 'Create my account with google' : 'Next'}
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
