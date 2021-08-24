import { useEffect, useCallback } from 'react';
import { useState, useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { Redirect } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import { Grid } from '@material-ui/core';
import IntroForms from '../components/IntroForms';

const KEYCODES = {
  ENTER: 13,
  BACKSPACE: 8,
};

export default function Intro() {
  const [userData, setUserData] = useState({
    name: '',
    rank: '',
    region: 'NA',
    discord: '',
  });
  const [rankData, setRankData] = useState({
    rankDivision: 'Iron',
    rankNumber: '4',
  });
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [errors, setErrors] = useState(new Map()); // using a map to keep unique errors.

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
      if (currentFormIndex === 2) return; // if final step, stop.

      if (document.querySelector('#form').checkValidity()) {
        setCurrentFormIndex((prevState) => (prevState += 1));
        setErrors(new Map());
      } else {
        // if the input value is empty, add it in the Map as an error.
        // else: if the input value isn't empty and it was already in the map previously (already was an error): remove it from the map.
        handleErrors();
      }
    },
    [currentFormIndex, handleErrors]
  );

  const goPreviousStep = useCallback(
    (e) => {
      e.preventDefault();
      if (currentFormIndex === 0) return;
      setCurrentFormIndex((prevState) => (prevState -= 1));
    },
    [currentFormIndex]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      let yes = window.confirm(`Are you sure you want to create this account? \n
      Name: ${userData.name} \n
      Discord: ${userData.discord} \n
      Rank: ${userData.rank} \n
      Region: ${userData.region}
      `);

      if (!yes) return;

      console.log(
        '%c user created with the name: ' + userData.name,
        'color: lightgreen'
      );
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);

      return;
    },
    [setCurrentUser, userData]
  );

  useEffect(() => {
    const handleKeyUp = (e) => {
      switch (e.keyCode) {
        case KEYCODES.ENTER:
          if (currentFormIndex === 2) return handleSubmit(e);
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
  }, [goNextStep, currentFormIndex, handleSubmit, goPreviousStep]);

  if (currentUser) {
    console.log('redirecting to /');
    return <Redirect to="/" />;
  }

  return (
    <div className="page-section">
      <div className="inner-column">
        <h1>Welcome to LoL scrim finder, please fill in your details:</h1>

        <Grid container direction="column" md={12}>
          {[...errors.values()].map((error) => (
            <>
              <Alert severity="error">
                Please correct the following error — <strong>{error}</strong>
              </Alert>
              <br />
            </>
          ))}
        </Grid>

        <form onSubmit={handleSubmit} id="form">
          <h2>Step {currentFormIndex + 1}</h2>

          <IntroForms
            handleChange={handleChange}
            currentFormIndex={currentFormIndex}
            userData={userData}
            setUserData={setUserData}
            rankData={rankData}
            setRankData={setRankData}
            divisionsWithNumbers={divisionsWithNumbers}
          />

          {currentFormIndex === 2 ? (
            <>
              <button type="submit">Create my account</button>
              <button onClick={goPreviousStep}>Previous</button>
            </>
          ) : (
            <>
              <button
                disabled={currentFormIndex === 0}
                onClick={goPreviousStep}>
                Previous
              </button>
              <button onClick={goNextStep}>Next</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
