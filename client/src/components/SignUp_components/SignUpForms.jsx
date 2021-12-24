import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function SignUpForms({
  handleChange,
  currentFormIndex,
  userData,
  setUserData,
  rankData,
  setRankData,
  divisionsWithNumbers,
}) {
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const nameDiscordAndRegionForm = (
    <Grid
      container
      direction={matchesSm ? 'column' : 'row'}
      alignItems="center">
      <Grid item sm={3}>
        <TextField
          variant="standard"
          type="text"
          name="name"
          value={userData.name}
          onChange={(e) => handleChange(e, setUserData)}
          onKeyPress={(e) => {
            // if user enters special characters don't do anything, allow spaces
            if (!/^[0-9a-zA-Z \b]+$/.test(e.key)) e.preventDefault();
          }}
          label="Summoner Name"
          helperText="required"
          required
        />
      </Grid>

      <Grid item sm={2} mb={'2%'}>
        <FormHelperText>Region</FormHelperText>

        <Select
          variant="standard"
          name="region"
          value={userData.region}
          label="region"
          onChange={(e) => handleChange(e, setUserData)}
          required>
          <MenuItem selected disabled>
            select region
          </MenuItem>
          {/* these regions should really just be in a constants file */}
          {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map((region, key) => (
            <MenuItem value={region} key={key}>
              {region}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid item sm={4}>
        <TextField
          variant="standard"
          type="text"
          name="discord"
          value={userData.discord}
          onChange={(e) => handleChange(e, setUserData)}
          label="Discord (name and #)"
          helperText="required"
          required
        />
      </Grid>
    </Grid>
  );

  const rankForm = (
    <Grid item container alignItems="center" spacing={4}>
      <Grid item>
        <FormHelperText>Rank Division</FormHelperText>
        <Select
          variant="standard"
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
          ].map((value, key) => (
            <MenuItem value={value} key={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      {/* exclude this number select from divisions without numbers */}
      {divisionsWithNumbers.includes(rankData.rankDivision) && (
        <Grid item>
          <FormHelperText>Rank Number</FormHelperText>
          <Select
            variant="standard"
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

  const verificationForm = (
    <Grid item sm={12}>
      <Box>
        <Typography variant="h1">Account details:</Typography>
      </Box>

      {Object.entries(userData).map(
        ([k, v], idx) =>
          k !== 'canSendEmailsToUser' && (
            <Box key={idx}>
              <Typography variant="h3">
                {k.charAt(0).toUpperCase() + k.substring(1)}: {v}
              </Typography>
            </Box>
          )
      )}

      <Box mt={-1} mb={1}>
        <FormControlLabel
          control={
            <Checkbox
              onChange={() =>
                setUserData((prevState) => ({
                  ...prevState,
                  canSendEmailsToUser: !userData.canSendEmailsToUser,
                }))
              }
              checked={userData.canSendEmailsToUser}
            />
          }
          label="Send me emails regarding app updates and/or notifications"
        />
      </Box>

      <Box>
        <Typography variant="body2">
          If you're sure you want to sign up with these details, click create my
          account with google.
        </Typography>
      </Box>
    </Grid>
  );

  let forms = [nameDiscordAndRegionForm, rankForm, verificationForm];

  return (
    <Grid
      mt={4}
      ml={2}
      container
      justifyContent="flex-start"
      direction={matchesSm ? 'column' : 'row'}
      alignItems="center"
      style={{ padding: '20px 0' }}>
      {forms[currentFormIndex]}
    </Grid>
  );
}
