import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Popconfirm, Popover, Tooltip } from 'antd';
import './index.less';

export default class RowAction extends Component {
  static propTypes = {
    label: PropTypes.any,
    icon: PropTypes.string,
    shape: PropTypes.string,
    onClick: PropTypes.func,
    onHover: PropTypes.func,
    onConfirm: PropTypes.func,
    row: PropTypes.object,
    index: PropTypes.number,
    extra: PropTypes.object,
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
    const { label, primary, danger, overlay, icon, shape } = this.props;
    let type = 'default';
    if (primary) {
      type = 'primary';
    } else if (danger) {
      type = 'danger';
    }
    return overlay ?
    (<Dropdown overlay={overlay} placement="bottomRight" trigger={['click']}>
      <Button shape={shape} size="small"><Icon type="ellipsis" /></Button>
    </Dropdown>)
    :
    (<Button type={type} shape={shape} ghost={primary} size="small" icon={icon} onClick={this.handleClick} onMouseEnter={this.handleHover} className="welo-row-action">
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
    } else {
      return this.renderButton();
    }
  }

  render() {
    const { tooltip } = this.props;
    if (tooltip) {
      return (<Tooltip title={tooltip}>
        {this.renderButtonWrapper()}
      </Tooltip>);
    } else {
      return this.renderButtonWrapper();
    }
  }
}
