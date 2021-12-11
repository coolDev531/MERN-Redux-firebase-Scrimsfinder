import { PageContent } from '../components/shared/PageComponents';
import Navbar from './../components/shared/Navbar/Navbar';
import Typography from '@mui/material/Typography';

export default function ServerError() {
  return (
    <PageContent>
      <Navbar showless noLogin noGuide />

      <div className="centered" style={{ width: 'auto' }}>
        <Typography variant="h1" textAlign="center" gutterBottom>
          ERROR 503
        </Typography>
        <Typography variant="h2" component="h1" textAlign="center">
          Uh oh, there was a problem connecting to the server. <br /> Please try
          again later.
        </Typography>
      </div>
    </PageContent>
  );
}
