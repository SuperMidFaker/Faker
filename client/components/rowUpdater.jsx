import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Popconfirm, Tooltip } from 'antd';

export default class RowUpdater extends Component {
  static propTypes = {
    label: PropTypes.any,
    onClick: PropTypes.func,
    onHover: PropTypes.func,
    onConfirm: PropTypes.func,
    row: PropTypes.object,
    index: PropTypes.number,
    extra: PropTypes.object,
    tooltip: PropTypes.string,
    confirm: PropTypes.string,
    primary: PropTypes.bool,
    overlay: PropTypes.node,
  }
  handleClick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.props.onClick) {
      this.props.onClick(this.props.row, this.props.index);
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
    const { label, onClick, onHover, row, index, tooltip, primary, overlay, ...extra } = this.props;
    const type = primary ? 'primary' : 'default';
    return overlay ?
    (<Dropdown overlay={overlay} placement="bottomRight">
      <Button size="small"><Icon type="ellipsis" /></Button>
    </Dropdown>)
    :
    (<Button type={type} ghost={primary} size="small" onClick={this.handleClick} onMouseEnter={this.handleHover} {...extra}>
      {label}
    </Button>);
  }
  renderButtonWrapper = () => {
    const { confirm } = this.props;
    return confirm ?
    (<Popconfirm title={confirm} placement="left" onConfirm={this.handleConfirm} >
      {this.renderButton()}
    </Popconfirm>)
    :
    this.renderButton();
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
