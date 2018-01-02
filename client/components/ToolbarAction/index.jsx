import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Popconfirm, Popover, Tooltip } from 'antd';
import './index.less';

export default class ToolbarAction extends Component {
  static propTypes = {
    label: PropTypes.string,
    icon: PropTypes.string,
    shape: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    onConfirm: PropTypes.func,
    tooltip: PropTypes.string,
    confirm: PropTypes.string,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    overlay: PropTypes.node,
    popover: PropTypes.node,
  }
  handleClick = (ev) => {
    if (this.props.onClick) {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onClick();
    }
  }
  handleConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  }
  renderButton = () => {
    const {
      label, primary, danger, overlay, icon, shape, disabled,
    } = this.props;
    let type = 'default';
    if (primary) {
      type = 'primary';
    } else if (danger) {
      type = 'danger';
    }
    return overlay ?
      (<Dropdown overlay={overlay} placement="bottom">
        <Button disabled={disabled} className="welo-toolbar-action">
          <Icon type="export" />{label} <Icon type="down" />
        </Button>
      </Dropdown>)
      :
      (<Button
        type={type}
        shape={shape}
        ghost={primary}
        disabled={disabled}
        icon={icon}
        onClick={this.handleClick}
        className="welo-toolbar-action"
      >
        {label}
      </Button>);
  }
  renderButtonWrapper = () => {
    const { confirm, popover } = this.props;
    if (confirm) {
      return (<Popconfirm title={confirm} placement="bottom" onConfirm={this.handleConfirm} okText="是" cancelText="否">
        {this.renderButton()}
      </Popconfirm>);
    } else if (popover) {
      return (<Popover trigger="click" content={popover} placement="bottom">
        {this.renderButton()}
      </Popover>);
    }
    return this.renderButton();
  }

  render() {
    const { tooltip } = this.props;
    if (tooltip) {
      return (<Tooltip title={tooltip}>
        {this.renderButtonWrapper()}
      </Tooltip>);
    }
    return this.renderButtonWrapper();
  }
}
