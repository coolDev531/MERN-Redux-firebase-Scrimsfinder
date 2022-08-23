import { useCallback, useMemo } from 'react';

// utils
import { truncate } from '../../utils/truncate';

// components
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '../shared/Tooltip';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import moment from 'moment';
import AutoComplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Table from './../shared/Table/Table';

const DateFilter = ({ column, allDateTos, allDateFroms }) => {
  const { filterValue, setFilter, Header } = column;

  const dateData = Header === 'Date To' ? allDateTos : allDateFroms;

  const handleChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <Select
        style={{ maxWidth: '200px', width: '80%' }}
        value={filterValue || ''}
        label="Filter by dateFrom"
        fullWidth
        displayEmpty
        onChange={handleChange}>
        <MenuItem value={''}>All</MenuItem>
        {[...dateData]
          // latest year at top
          .sort((a, b) => b - a)
          .map((dateId, idx) => (
            <MenuItem value={dateId} key={idx}>
              <Moment format="MM/DD/YYYY">{dateId}</Moment>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

const StatusFilter = ({ column }) => {
  const { filterValue, setFilter } = column;

  const handleChange = (event) => {
    setFilter(event.target.value || '');
  };

  return (
    <FormControl fullWidth>
      <Select
        displayEmpty
        style={{ maxWidth: '200px', width: '80%' }}
        value={filterValue || ''}
        label="Filter by status"
        fullWidth
        onChange={handleChange}>
        <MenuItem value={''}>All</MenuItem>
        <MenuItem value={'true'}>Active</MenuItem>
        <MenuItem value={'false'}>Expired</MenuItem>
      </Select>
    </FormControl>
  );
};

const UserNameFilter = ({ column }) => {
  const { filterValue, setFilter, filteredRows } = column;

  // new set for repeating player IDs...
  const filteredOptions = useMemo(
    () => [...new Set(filteredRows.map(({ original }) => original._user.name))],
    [filteredRows]
  );

  // filters by column.accessor: playerID
  const handleChange = useCallback(
    (value) => {
      setFilter(value);
    },

    // whenever setFilter changes this function will be recreated  amd put into the handleChange variable
    [setFilter]
  );

  return (
    <AutoComplete
      disablePortal
      onChange={(_event, newValue) => {
        handleChange(newValue);
      }}
      inputValue={filterValue}
      onInputChange={(_event, newInputValue) => {
        handleChange(newInputValue);
      }}
      options={filteredOptions}
      renderInput={(params) => <TextField {...params} />}
    />
  );
};

export default function BansTable({ bans }) {
  const allDateFroms = useMemo(
    () => [
      ...new Set(
        [...bans].map(({ dateFrom }) => moment(dateFrom).format('MM/DD/YYYY'))
      ),
    ],
    [bans]
  );

  const allDateTos = useMemo(
    () => [
      ...new Set(
        [...bans].map(({ dateTo }) => moment(dateTo).format('MM/DD/YYYY'))
      ),
    ],
    [bans]
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Summoner Name',
        accessor: (r) => {
          return r._user.name;
        },
        Filter: UserNameFilter,
        Cell: (r) => {
          const _user = r.row.original._user;

          return (
            <Tooltip title="Go to user profile">
              <Link
                className="link"
                to={`/users/${_user.name}?region=${_user.region}`}>
                {_user.name}
              </Link>
            </Tooltip>
          );
        },
      },
      {
        Header: 'Date From',
        accessor: (r) => moment(r.dateFrom).format('MM/DD/YYYY'),
        Filter: DateFilter,
      },
      {
        Header: 'Date To',
        accessor: (r) => moment(r.dateTo).format('MM/DD/YYYY'),
        Filter: DateFilter,
      },

      {
        id: 'isActive',
        Header: 'Status',
        accessor: (r) => r.isActive.toString(),
        Filter: StatusFilter,
        Cell: (r) =>
          r.value.toString() === 'true' ? 'Active' : 'Inactive/Expired',
      },

      {
        Header: 'Reason',
        accessor: 'reason',
        Cell: (r) => (
          <div style={{ width: '100%', wordBreak: 'break-word' }}>
            {truncate(r.value, 32)}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={bans.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )}
      filterColumnProps={{ allDateFroms, allDateTos }}
    />
  );
}
