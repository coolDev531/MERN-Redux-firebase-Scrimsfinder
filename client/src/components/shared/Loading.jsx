import { useEffect, useState, useRef, useMemo } from 'react';

// components
import Typography from '@mui/material/Typography';
import LoadingGif from '../../assets/images/loading.gif';
import { PageContent } from './PageComponents';

export default function Loading({ text }) {
  const [isHerokuHibernating, setIsHerokuHibernating] = useState(false);
  let isMounted = useRef(true);

  const IS_SLEEPING_INTERVAL = 6000; // 6 seconds means heroku is hibernating

  useEffect(() => {
    setTimeout(() => {
      if (!isMounted.current) return;
      setIsHerokuHibernating(true);
    }, IS_SLEEPING_INTERVAL);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const displayText = useMemo(
    () => (isHerokuHibernating ? 'Waking up the server...' : text),
    [isHerokuHibernating, text]
  );

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
            </Typography>
            <img className="loading" src={LoadingGif} alt="loading" />
          </div>
        </div>
      </div>
    </PageContent>
  );
}
