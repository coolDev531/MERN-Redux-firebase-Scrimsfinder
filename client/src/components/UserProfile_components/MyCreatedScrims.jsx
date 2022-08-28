import { useState, useMemo } from 'react';
import { useProfileStyles } from '../../styles/UserProfile.styles';

// components
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Moment from 'react-moment';
import Divider from '@mui/material/Divider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import CustomTooltip from '../shared/Tooltip';
import Tooltip from '@mui/material/Tooltip';

// utils
import {
  showEarliestFirst,
  showLatestFirst,
} from '../../utils/getSortedScrims';

export default function MyCreatedScrims({
  isCurrentUser,
  isCurrentUserAdmin,
  scrims,
  user,
}) {
  const [sortType, setSortType] = useState('date-descending');
  const [filterType, setFilterType] = useState('none');

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

  const filteredCreatedScrims = useMemo(() => {
    switch (filterType) {
      case 'none':
        return sortedCreatedScrims;

      case 'private':
        return sortedCreatedScrims.filter((scrim) => scrim.isPrivate);

      case 'public':
        return sortedCreatedScrims.filter((scrim) => !scrim.isPrivate);

      default:
        return sortedCreatedScrims;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType, filterType, sortedCreatedScrims]);

  if (!isCurrentUser && !isCurrentUserAdmin) return null;
  if (!user?.isAdmin) return null;

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
            placement="top"
            title={`Scrims that ${
              isCurrentUser ? 'you have' : `${user?.name} has`
            } created`}>
            <Typography style={{ cursor: 'help' }} variant="h1">
              {isCurrentUser
                ? 'My Created Scrims'
                : `${user?.name}'s Created Scrims`}
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
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
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
        {filteredCreatedScrims.length > 0 ? (
          filteredCreatedScrims.map((scrim) => (
            <li key={scrim._id}>
              <Tooltip arrow placement="top" title="Redirect to game page">
                <Link className="link" to={`/scrims/${scrim._id}`}>
                  {scrim.title} |&nbsp;
                  <Moment format="MM/DD/yyyy hh:mm A">
                    {scrim.gameStartTime}
                  </Moment>
                  &nbsp;| {scrim.region}&nbsp;
                  {scrim?.isPrivate ? '| Private' : '| Public'}
                </Link>
              </Tooltip>
            </li>
          ))
        ) : (
          <Typography variant="h3">
            {/* if user didn't set a filter, just say no scrims found */}
            {filterType === 'none'
              ? 'No created scrims found'
              : `No ${filterType} created scrims found`}
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
