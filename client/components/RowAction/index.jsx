import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Popconfirm, Popover, Tooltip } from 'antd';
import './style.less';

export default class RowAction extends Component {
  static defaultProps = {
    size: 'small',
  }
  static propTypes = {
    label: PropTypes.node,
    icon: PropTypes.string,
    shape: PropTypes.string,
    size: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    onHover: PropTypes.func,
    onConfirm: PropTypes.func,
    row: PropTypes.shape({ id: PropTypes.number }),
    index: PropTypes.number,
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
      this.props.onClick(this.props.row, this.props.index, this.props);
    }
  }
  handleHover = () => {
    if (this.props.onHover) {
      this.props.onHover(this.props.row, this.props.index);
    }
  }
  handleConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm(this.props.row, this.props.index);
    }
  }
  renderButton = () => {
    const {
      label, primary, danger, overlay, icon, shape, size, disabled,
    } = this.props;
    let type = 'default';
    if (primary) {
      type = 'primary';
    } else if (danger) {
      type = 'danger';
    }
    return overlay ?
      (<Dropdown overlay={overlay} placement="bottomRight" trigger={['click']}>
        <Button
          shape={shape}
          disabled={disabled}
          size={size}
          className="welo-row-action"
        >
          <Icon type="ellipsis" />
        </Button>
      </Dropdown>)
      :
      (<Button
        type={type}
        shape={shape}
        size={size}
        ghost={primary}
        disabled={disabled}
        icon={icon}
        onClick={this.handleClick}
        onMouseEnter={this.handleHover}
        className="welo-row-action"
      >
        {label}
      </Button>);
  }
  renderButtonWrapper = () => {
    const { confirm, popover } = this.props;
    if (confirm) {
      return (<Popconfirm title={confirm} placement="left" onConfirm={this.handleConfirm} okText="是" cancelText="否">
        {this.renderButton()}
      </Popconfirm>);
    } else if (popover) {
      return (<Popover trigger="click" content={popover} placement="left">
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
