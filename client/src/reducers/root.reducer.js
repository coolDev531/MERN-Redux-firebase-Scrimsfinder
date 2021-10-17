import { combineReducers } from 'redux';

import auth from './auth.reducer';
import alerts from './alerts.reducer';
import scrims from './scrims.reducer';
import users from './users.reducer';
import general from './general.reducer';
import messenger from './messenger.reducer';
import socket from './socket.reducer';

// this reducer combines all other specific reducers.
export default combineReducers({
  auth,
  alerts,
  scrims,
  users,
  general,
  socket,
  messenger,
});
