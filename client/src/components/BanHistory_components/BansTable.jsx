// hooks
import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
  useExpanded,
} from 'react-table';
import { useCallback, useMemo } from 'react';

// utils
import { makeStyles } from '@mui/styles';

// components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '../shared/Tooltip';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import moment from 'moment';
import Paper from '@mui/material/Paper';
import AutoComplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// icons
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { truncate } from '../../utils/truncate';

const useStyles = makeStyles((theme) => ({
  tableRoot: {
    width: '100%',
    maxWidth: '1100px',
  },
  tableContainer: {
    maxHeight: 500,
  },
  tableBody: {
    background: theme.palette.background.paper,
  },
  pagination: {
    background: theme.palette.background.paper,
  },
  paginationSpacer: {
    flex: '1 1 100%',
    [theme.breakpoints.down('md')]: {
      flex: '0 0',
    },
  },
  paginationActions: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      flexShrink: 1, // direction buttons in a column in small screen
    },
  },
  tableHeader: { maxWidth: '200px', width: '250px' },
  tableHead: {
    background: theme.palette.background.paper,
  },
}));

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
  // react-table requires a default column when using filters.
  const defaultColumn = useMemo(
    () => ({
      Filter: <></>,
    }),
    []
  );

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

  /* Filterable columns:  
  Year
  Team name
  */
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
          <div style={{ width: '95%', wordBreak: 'break-word' }}>
            {truncate(r.value, 32)}
          </div>
        ),
      },
    ],

    []
  );

  const {
    gotoPage,
    setPageSize,
    pageOptions,
    state: { pageIndex, pageSize },
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: rows, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    prepareRow,
  } = useTable(
    {
      defaultColumn,
      columns,
      autoResetPage: true,
      data: bans.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ), // passing the players as data for the table
      initialState: {
        pageIndex: 0,
        pageSize: 20,
        // filters: [{ id: 'isActive', value: true }],
      },
    },
    useFilters,
    useGlobalFilter,
    useExpanded,
    usePagination
  ); // react-table hooks

  const classes = useStyles();

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader className={classes.table} {...getTableProps()}>
          <TableHead className={classes.tableHead}>
            {/* COLUMN HEADERS */}
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, key) => {
                  return (
                    <TableCell
                      key={key}
                      {...column.getHeaderProps()}
                      className={classes.tableHeader}>
                      <Grid container direction="column">
                        <Grid item>{column.render('Header')}</Grid>
                        <Grid item>
                          {column.canFilter
                            ? column.render('Filter', {
                                allDateFroms,
                                allDateTos,
                              }) // pass props to column
                            : null}
                        </Grid>
                      </Grid>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody {...getTableBodyProps()} className={classes.tableBody}>
            {rows.map((row, idx) => {
              prepareRow(row);
              // table rows
              return (
                <TableRow tabIndex={-1} {...row.getRowProps()} hover key={idx}>
                  {row.cells.map((cell, idx) => {
                    return (
                      // cell of row.
                      <TableCell
                        key={idx}
                        style={{ maxWidth: '200px' }}
                        {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Table>
        <TableFooter>
          <TableRow>
            {/* TABLE PAGINATION */}

            {/* Material UI TablePagination component */}
            <TablePagination
              rowsPerPageOptions={[10, 20, 30, 40, 50, 100]}
              colSpan={0}
              className={classes.pagination}
              count={pageOptions.length}
              rowsPerPage={pageSize}
              onPageChange={gotoPage}
              page={pageIndex}
              classes={{ spacer: classes.paginationSpacer }}
              onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))}
              labelDisplayedRows={() =>
                `${pageIndex + 1}-${pageOptions?.length} of ${
                  pageOptions?.length
                }`
              }
              ActionsComponent={(props) => {
                const { page, onPageChange } = props;

                const canGoNext = page < pageOptions?.length - 1;
                const canGoBack = page > 0;

                const handleFirstPageButtonClick = () => {
                  onPageChange(0);
                };

                const handleBackButtonClick = () => {
                  // if (!canPreviousPage) return;
                  if (!canGoBack) return;

                  const previousPage = page - 1;
                  onPageChange(previousPage);
                };

                const handleNextButtonClick = () => {
                  // if (!canNextPage) return;
                  if (!canGoNext) return;

                  const nextPage = page + 1;
                  onPageChange(nextPage);
                };

                const handleLastPageButtonClick = () => {
                  // onPageChange(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
                  onPageChange(pageOptions?.length - 1);
                };

                return (
                  <div className={classes.paginationActions}>
                    <IconButton
                      onClick={handleFirstPageButtonClick}
                      disabled={page === 0}
                      aria-label="first page">
                      <FirstPageIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleBackButtonClick}
                      disabled={page === 0}
                      aria-label="previous page">
                      <KeyboardArrowLeft />
                    </IconButton>
                    <IconButton
                      onClick={handleNextButtonClick}
                      // disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                      disabled={!canGoNext}
                      aria-label="next page">
                      <KeyboardArrowRight />
                    </IconButton>
                    <IconButton
                      onClick={handleLastPageButtonClick}
                      // disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                      disabled={!canGoNext}
                      aria-label="last page">
                      <LastPageIcon />
                    </IconButton>
                  </div>
                );
              }}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </Paper>
  );
}
