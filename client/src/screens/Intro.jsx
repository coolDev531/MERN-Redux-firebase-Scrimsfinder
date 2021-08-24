import { useEffect, useCallback } from 'react';
import { useState, useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { Redirect } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import { Grid } from '@material-ui/core';

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
    Object.entries(userData).map(([k, v]) =>
      v === ''
        ? !errors.has(k) &&
          setErrors((prevState) => new Map(prevState.set(k, `${k} is empty!`)))
        : errors.has(k) &&
          setErrors((prevState) => {
            let newState = new Map(prevState);
            newState.delete(k);
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

  const nameForm = (
    <Grid item container justify="space-evenly">
      <TextField
        type="text"
        name="name"
        value={userData.name}
        onChange={(e) => handleChange(e, setUserData)}
        onKeyPress={(e) => {
          // if user enters special characters don't do anything
          if (!/^\w+$/.test(e.key)) e.preventDefault();
        }}
        placeholder="summoner name"
        required
      />
      <TextField
        type="text"
        name="discord"
        value={userData.discord}
        onChange={(e) => handleChange(e, setUserData)}
        placeholder="Discord (name and #)"
        required
      />
    </Grid>
  );

  const divisionForm = (
    <>
      <label htmlFor="rankDivision">Rank</label>
      <select
        name="rankDivision"
        required
        value={rankData.rankDivision}
        onChange={(e) => handleChange(e, setRankData)}>
        {[
          'Unranked',
          'Iron',
          'Bronze',
          'Silver',
          'Gold',
          'Platinum',
          'Diamond',
          'Master',
          'Grandmaster',
          'Challenger',
        ].map((value) => (
          <option value={value}>{value}</option>
        ))}
      </select>

      {/* exclude this number select from divisions without numbers */}
      {divisionsWithNumbers.includes(rankData.rankDivision) && (
        <select
          name="rankNumber"
          required={divisionsWithNumbers.includes(rankData.rankDivision)}
          value={rankData.rankNumber}
          onChange={(e) => handleChange(e, setRankData)}>
          <option selected disabled>
            select rank number
          </option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>
      )}
    </>
  );

  const regionForm = (
    <>
      <label htmlFor="region">Region</label>
      <select
        name="region"
        value={userData.region}
        onChange={(e) => handleChange(e, setUserData)}
        required>
        {['NA', 'EUW', 'EUNE', 'LAN'].map((region) => (
          <option value={region}>{region}</option>
        ))}
      </select>
    </>
  );

  let forms = [nameForm, divisionForm, regionForm];

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
          {forms[currentFormIndex]}

          {currentFormIndex === forms.length - 1 ? (
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
