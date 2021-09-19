import makeStyles from '@mui/styles/makeStyles';
import Tooltip from '@mui/material/Tooltip';

const useStyles = makeStyles((theme) => ({
  arrow: {
    color: '#fff !important',
  },
  tooltip: {
    color: '#000 !important',
    fontSize: ({ fontSize }) =>
      fontSize
        ? `${fontSize} !important`
        : 'clamp(0.8rem, 4vw, 1rem) !important',
    border: '1px solid #fff',
    fontWeight: ({ fontWeight }) =>
      fontWeight ? `${fontWeight} !important` : '700 !important',
    backgroundColor: '#fff !important',
    boxShadow: '1px 2px 4px 1px #999 !important',
  },
}));

export default function CustomTooltip(props) {
  const classes = useStyles(props);
  // takes title prop to display text
  return (
    <Tooltip
      arrow
      classes={classes}
      placement={props.placement ?? 'top'}
      {...props}
    />
  );
}
