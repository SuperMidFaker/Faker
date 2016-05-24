import React, { Component, PropTypes } from 'react';
import { argumentContainer } from './util';

/*
  Note:
    When this decorator is used, it MUST be the first (outermost) decorator.
    Otherwise, we cannot find and call the fetchers methods.
*/
export default function connectFetch(conn = {deferred: false}) {
  return (...fetchers) => {
    return Wrapped => {
      class WrappedComponent extends Component {
        static propTypes = {
          location: PropTypes.object.isRequired,
          params: PropTypes.object.isRequired
        }
        static contextTypes = {
          store: PropTypes.object.isRequired
        }
        componentDidMount() {
          const { store } = this.context;
          const { location, params } = this.props;
          const promises = fetchers.map(fetcher => fetcher({
            state: store.getState(), dispatch: store.dispatch,
            location, params}));
          Promise.all(promises);
        }

        static deferredfetchers = conn.deferred ? fetchers : [];
        static prefetchers = !conn.deferred ? fetchers : [];

        render() {
          return <Wrapped {...this.props} />;
        }
      }
      return argumentContainer(WrappedComponent, Wrapped, 'Fetch');
    };
  };
}
