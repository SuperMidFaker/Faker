import React, { PropTypes } from 'react';
import { Badge, Spin } from 'antd';
import classNames from 'classnames';

function noop() {}

export default class DockPanel extends React.Component {
  static defaultProps = {
    prefixCls: 'dock-panel',
    loading: false,
  }
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    size: PropTypes.string,
    title: PropTypes.object,
    status: PropTypes.oneOf(['default', 'processing', 'warning', 'error', 'success']),
    statusText: PropTypes.string,
    toolbar: PropTypes.node,
    extra: PropTypes.node,
    children: PropTypes.any,
    loading: PropTypes.bool,
    onClose: PropTypes.func,
    className: PropTypes.string,
  }
  componentDidMount() {
    window.$(document).click((event) => {
      const dockPanelClicked = window.$(event.target).closest('#dock-panel').length > 0;
      if (!dockPanelClicked) {
        this.handleClose();
      }
    });
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

  render() {
    const { prefixCls, size = '', className, visible, title, status, statusText, toolbar, extra, loading, children } = this.props;
    const sizeCls = ({
      large: 'lg',
      small: 'sm',
    })[size] || '';
    const classes = classNames(prefixCls, {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-visible`]: visible,
    }, className);

    const closer = (
      <button onClick={this.handleClose} aria-label="Close" className="ant-modal-close">
        <span className="ant-modal-close-x" />
      </button>);
    const bodyCls = extra ? `${prefixCls}-body with-header-extra` : `${prefixCls}-body`;
    return (
      <div className={classes} id="dock-panel">
        <Spin spinning={loading}>
          <div className={`${prefixCls}-header`}>
            <span className="title">{title}</span>
            {status ? <span><Badge status={status} text={statusText} /></span> : null}
            <div className="pull-right">
              {toolbar ? <div className={`${prefixCls}-toolbar`}>{toolbar}</div> : null}
              {closer}
            </div>
            {extra ? <div className={`${prefixCls}-extra`}>{extra}</div> : null}
          </div>
          <div className={bodyCls}>
            {children}
          </div>
        </Spin>
      </div>
    );
  }
}
