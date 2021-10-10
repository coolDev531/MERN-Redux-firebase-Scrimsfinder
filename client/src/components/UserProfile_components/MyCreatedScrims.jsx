import { useState, useMemo } from 'react';
import useToggle from '../../hooks/useToggle';
import { useProfileStyles } from '../../styles/UserProfile.styles';

// components
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '../shared/Tooltip';
import Moment from 'react-moment';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

// utils
import {
  showEarliestFirst,
  showLatestFirst,
} from '../../utils/getSortedScrims';

export default function MyCreatedScrims({ isCurrentUser, scrims }) {
  const [filterPrivate, togglePrivate] = useToggle(false);
  const [sortType, setSortType] = useState('date-descending');

  const classes = useProfileStyles();

  const sortedCreatedScrims = useMemo(() => {
    switch (sortType) {
      case 'date-descending':
        return showLatestFirst(scrims);
      case 'date-ascending':
        return showEarliestFirst(scrims);
      default:
        return scrims;
    }
  }, [scrims, sortType]);

  if (!isCurrentUser) return null;
  if (!scrims.length) return null;

  return (
    <>
      <SectionSeparator />

      <Grid
        container
        alignItems="center"
        flexWrap="nowrap"
        justifyContent="space-between"
        direction="row"
        marginTop={2}>
        <Grid item>
          <Typography variant="h1">My Created Scrims</Typography>
        </Grid>
        <Grid item>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Sort Scrims</InputLabel>
              <Select
                value={sortType.toString()}
                label="Sort"
                onChange={(e) => {
                  setSortType(e.target.value);
                }}>
                <MenuItem value="date-ascending">Date Ascending</MenuItem>
                <MenuItem value="date-descending">Date Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filterPrivate}
                onChange={togglePrivate}
                name="togglePrivate"
              />
            }
            label="Only show private scrims"
            labelPlacement="bottom"
          />
        </Grid>
      </Grid>
      <ul className={classes.myCreatedScrimsList}>
        {sortedCreatedScrims
          // if filterPrivate is false, just return scrim as is, else filter by scrims that are private
          .filter((scrim) => (!filterPrivate ? scrim : scrim.isPrivate))
          .map((scrim) => (
            <li key={scrim._id}>
              <Tooltip title="Open in new tab">
                <Link
                  className="link"
                  to={`/scrims/${scrim._id}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  {scrim.title} |&nbsp;
                  <Moment format="MM/DD/yyyy hh:mm A">
                    {scrim.gameStartTime}
                  </Moment>
                  &nbsp;| {scrim.region}&nbsp;
                  {scrim?.isPrivate ? '(Private)' : ''}
                </Link>
              </Tooltip>
            </li>
          ))}
      </ul>
    </>
  );
}

const SectionSeparator = () => (
  <>
    <div style={{ display: 'flex', flexGrow: 1, padding: '10px' }} />
    <Divider />
  </>
);
