import { useEffect, useState, useRef, useMemo } from 'react';
import useInterval from '../../hooks/useInterval';

// components
import Typography from '@mui/material/Typography';
import LoadingGif from '../../assets/images/loading.gif';
import { PageContent } from './PageComponents';

export default function Loading({ text }) {
  const [dots, setDots] = useState('.');
  const [isServerHibernating, setIsServerHibernating] = useState(false); // server free plan hibernates when inactive

  let isMounted = useRef(true);

  const IS_SLEEPING_INTERVAL = 6000; // 6 seconds means server is hibernating

  useEffect(() => {
    setTimeout(() => {
      if (!isMounted.current) return;
      setIsServerHibernating(true);
    }, IS_SLEEPING_INTERVAL);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const displayText = useMemo(
    () => (isServerHibernating ? 'Waking up the server' : text),
    [isServerHibernating, text]
  );

  const updateDots = (initialState = '.', maxLength = 3) => {
    if (dots.length === maxLength) {
      return setDots(initialState);
    }

    setDots((prevState) => (prevState += '.'));
  };

  useInterval(updateDots, 1000);

  return (
    <PageContent>
      <div className="centered">
        <div className="loading-wrapper">
          <div className="content-container">
            <Typography
              variant="h4"
              align="center"
              className="text-white"
              gutterBottom>
              {displayText}
              {dots}
            </Typography>

            <img className="loading" src={LoadingGif} alt="loading" />
          </div>
        </div>
      </div>
    </PageContent>
  );
}
