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
}));
