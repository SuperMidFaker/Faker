import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'react-redux';
import { toggleTradeItemModal } from 'common/reducers/cmsPermit';


@connect(
  state => ({
    visible: state.cmsPermit.tradeItemModal.visible,
  }),
  { toggleTradeItemModal }
)
export default class PermitItemModal extends Component {
  state = {
  }
  handleCancel = () => {
    this.props.toggleTradeItemModal(false);
  }
  handleChange = () => {
  }
  handleOk = () => {
  }
  render() {
    return (
      <Modal title="tradeItems" visible={this.props.visible} onCancel={this.handleCancel} onOk={this.handleOk} />
    );
  }
}
