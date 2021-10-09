import { createStore } from 'redux';
import rootReducer from '../reducers/root.reducer';

export default function configureStore() {
  const store = createStore(
    rootReducer // will give us access to reducer and initial state.
  );

  return store;
}
