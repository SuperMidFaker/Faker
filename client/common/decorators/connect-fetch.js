import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { argumentContainer } from '../util';

/*
  Note:
    When this decorator is used, it MUST be the first (outermost) decorator.
    Otherwise, we cannot find and call the fetchers methods.
*/
export default function connectFetch(conn = { deferred: false }) {
  return (...fetchers) => (Wrapped) => {
    class WrappedComponent extends Component {
      static propTypes = {
        location: PropTypes.object,
        params: PropTypes.object,
      }
      static contextTypes = {
        store: PropTypes.object.isRequired,
      }

      static deferredfetchers = conn.deferred ? fetchers : [];
      static prefetchers = !conn.deferred ? fetchers : [];

      componentDidMount() {
        const { store } = this.context;
        const { location, params } = this.props;
        const promises = fetchers.map(fetcher => fetcher({
          state: store.getState(),
          dispatch: store.dispatch,
          location,
          params,
        }));
        Promise.all(promises);
      }

      render() {
        return <Wrapped {...this.props} />;
      }
    }
    return argumentContainer(WrappedComponent, Wrapped, 'Fetch');
  };
}
