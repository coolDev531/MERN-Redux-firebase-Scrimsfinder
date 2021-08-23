import { makeStyles } from '@material-ui/core/styles';

export const useScrimSectionStyles = makeStyles((theme) => ({
  gameMetaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  exitIcon: {
    color: '#000',
    cursor: 'pointer',
    position: 'absolute',
    top: '16px',
    right: '5px',
  },
  teamsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gridGap: '20px',
    backgroundImage:
      'url(https://pa1.narvii.com/5779/8d76b2b8112e6aa9494a93f0ca6bbffe96e2f6c3_hq.gif)',
    // height: '50%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },

  teamList: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
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
