import React, { PropTypes } from 'react';
import { Alert, Badge, Breadcrumb, Button, Spin } from 'antd';
import classNames from 'classnames';
import './dock-panel.less';

function noop() {}

export default class DockPanel extends React.Component {
  static defaultProps = {
    prefixCls: 'dock-panel',
    alertType: 'info',
    loading: false,
    currentDepth: 1,
  }
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    size: PropTypes.string,
    title: PropTypes.object || PropTypes.string,
    status: PropTypes.oneOf(['default', 'processing', 'warning', 'error', 'success']),
    statusText: PropTypes.string,
    extra: PropTypes.node,
    children: PropTypes.any,
    loading: PropTypes.bool,
    onClose: PropTypes.func,
    className: PropTypes.string,
    alert: PropTypes.node,
    alertType: PropTypes.string,
    currentDepth: PropTypes.number,
    onForward: PropTypes.func,
    onBackward: PropTypes.func,
  }
  state = {
    depth: this.props.currentDepth,
  }
  componentWillUnmount() {
    window.$(document).unbind('click');
  }
  handleClose = (e) => {
    this.setState({
      closing: false,
    });
    (this.props.onClose || noop)(e);
  }
  handleForward = (e) => {
    this.setState({
      depth: this.state.depth + 1,
    });
    (this.props.onForward || noop)(e);
  }
  handleBackward = (e) => {
    this.setState({
      depth: this.state.depth - 1,
    });
    (this.props.onBackward || noop)(e);
  }

  render() {
    const { prefixCls, size = '', className, visible, title, status, statusText, extra, loading, alert, alertType, children } = this.props;
    const sizeCls = ({
      large: 'lg',
      small: 'sm',
    })[size] || '';
    const classes = classNames(prefixCls, {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-visible`]: visible,
    }, className);
    const maskClasses = classNames(`${prefixCls}-mask`, { [`${prefixCls}-mask-hidden`]: !visible });
    const bodyCls = extra ? `${prefixCls}-body with-header-extra` : `${prefixCls}-body`;
    return (
      <div>
        <div className={maskClasses} onClick={this.handleClose} />
        <div className={classes} id="dock-panel">
          <Spin spinning={loading}>
            <div className={`${prefixCls}-head`}>
              <div className={`${prefixCls}-head-title`}>
                {this.state.depth > 1 && <Button icon="left" onClick={this.handleBackward} />}
                <Breadcrumb>
                  <Breadcrumb.Item>{title}</Breadcrumb.Item>
                </Breadcrumb>
                {status ? <Badge status={status} text={statusText} /> : null}
                <div className={`${prefixCls}-head-close`}>
                  <Button shape="circle" icon="close" onClick={this.handleClose} />
                </div>
              </div>
              {extra ? <div className={`${prefixCls}-head-extra`}>{extra}</div> : null}
            </div>
            <div className={bodyCls}>
              {alert ? <Alert message={alert} type={alertType} /> : null}
              {children}
            </div>
          </Spin>
        </div>
      </div>
    );
  }
}
