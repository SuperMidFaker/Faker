import { compose, createStore, applyMiddleware } from 'redux';
import requester from 'common/reduxMiddlewares/requester';
import rootReducers from './reducers';

function createReduxStore(initialState, rootReducer) {
  let createMiddlewaredStore;
  const client = requester();
  if (__DEV__ && __DEVTOOLS__) {
    const ReduxDevTool = require('../client/components/redux-devtool');
    const composers = [ReduxDevTool.instrument()];
    createMiddlewaredStore = compose(applyMiddleware(client), ...composers)(createStore);
  } else {
    createMiddlewaredStore = applyMiddleware(client)(createStore);
  }
  const store = createMiddlewaredStore(rootReducer, initialState);

  return store;
}


export default function configureStore (initialState) {
  const store = createReduxStore(initialState, rootReducers);
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
