import { useMemo } from 'react';
import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
  useExpanded,
} from 'react-table';
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
import Paper from '@mui/material/Paper';

// icons
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

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

export default function TableDesktop({
  columns,
  data,
  autoResetPage = true,
  initialStateDesktop = {
    pageIndex: 0,
    pageSize: 10,
    // filters: [{ id: 'isActive', value: true }],
  },
  filterColumnProps,
  rowsPerPageOptionsDesktop = [10, 20, 30, 40, 50, 100],
}) {
  // react-table requires a default column when using filters.
  const defaultColumn = useMemo(
    () => ({
      Filter: <></>,
    }),
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
      autoResetPage,
      data,
      initialState: initialStateDesktop,
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
                            ? column.render('Filter', filterColumnProps) // pass props to column
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
              rowsPerPageOptions={rowsPerPageOptionsDesktop}
              colSpan={0}
              className={classes.pagination}
              count={pageOptions.length}
              rowsPerPage={pageSize}
              onPageChange={gotoPage}
              page={pageIndex}
              labelRowsPerPage="Results per page:"
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
