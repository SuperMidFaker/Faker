import React, { Component, PropTypes } from 'react';
import { routerShape } from 'react-router';
import { setNavTitle } from 'common/reducers/navbar';
import { DEFAULT_MODULES } from 'common/constants';
import { argumentContainer } from '../util';

/**
 * 高阶组件状态迁移周期componentDidMount在客户端加载完成时,一般用于显示固定导航标题
 * componentWillReceiveProps在客户端设置props变化后导航信息
 */
export default function connectNav({ depth, text, moduleName, lifecycle = 'componentDidMount', until }) {
  return (Wrapped) => {
    class WrappedComponent extends Component {
      static contextTypes = {
        router: routerShape.isRequired,
        store: PropTypes.object.isRequired,
      }
      componentDidMount() {
        this.fireUpon(this.props, 'componentDidMount');
      }
      componentWillReceiveProps(nextProps) {
        this.fireUpon(nextProps, 'componentWillReceiveProps');
      }
      fireUpon(props, cycle) {
        if (lifecycle === cycle && !this.fired) {
          if (until !== undefined) {
            const eventually = typeof until === 'function' ? !!until(props) : until;
            if (eventually) {
              this.fired = true;
            } else {
              return;
            }
          }
          this.context.store.dispatch(setNavTitle({
            depth,
            text: typeof text === 'function' ? text(props) : text || DEFAULT_MODULES[moduleName].text,
            moduleName,
            goBackFn: depth === 3 ? () => this.context.router.goBack() : undefined,
            // router.goBack won't work on initial login next
          }));
        }
      }
      fired = false
      render() {
        return <Wrapped {...this.props} />;
      }
    }
    return argumentContainer(WrappedComponent, Wrapped, 'Nav');
  };
}
