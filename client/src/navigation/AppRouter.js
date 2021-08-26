import { Switch, Route } from 'react-router-dom';
import Intro from '../screens/Intro';
import Scrims from '../screens/Scrims';
import ScrimCreate from '../screens/ScrimCreate';
import PrivateRoute from './PrivateRoute';

const AppRouter = () => (
  <Switch>
    <PrivateRoute exact path="/" component={Scrims} />
    <PrivateRoute exact path="/scrims/new" component={ScrimCreate} />
    <Route path="/user-setup" component={Intro} />
  </Switch>
);
export default AppRouter;
