import { useMemo } from 'react';
import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
  useExpanded,
} from 'react-table';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import MobileTableNavigation from './MobileTableNavigation';

const tableCellStyles = {
  display: 'block',
  '&::before': {
    content: 'attr(data-label)',
    float: 'left',
    fontWeight: 700,
  },

  fontSize: '12px',
  color: '#fff',
};

export default function TableMobile({
  data,
  columns,
  rowsPerPageOptionsMobile = [3, 5, 10, 15, 20, 25, 30],
  initialStateMobile = {
    pageIndex: 0,
    pageSize: 3,
  },
  autoResetPage = true,
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
    page: rows, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    prepareRow,
  } = useTable(
    {
      defaultColumn,
      columns,
      autoResetPage,
      data,
      initialState: initialStateMobile,
    },
    useFilters,
    useGlobalFilter,
    useExpanded,
    usePagination
  ); // react-table hooks

  return (
    <>
      <Paper sx={{ width: '100%' }}>
        <TableContainer>
          <Table {...getTableProps()}>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={rowsPerPageOptionsMobile}
                  component="div"
                  sx={{
                    '& .MuiToolbar-root': {
                      width: '100%',
                      gap: '10px',
                    },

                    '& .MuiTablePagination-displayedRows': {
                      order: 0,
                      flex: 1,
                      position: 'absolute',
                      left: '22px',
                      color: '#fff',
                    },

                    '& .MuiTablePagination-selectLabel': {
                      color: '#fff',
                    },

                    '& .MuiInputBase-root': {
                      '.MuiTablePagination-select': {
                        display: 'flex',
                        width: '30px',
                        border: '1px solid',
                        borderColor: 'primary.linkColor',
                        borderRadius: '5px',
                        color: 'primary.linkColor',
                      },

                      '.MuiTablePagination-selectIcon': {
                        color: 'primary.linkColor',
                      },
                    },
                  }}
                  count={rows.length}
                  rowsPerPage={pageSize}
                  page={pageIndex}
                  onPageChange={gotoPage}
                  onRowsPerPageChange={(e) =>
                    setPageSize(Number(e.target.value))
                  }
                  labelRowsPerPage="Results per page:"
                  labelDisplayedRows={() =>
                    `${pageIndex + 1}-${pageOptions?.length} of ${
                      pageOptions?.length
                    }`
                  }
                  ActionsComponent={() => <></>}
                />
              </TableRow>
            </TableFooter>
          </Table>
          <Table
            sx={{
              borderCollapse: 'collapse',
              margin: 0,
              padding: 0,
              width: '100%',
              tableLayout: 'fixed',
            }}
            size="small">
            <TableBody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);

                return (
                  <>
                    <TableRow
                      {...row.getRowProps()}
                      key={row?.id}
                      sx={{
                        display: 'block',
                        padding: '0.35em',
                        borderBottom: '27px solid #F1F1F1',
                        boxShadow: 'inset 0 -7px 10px -11px',
                      }}>
                      {/* dont include the id field */}
                      {row.cells.map((cell, idx) => {
                        return (
                          <TableCell
                            key={idx}
                            data-label={cell.column.Header || 'ERR::NO_HEADER'}
                            align="right"
                            sx={tableCellStyles}
                            {...cell.getCellProps()}>
                            {cell.render('Cell')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <MobileTableNavigation
        currentPage={pageIndex}
        onPageChange={gotoPage}
        rowsPerPage={pageSize}
        totalRowsCount={data.length}
      />
    </>
  );
}
