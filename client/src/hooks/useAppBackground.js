import { useSelector } from 'react-redux';
import { useLayoutEffect, useRef } from 'react';

// this is a lifeCycle hook, it watches whenever appBgBlur and appBackground changes in redux
export default function useAppBackground() {
  const { appBackground, appBgBlur } = useSelector(({ general }) => general);
  const appWrapperRef = useRef(null); // this ref will have to be attached to the wrapper div in app

  useLayoutEffect(() => {
    // this changes the background whenever appBackground or appBgBlur change in the redux store
    appWrapperRef.current?.style.setProperty('--bgImg', appBackground);
    appWrapperRef.current?.style.setProperty('--bgBlur', appBgBlur);

    // eslint-disable-next-line
  }, [appWrapperRef.current, appBackground, appBgBlur]);

  return appWrapperRef;
}
