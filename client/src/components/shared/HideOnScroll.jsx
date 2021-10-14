import useEffectExceptOnMount from './../../hooks/useEffectExceptOnMount';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

const HideOnScroll = ({ children, window }) => {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  useEffectExceptOnMount(() => {
    if (trigger) {
      console.log('hehe');
      document.querySelector('nav__search-input').value = '';
    }
  }, []);

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

export default HideOnScroll;
