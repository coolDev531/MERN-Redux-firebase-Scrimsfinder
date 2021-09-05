import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// screens
import Intro from '../screens/Intro';
import Scrims from '../screens/Scrims';
import ScrimCreate from '../screens/ScrimCreate';
import ScrimDetail from '../screens/ScrimDetail';
import NotFound from '../screens/NotFound';
import ScrimEdit from '../screens/ScrimEdit';
import Settings from '../screens/Settings';

const AppRouter = () => (
  <Switch>
    <PrivateRoute exact path="/scrims" component={Scrims} />
    <PrivateRoute path="/scrims/new" component={ScrimCreate} />
    <PrivateRoute path="/scrims/:id/edit" component={ScrimEdit} />
    <PrivateRoute path="/scrims/:id" component={ScrimDetail} />
    <Route path="/settings" component={Settings} />
    <Route path="/user-setup" component={Intro} />
    <PrivateRoute exact path="/" component={Scrims} />
    <Route component={NotFound} />
  </Switch>
);

export default AppRouter;
