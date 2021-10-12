import { useState, useMemo } from 'react';
import { useProfileStyles } from './../../styles/UserProfile.styles';

// utils
import {
  showEarliestFirst,
  showLatestFirst,
} from './../../utils/getSortedScrims';
import {
  filterPlayerWon,
  filterPlayerLost,
  filterLobbyCaptain,
} from './../../utils/filterScrims';

// components
import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Moment from 'react-moment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import CustomTooltip from '../shared/Tooltip';
import Tooltip from '@mui/material/Tooltip';

// scrims passed in props from UserProfile.jsx (userParticipatedScrims)
export default function UserParticipatedScrims({ scrims, user }) {
  const [sortType, setSortType] = useState('date-descending');
  const [filterType, setFilterType] = useState('none');

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

  const filteredUserScrims = useMemo(() => {
    switch (filterType) {
      case 'none':
        return sortedUserScrims;
      case 'games played':
        return sortedUserScrims.filter((scrim) => {
          const scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];

          const foundPlayer = scrimTeams.find(
            (player) => player._user === user._id
          );

          return foundPlayer;
        });

      case 'games casted':
        return sortedUserScrims.filter((scrim) => {
          const foundCaster = scrim.casters.find(
            (casterId) => casterId === user._id
          );

          return foundCaster;
        });

      case 'lobby captain games':
        return filterLobbyCaptain(user, sortedUserScrims);

      case 'matches won':
        return filterPlayerWon(user, sortedUserScrims);

      case 'matches lost':
        return filterPlayerLost(user, sortedUserScrims);
      default:
        return sortedUserScrims;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType, filterType, sortedUserScrims, user._id]);

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
          <CustomTooltip
            title={`Scrims that ${user?.name} has been a part of (caster or player)`}>
            <Typography style={{ cursor: 'help' }} variant="h1">
              Scrims Participated In
            </Typography>
          </CustomTooltip>
        </Grid>

        <FormGroup row>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterType.toString()}
                label="Filter"
                onChange={(e) => {
                  setFilterType(e.target.value);
                }}>
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="games played">Games Played</MenuItem>
                <MenuItem value="games casted">Games Casted</MenuItem>
                <MenuItem value="lobby captain games">Lobby Captain</MenuItem>
                <MenuItem value="matches won">Matches Won</MenuItem>
                <MenuItem value="matches lost">Matches Lost</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 120 }} className={classes.sortByBox}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
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
        </FormGroup>
      </Grid>

      <ul className={classes.myCreatedScrimsList}>
        {filteredUserScrims.length > 0 ? (
          filteredUserScrims.map((scrim) => (
            <li key={scrim._id}>
              <Tooltip arrow placement="top" title="Redirect to game page">
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
          ))
        ) : (
          <Typography variant="h3">
            {filterType === 'none'
              ? 'No user participated scrims found'
              : `No ${filterType} found`}
          </Typography>
        )}
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
