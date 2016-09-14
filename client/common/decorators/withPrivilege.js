import React, { Component, PropTypes } from 'react';
import { argumentContainer } from '../util';

export default function withPrivilege({ module, feature }) {
  return (Wrapped) => {
    class WrappedComponent extends Component {
      static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
      }
      componentWillMount() {
        // this.context.store.getState().account.privilege
        if (!(module && feature)) {
          this.context.router.replace('/login');
        }
      }
      componentWillReceiveProps() {
        if (!(module && feature)) {
          this.context.router.replace('/login');
        }
      }
      render() {
        return <Wrapped {...this.props} />;
      }
    }
    return argumentContainer(WrappedComponent, Wrapped, 'WithPrivilege');
  };
}
