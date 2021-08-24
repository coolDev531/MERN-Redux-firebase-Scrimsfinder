import { useEffect, useCallback } from 'react';
import { useState, useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { Redirect } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';

const KEYCODES = {
  ENTER: 13,
  BACKSPACE: 8,
};

export default function Intro() {
  const [userData, setUserData] = useState({
    name: '',
    rank: '',
    region: 'NA',
  });
  const [rankData, setRankData] = useState({
    rankDivision: 'Iron',
    rankNumber: '4',
  });
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [error, setError] = useState(false);

  const handleChange = ({ target }, setter) => {
    const { name, value } = target;

    setter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
  ];

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
        setError(false);
      } else {
        const key =
          Object.keys(userData)[currentFormIndex] === 'name'
            ? 'summoner name'
            : Object.keys(userData)[currentFormIndex];

        setError(`${key} is empty!`);
      }
    },
    [currentFormIndex, userData]
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
    const handleEnterKey = (e) => {
      if (e.keyCode === KEYCODES.ENTER) {
        return currentFormIndex < 2 ? goNextStep(e) : handleSubmit(e);
      }

      // if pressing backspace but even.target doesn't have a name (a.k.a isn't backspacing an input)
      if (e.keyCode === KEYCODES.BACKSPACE && !e.target.name) {
        goPreviousStep(e);
      }
    };

    document.addEventListener('keyup', handleEnterKey);

    return () => {
      document.removeEventListener('keyup', handleEnterKey);
    };
  }, [goNextStep, currentFormIndex, handleSubmit, goPreviousStep]);

  const nameForm = (
    <TextField
      type="text"
      name="name"
      value={userData.name}
      onChange={(e) => handleChange(e, setUserData)}
      placeholder="summoner name"
      required
    />
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
    <div>
      <h1>Welcome to LoL scrim finder, please fill in your details:</h1>

      {error && (
        <Alert severity="error">
          Please correct the following error — <strong>{error}</strong>
        </Alert>
      )}
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
            <button disabled={currentFormIndex === 0} onClick={goPreviousStep}>
              Previous
            </button>
            <button onClick={goNextStep}>Next</button>
          </>
        )}
      </form>
    </div>
  );
}
