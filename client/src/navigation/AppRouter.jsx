import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// screens
import SignUp from '../screens/SignUp';
import Scrims from '../screens/Scrims';
import ScrimCreate from '../screens/admin_screens/ScrimCreate';
import ScrimDetail from '../screens/ScrimDetail';
import NotFound from '../screens/NotFound';
import ScrimEdit from '../screens/admin_screens/ScrimEdit';
import Settings from '../screens/Settings';
import UserProfile from '../screens/UserProfile';
import ServerError from '../screens/ServerError';
import Guide from '../screens/Guide';
import BanHistory from '../screens/admin_screens/BanHistory';

const AppRouter = () => (
  <Switch>
    <PrivateRoute exact path="/scrims/new" component={ScrimCreate} />
    <PrivateRoute exact path="/scrims/:id/edit" component={ScrimEdit} />
    <PrivateRoute exact path="/scrims/:id" component={ScrimDetail} />
    <PrivateRoute exact path="/settings" component={Settings} />
    <PrivateRoute exact path="/users/:name" component={UserProfile} />
    <Route exact path="/signup" component={SignUp} />
    <Route exact path="/server-error" component={ServerError} />
    <PrivateRoute exact path={['/', '/scrims']} component={Scrims} />
    <Route exact path="/guide" component={Guide} />
    <PrivateRoute
      exact
      path={['/bans', 'ban-history']}
      component={BanHistory}
    />

    <Route component={NotFound} />
  </Switch>
);

export default AppRouter;
