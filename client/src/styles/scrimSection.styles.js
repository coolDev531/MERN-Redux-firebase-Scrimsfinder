import { makeStyles } from '@material-ui/core/styles';

export const useScrimSectionStyles = makeStyles((theme) => ({
  gameMetaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  icon: {
    color: 'white',
    cursor: 'pointer',
  },
  teamsContainer: {
    display: 'flex',
    gap: '10%',
  },
  teamList: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
}));
