import useTheme from '@mui/system/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableDesktop from './TableDesktop';

function Table(props) {
  const theme = useTheme();
  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return <TableDesktop {...props} />;
}

export default Table;
