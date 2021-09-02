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
    <PrivateRoute exact path="/" component={Scrims} />
    <PrivateRoute exact path="/scrims" component={Scrims} />
    <PrivateRoute exact path="/scrims/new" component={ScrimCreate} />
    <PrivateRoute exact path="/scrims/:id/edit" component={ScrimEdit} />
    <PrivateRoute exact path="/scrims/:id" component={ScrimDetail} />
    <Route exact path="/user-setup" component={Intro} />
    <Route exact path="/settings" component={Settings} />
    <Route component={NotFound} />
  </Switch>
);
export default AppRouter;
