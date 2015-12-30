import createReduxStore from '../../reusable/domains/bootstrap/create-redux-store';
import rootReducer from './reducers/combiner';

export default function configureStore (initialState) {
  const store = createReduxStore(initialState, rootReducer, []);
  if (module.hot) {
    module.hot.accept('./reducers/combiner', () => {
      const nextRootReducer = require('./reducers/combiner');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
