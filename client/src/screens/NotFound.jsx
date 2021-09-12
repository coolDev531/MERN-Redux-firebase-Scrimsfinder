import { useLocation } from 'react-router-dom';
import Navbar from '../components/shared/Navbar/Navbar';
import { PageContent } from '../components/shared/PageComponents';
import Typography from '@material-ui/core/Typography';

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <PageContent>
      <Navbar showless />
      <div className="centered" style={{ width: 'auto' }}>
        <Typography variant="h1">
          Oops, <br />
          {pathname.replace('/', '')} doesn't exist!
        </Typography>
      </div>
    </PageContent>
  );
}
