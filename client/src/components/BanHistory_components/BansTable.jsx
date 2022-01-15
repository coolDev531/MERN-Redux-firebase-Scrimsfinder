// hooks
import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
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
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

// icons
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import AutoComplete from './AutoComplete';

const useStyles = makeStyles((theme) => ({
  tableRoot: {
    width: '100%',
  },
  tableContainer: {
    maxHeight: 500,
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
}));

const DateFilter = ({ column, allDateTos, allDateFroms }) => {
  const { filterValue, setFilter, accessor } = column;

  const dateData = accessor === 'dateTo' ? allDateTos : allDateFroms;

  const handleChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Select year</InputLabel>
      <Select
        style={{ width: '120px' }}
        value={filterValue || ''}
        label="Filter by yearId"
        onChange={handleChange}>
        <MenuItem value={''}>All</MenuItem>
        {[...dateData]
          // latest year at top
          .sort((a, b) => b - a)
          .map((dateId, idx) => (
            <MenuItem value={dateId} key={idx}>
              {dateId}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

const UserNameFilter = ({ column }) => {
  const { filterValue, setFilter, filteredRows } = column;

  // new set for repeating player IDs...
  const filteredOptions = useMemo(
    () => [...new Set(filteredRows.map(({ original }) => original._user._id))],
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
      filteredOptions={filteredOptions}
      valueProp={filterValue}
      setFilterValue={handleChange} // passing the handleChange as props.
      fullWidth
      placeholder={'Filter by playerId'}
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
    () => [...new Set([...bans].map(({ dateFrom }) => dateFrom))],
    [bans]
  );

  const allDateTos = useMemo(
    () => [...new Set([...bans].map(({ dateTo }) => dateTo))],
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
        accessor: 'name',
        Filter: UserNameFilter,
      },
      {
        Header: 'Date From',
        accessor: 'dateFrom', // when filters will look for yearID to change.
        Filter: DateFilter,
      },
      {
        Header: 'Date To',
        accessor: 'dateTo',
        Filter: DateFilter,
      },
    ],

    []
  );

  const {
    gotoPage,
    setPageSize,
    canPreviousPage,
    pageOptions,
    canNextPage,
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
      data: bans, // passing the players as data for the table
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    useFilters,

    useGlobalFilter,
    usePagination
  ); // react-table hooks

  const classes = useStyles();

  return (
    <>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader className={classes.table} {...getTableProps()}>
          <TableHead>
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

          <TableBody {...getTableBodyProps()}>
            {rows.map((row, idx) => {
              prepareRow(row);
              // table rows
              return (
                <TableRow {...row.getRowProps()} hover key={idx}>
                  {row.cells.map((cell, idx) => {
                    let user = row.original;
                    return (
                      // cell of row.
                      <Tooltip arrow key={idx} placement="top">
                        <TableCell
                          click={() => console.log({ user })}
                          style={{ cursor: 'pointer' }}
                          {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </TableCell>
                      </Tooltip>
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
              rowsPerPageOptions={[10, 20, 30, 40, 50]}
              colSpan={0}
              className={classes.pagination}
              count={pageOptions.length}
              rowsPerPage={pageSize}
              onPageChange={gotoPage}
              page={pageIndex}
              classes={{ spacer: classes.paginationSpacer }}
              onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))}
              ActionsComponent={(props) => {
                const { count, page, rowsPerPage, onPageChange } = props;

                const handleFirstPageButtonClick = () => {
                  onPageChange(0);
                };

                const handleBackButtonClick = () => {
                  if (!canPreviousPage) return;

                  const previousPage = page - 1;
                  onPageChange(previousPage);
                };

                const handleNextButtonClick = () => {
                  if (!canNextPage) return;

                  const nextPage = page + 1;
                  onPageChange(nextPage);
                };

                const handleLastPageButtonClick = () => {
                  onPageChange(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
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
                      disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                      aria-label="next page">
                      <KeyboardArrowRight />
                    </IconButton>
                    <IconButton
                      onClick={handleLastPageButtonClick}
                      disabled={page >= Math.ceil(count / rowsPerPage) - 1}
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
    </>
  );
}
