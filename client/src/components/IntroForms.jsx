import { FormHelperText, useMediaQuery, useTheme } from '@material-ui/core';
import { Select } from '@material-ui/core';
import { MenuItem } from '@material-ui/core';
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
      <Grid item sm={4}>
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
      <Grid item sm={4}>
        <TextField
          type="text"
          name="adminKey"
          value={userData.adminKey}
          onChange={(e) => handleChange(e, setUserData)}
          label="Admin key (not required)"
          helperText="You'll need an admin key to create scrims/lobbies."
        />
      </Grid>
    </>
  );

  const divisionForm = (
    <Grid item container alignItems="center" spacing={4}>
      <Grid item>
        <FormHelperText>Rank Division</FormHelperText>
        <Select
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
            <MenuItem value={value}>{value}</MenuItem>
          ))}
        </Select>
      </Grid>
      {/* exclude this number select from divisions without numbers */}
      {divisionsWithNumbers.includes(rankData.rankDivision) && (
        <Grid item>
          <FormHelperText>Rank Number</FormHelperText>
          <Select
            name="rankNumber"
            required={divisionsWithNumbers.includes(rankData.rankDivision)}
            value={rankData.rankNumber}
            onChange={(e) => handleChange(e, setRankData)}>
            <MenuItem selected disabled>
              select rank number
            </MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={1}>1</MenuItem>
          </Select>
        </Grid>
      )}
    </Grid>
  );

  const regionForm = (
    <Grid item sm={12}>
      <FormHelperText>Region</FormHelperText>
      <Select
        name="region"
        value={userData.region}
        onChange={(e) => handleChange(e, setUserData)}
        required>
        <MenuItem selected disabled>
          select region
        </MenuItem>
        {['NA', 'EUW', 'EUNE', 'LAN'].map((region) => (
          <MenuItem value={region}>{region}</MenuItem>
        ))}
      </Select>
    </Grid>
  );

  let forms = [nameForm, divisionForm, regionForm];

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid
      container
      justify="flex-start"
      direction={matchesSm ? 'column' : 'row'}
      alignItems="center"
      style={{ padding: '20px 0' }}>
      {forms[currentFormIndex]}
    </Grid>
  );
}
