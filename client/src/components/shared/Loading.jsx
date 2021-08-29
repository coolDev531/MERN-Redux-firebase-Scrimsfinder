import { Typography } from '@material-ui/core';
import LoadingGif from '../../assets/images/loading.gif';

export default function Loading({ text }) {
  return (
    <main className="page-content">
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
    </main>
  );
}
