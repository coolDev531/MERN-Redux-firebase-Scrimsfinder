import { combineReducers } from 'redux';

import auth from './auth.reducer';
import alerts from './alerts.reducer';
import scrims from './scrims.reducer';
import general from './general.reducer';

// this reducer combines all other specific reducers.
export default combineReducers({
  auth,
  alerts,
  scrims,
  general,
});
