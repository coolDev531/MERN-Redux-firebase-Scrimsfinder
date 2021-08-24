import { TextField } from '@material-ui/core';
import { Grid } from '@material-ui/core';

export default function IntroForms({
  handleChange,
  currentFormIndex,
  userData,
  setUserData,
  rankData,
  setRankData,
  divisionsWithNumbers,
}) {
  const nameForm = (
    <>
      <Grid item sm={3}>
        <TextField
          type="text"
          name="name"
          value={userData.name}
          onChange={(e) => handleChange(e, setUserData)}
          onKeyPress={(e) => {
            // if user enters special characters don't do anything
            if (!/^\w+$/.test(e.key)) e.preventDefault();
          }}
          label="Summoner Name"
          helperText="required"
          required
        />
      </Grid>
      <Grid item sm={4}>
        <TextField
          type="text"
          name="discord"
          value={userData.discord}
          onChange={(e) => handleChange(e, setUserData)}
          label="Discord (name and #)"
          helperText="required"
          required
        />
      </Grid>
    </>
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

  return (
    <Grid
      container
      justify="flex-start"
      direction="row"
      alignItems="center"
      style={{ padding: '20px 0' }}>
      {forms[currentFormIndex]}
    </Grid>
  );
}
