import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Checkbox, Modal, Table } from 'antd';
import { toggleConfirmChangesModal } from 'common/reducers/cmsTradeitem';

@connect(
  state => ({
    visible: state.cmsTradeitem.confirmChangesModal.visible,
    changes: state.cmsTradeitem.itemMasterChanges,
  }),
  { toggleConfirmChangesModal }
)
export default class ConfirmChangesModal extends Component {
  static propTypes = {
    onSave: PropTypes.func,
  }

  handleCancel = () => {
    this.props.toggleConfirmChangesModal(false);
  }
  handleOk = () => {
    this.props.onSave();
    this.props.toggleConfirmChangesModal(false);
  }
  render() {
    const { visible, changes } = this.props;
    const columns = [{
      title: '字段',
      dataIndex: 'field',
      width: 80,
    }, {
      title: '变更前',
      dataIndex: 'before',
    }, {
      title: '变更后',
      dataIndex: 'after',
    }];
    return (
      <Modal
        title="确认变更归类信息"
        visible={visible}
        width={800}
        maskClosable={false}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <Table size="middle" columns={columns} dataSource={changes} rowKey="field" pagination={false} />
        <Checkbox>启用历史版本(仅用于保税库存出库申报)</Checkbox>
      </Modal>
    );
  }
}
