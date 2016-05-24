import React, { Component, PropTypes } from 'react';
import { argumentContainer } from '../util';

/**
 * 高阶组件状态迁移周期componentDidMount在客户端加载完成时,一般用于显示固定导航标题
 * componentWillReceiveProps在客户端设置props变化后导航信息
 */
export default function connectNav(navCallback) {
  return Wrapped => {
    class WrappedComponent extends Component {
      static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: PropTypes.object.isRequired
      }
      componentDidMount() {
        navCallback(
          this.props, this.context.store.dispatch,
          this.context.router, 'componentDidMount'
        );
      }
      componentWillReceiveProps(nextProps) {
        navCallback(
          nextProps, this.context.store.dispatch,
          this.context.router, 'componentWillReceiveProps'
        );
      }
      render() {
        return <Wrapped {...this.props} />;
      }
    }
    return argumentContainer(WrappedComponent, Wrapped, 'Nav');
  };
}
