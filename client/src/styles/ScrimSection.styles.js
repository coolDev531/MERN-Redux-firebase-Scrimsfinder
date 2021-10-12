import { makeStyles } from '@mui/styles';
import BgGIF from '../assets/images/backgrounds/vi_background.gif';
import HappyTeam from '../assets/images/backgrounds/happy_team.jpg';

export const useScrimSectionStyles = makeStyles((theme) => ({
  scrimBox: {
    display: 'block',
    width: '98%',
    maxWidth: '1100px',
    marginRight: 'auto',
    marginLeft: 'auto',
    paddingBottom: '20px',
    backgroundImage: ({ scrim }) =>
      scrim?.teamWon ? `url(${HappyTeam})` : `url(${BgGIF})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    border: '1px solid white',
    maxHeight: ({ expanded }) => (expanded ? 'inherit' : '289px'),
    overflowY: ({ expanded }) => (expanded ? 'inherit' : 'hidden'),
  },

  scrimSectionHeader: {
    background: '#101820 !important', // fallback
    backgroundColor: 'rgba(18,25,35,.85) !important',
    padding: '10px',
    backdropFilter: ({ expanded }) => (expanded ? 'blur(8px)' : 'blur(2.5px)'),
    height: ({ expanded }) => (expanded ? 'inherit' : '300px'),
  },

  iconButton: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '30%',
    right: '4px',
  },

  infoIcon: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '10%',
    right: '13px',
  },

  teamsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gridGap: '20px',
    padding: '10px',

    '@media screen and (max-width: 630px)': {
      gridTemplateColumns: 'inherit',
      gridTemplateRows: '1fr 1fr 1fr',
    },
  },

  teamListHeader: {
    color: '#fff !important',
    background: '#101820 !important', // fallback
    backgroundColor: 'rgba(18,25,35, .85) !important',
    backdropFilter: 'blur(8px)',
  },

  teamList: {
    width: '100%',
    maxWidth: '36ch',
    background: '#101820 !important', // fallback
    backgroundColor: 'rgba(18,25,35, .85) !important',
    backdropFilter: 'blur(20px)',

    transition: 'all 250ms ease-in-out',
    paddingBottom: 0,
    '&:hover': {
      backgroundColor: 'rgba(18,25,35) !important',
    },
    '@media screen and (max-width: 630px)': {
      maxWidth: '100%',
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

      '-ms-overflow-style': 'none' /* IE 11 */,
      scrollbarWidth: 'none' /* Firefox 64 */,
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
