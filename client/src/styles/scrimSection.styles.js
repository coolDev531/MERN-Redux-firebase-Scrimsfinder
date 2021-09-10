import { makeStyles } from '@material-ui/core';

export const useScrimSectionStyles = makeStyles((theme) => ({
  scrimBox: {
    display: 'block',
    width: '98%',
    maxWidth: '1100px',
    marginRight: 'auto',
    marginLeft: 'auto',
    backgroundImage: ({ imageUploaded, scrim }) =>
      imageUploaded === scrim?._id
        ? `url(${scrim?.postGameImage?.location})`
        : 'url(https://pa1.narvii.com/5779/8d76b2b8112e6aa9494a93f0ca6bbffe96e2f6c3_hq.gif)',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: ({ imageUploaded, scrim }) =>
      imageUploaded === scrim?._id ? '100% 100%' : 'cover',
    border: '1px solid white',
  },
  iconButton: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '30%',
    right: '4px',
  },
  teamsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gridGap: '20px',
    padding: '10px',
  },
  teamList: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
    opacity: '0.99',
    transition: 'all 250ms ease-in-out',
    paddingBottom: 0,
    '&:hover': {
      opacity: '1',
    },
  },

  teamListItem: {
    minHeight: '120px',
    maxHeight: '120px',
    [theme.breakpoints.down('md')]: {
      minHeight: '130px',
      maxHeight: '130px',
      overflowY: 'scroll',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: '150px',
      maxHeight: '150px',
    },
  },

  inline: {
    display: 'inline',
  },
}));
