import { makeStyles } from '@material-ui/core/styles';

export const useScrimSectionStyles = makeStyles((theme) => ({
  scrimBox: {
    display: 'block',
    width: '98%',
    maxWidth: '1100px',
    marginRight: 'auto',
    marginLeft: 'auto',
    backgroundImage:
      'url(https://pa1.narvii.com/5779/8d76b2b8112e6aa9494a93f0ca6bbffe96e2f6c3_hq.gif)',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    border: '1px solid white',
  },
  gameMetaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  exitIcon: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '16px',
    right: '5px',
  },
  iconButton: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '16px',
    right: '5px',
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
    '&:hover': {
      opacity: '1',
    },
  },

  teamListItem: {
    minHeight: '100px',
    maxHeight: '100px',
  },

  teamsVersusSeparator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    display: 'inline',
  },
}));
