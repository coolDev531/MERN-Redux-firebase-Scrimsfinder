import { useEffect } from 'react';
import { useState } from 'react';

export default function Intro() {
  const [userData, setUserData] = useState({
    name: '',
    rank: '',
    region: '',
  });

  const [rankData, setRankData] = useState({
    rankDivision: '',
    rankNumber: 0,
  });

  const handleChange = ({ target }, setter) => {
    const { name, value } = target;

    setter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    setUserData((prevState) => ({
      ...prevState,
      rank: [
        rankData?.rankDivision ?? '',
        rankData?.rankNumber?.toString() ?? '',
      ].join(' '),
    }));
  }, [rankData]);

  useEffect(() => {
    console.log({ userData, rankData });
  }, [userData, rankData]);

  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
  ];

  return (
    <div>
      <h1>Welcome to LoL scrim finder, please fill in your details:</h1>

      <form>
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={(e) => handleChange(e, setUserData)}
          placeholder="summoner name"
        />
        <label htmlFor="rankDivision">Rank Division</label>
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
            required
            value={rankData.rankNumber}
            onChange={(e) => handleChange(e, setRankData)}>
            <option selected disabled hidden>
              select rank number
            </option>
            <option value={4}>4</option>
            <option value={3}>3</option>
            <option value={2}>2</option>
            <option value={1}>1</option>
          </select>
        )}
      </form>
      <p>*ALPHA STAGE: all games are considered NA games*</p>
    </div>
  );
}
