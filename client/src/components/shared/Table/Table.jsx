import useTheme from '@mui/system/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableMobile from './TableMobile';
import TableDesktop from './TableDesktop';

function Table(props) {
  const theme = useTheme();
  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return isSmScreen ? <TableMobile {...props} /> : <TableDesktop {...props} />;
}

export default Table;
