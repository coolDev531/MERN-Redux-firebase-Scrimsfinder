import { createStore } from 'redux';
import rootReducer from '../reducers/root.reducer';

export default function configureStore() {
  const store = createStore(
    rootReducer, // will give us access to reducer and initial state.
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // enable redux devtools
  );

  window.store = store; // be able to console.log store by typing store at console (dev only)

  return store;
}
