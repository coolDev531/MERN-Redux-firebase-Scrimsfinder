import { Typography } from '@material-ui/core';
import LoadingGif from '../../assets/images/loading.gif';
import { PageContent } from './PageComponents';

export default function Loading({ text }) {
  return (
    <PageContent>
      <div className="centered">
        <div className="loading-wrapper">
          <div className="content-container">
            <Typography variant="h4" align="center" gutterBottom>
              {text}
            </Typography>
            <img className="loading" src={LoadingGif} alt="loading" />
          </div>
        </div>
      </div>
    </PageContent>
  );
}
