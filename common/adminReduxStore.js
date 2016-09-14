import createReduxStore from './createReduxStore';
import rootReducers from './adminReducers';

export default function configureStore(initialState, initialReq) {
  const store = createReduxStore(initialState, rootReducers, initialReq);
  if (module.hot) {
    module.hot.accept('./adminReducers', () => {
      const nextRootReducer = require('./adminReducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
