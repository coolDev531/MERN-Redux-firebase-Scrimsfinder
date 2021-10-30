import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// screens
import SignUp from '../screens/SignUp';
import Scrims from '../screens/Scrims';
import ScrimCreate from '../screens/ScrimCreate';
import ScrimDetail from '../screens/ScrimDetail';
import NotFound from '../screens/NotFound';
import ScrimEdit from '../screens/ScrimEdit';
import Settings from '../screens/Settings';
import UserProfile from '../screens/UserProfile';
import Witch from './../components/events_components/halloween/Witch';

const AppRouter = () => (
  <Switch>
    <PrivateRoute exact path="/scrims/new" component={ScrimCreate} />
    <PrivateRoute exact path="/scrims/:id/edit" component={ScrimEdit} />
    <PrivateRoute exact path="/scrims/:id" component={ScrimDetail} />
    <PrivateRoute exact path="/settings" component={Settings} />
    <PrivateRoute exact path="/users/:name" component={UserProfile} />
    <Route exact path="/signup" component={SignUp} />
    <PrivateRoute exact path={['/', '/scrims']} component={Scrims} />
    <Route path="/witch" component={Witch} />
    <Route component={NotFound} />
  </Switch>
);

export default AppRouter;
