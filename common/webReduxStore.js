import createReduxStore from './createReduxStore';
import rootReducers from './reducers';

export default function configureStore(initialState, initialReq) {
  const store = createReduxStore(initialState, rootReducers, initialReq);
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
