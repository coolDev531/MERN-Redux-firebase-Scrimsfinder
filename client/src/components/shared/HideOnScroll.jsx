import useEffectExceptOnMount from './../../hooks/useEffectExceptOnMount';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import { useDispatch } from 'react-redux';

const HideOnScroll = ({ children, window }) => {
  const dispatch = useDispatch();

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  useEffectExceptOnMount(() => {
    if (trigger) {
      // reset search if dropdown is open and user scrolled down
      dispatch({ type: 'users/setSearch', payload: '' });
    }
  }, [trigger]);

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

export default HideOnScroll;
