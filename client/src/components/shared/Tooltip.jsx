import { makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.white,
  },
  tooltip: {
    color: '#000',
    fontSize: ({ fontSize }) => fontSize || 'clamp(0.8rem, 4vw, 1rem)',
    border: '1px solid #fff',
    fontWeight: ({ fontWeight }) => fontWeight || 700,
    backgroundColor: theme.palette.common.white,
    boxShadow: '1px 2px 4px 1px #999',
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
