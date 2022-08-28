// components
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

const divisionsWithNumbers = [
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
];

export default function UserRankFields({ rankData, setRankData }) {
  if (!rankData) return null;

  return (
    <Grid
      item
      container
      alignItems="center"
      spacing={4}
      justifyContent="center">
      <Grid item>
        <FormHelperText>Rank Division</FormHelperText>
        <Select
          variant="standard"
          name="rankDivision"
          required
          value={rankData.rankDivision}
          onChange={(e) =>
            setRankData((prevState) => ({
              ...prevState,
              [e.target.name]: e.target.value,
            }))
          }>
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
            value={rankData.rankNumber || '4'}
            onChange={(e) =>
              setRankData((prevState) => ({
                ...prevState,
                [e.target.name]: e.target.value,
              }))
            }>
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
}
