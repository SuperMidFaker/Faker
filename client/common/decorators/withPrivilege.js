/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { argumentContainer } from '../util';

export function hasPermission(privileges, { module, feature, action }) {
  if (privileges[module] === true) {
    return true;
  } else if (privileges[module]) {
    if (!feature) {
      return true;
    } else if (privileges[module][feature] === true) {
      return true;
    } else if (!privileges[module][feature]) {
      return false;
    } else if (action) {
      return !!privileges[module][feature][action];
    } else {
      return true;
    }
  } else {
    return false;
  }
}

export default function withPrivilege({ module, feature, actionFn }) {
  return (Wrapped) => {
    class WrappedComponent extends Component {
      static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
      }
      componentWillMount() {
        const action = actionFn ? actionFn(this.props) : undefined;
        if (!hasPermission(
          this.context.store.getState().account.privileges,
          { module, feature, action })) {
          this.context.router.replace('/login');
        }
      }
      componentWillReceiveProps() {
        const action = actionFn ? actionFn(this.props) : undefined;
        if (!hasPermission(
          this.context.store.getState().account.privileges,
          { module, feature, action })) {
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

export class PrivilegeCover extends React.Component {
  static propTypes = {
    module: PropTypes.string.isRequired,
    feature: PropTypes.string,
    action: PropTypes.string,
    children: PropTypes.node,
  }
  static contextTypes = {
    store: PropTypes.object.isRequired,
  }
  render() {
    const privileges = this.context.store.getState().account.privileges;
    const { module, feature, action } = this.props;
    if (hasPermission(privileges, { module, feature, action })) {
      return this.props.children;
    } else {
      return null;
    }
  }
}
