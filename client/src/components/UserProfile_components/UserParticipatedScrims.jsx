import { useState, useMemo } from 'react';
import { useProfileStyles } from './../../styles/UserProfile.styles';

// utils
import {
  showEarliestFirst,
  showLatestFirst,
} from './../../utils/getSortedScrims';

// components
import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '../shared/Tooltip';
import Moment from 'react-moment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

export default function UserParticipatedScrims({ scrims, userName }) {
  const [sortType, setSortType] = useState('date-descending');

  const classes = useProfileStyles();

  const sortedUserScrims = useMemo(() => {
    switch (sortType) {
      case 'date-descending':
        return showLatestFirst(scrims);
      case 'date-ascending':
        return showEarliestFirst(scrims);
      default:
        return scrims;
    }
  }, [scrims, sortType]);

  if (!scrims.length) return null;

  return (
    <>
      <SectionDivider />

      <Grid
        container
        alignItems="center"
        flexWrap="nowrap"
        justifyContent="space-between"
        direction="row"
        marginTop={2}>
        <Grid item>
          <Tooltip
            title={`Scrims that ${userName} has been a part of (caster or player)`}>
            <Typography style={{ cursor: 'help' }} variant="h1">
              Scrims Participated In
            </Typography>
          </Tooltip>
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
      </Grid>
      <ul className={classes.myCreatedScrimsList}>
        {sortedUserScrims.map((scrim) => (
          <li key={scrim._id}>
            <Tooltip title="Open in new tab">
              <Link className="link" to={`/scrims/${scrim._id}`}>
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

const SectionDivider = () => (
  <>
    <div style={{ display: 'flex', flexGrow: 1, padding: '10px' }} />
    <Divider />
  </>
);
