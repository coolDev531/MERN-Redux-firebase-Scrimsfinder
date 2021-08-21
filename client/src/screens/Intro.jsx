import { useEffect } from 'react';
import { useState, useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { Redirect } from 'react-router-dom';

export default function Intro() {
  const [userData, setUserData] = useState({
    name: '',
    rank: '',
    region: '',
  });
  const [rankData, setRankData] = useState({
    rankDivision: 'Iron',
    rankNumber: '4',
  });
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);

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
    let rankResult = [rankData?.rankDivision ?? '', rankData?.rankNumber].join(
      ' '
    );

    rankResult =
      rankResult[rankResult.length - 1] === ' '
        ? rankResult.slice(-1)
        : rankResult;

    console.log({ rankResult });
    setUserData((prevState) => ({
      ...prevState,
      rank:
        divisionsWithNumbers.includes(rankData.rankDivision) &&
        rankData?.rankNumber !== '0'
          ? rankResult
          : rankData.rankDivision,
    }));

    // eslint-disable-next-line
  }, [rankData]);

  useEffect(() => {
    console.log({ userData, rankData });
  }, [userData, rankData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('submited!');
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  if (currentUser) {
    console.log('redirecting to /');
    return <Redirect to="/" />;
  }

  return (
    <div>
      <h1>Welcome to LoL scrim finder, please fill in your details:</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={(e) => handleChange(e, setUserData)}
          placeholder="summoner name"
          required
        />
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

        <label htmlFor="region">Region</label>
        <select
          name="region"
          value={userData.region}
          onChange={(e) => handleChange(e, setUserData)}
          required>
          <option selected disabled hidden>
            Select Region
          </option>
          {['NA', 'EUW', 'EUNE', 'LAN'].map((region) => (
            <option value={region}>{region}</option>
          ))}
        </select>
        <button type="submit">Submit</button>
      </form>
      <p>
        *ALPHA STAGE: all currently games will be considered NA games, but
        please pick your region for next updates.*
      </p>
    </div>
  );
}
