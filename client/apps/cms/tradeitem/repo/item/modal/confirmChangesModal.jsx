import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Checkbox, Form, Input, Modal, Table } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { toggleConfirmChangesModal } from 'common/reducers/cmsTradeitem';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { TextArea } = Input;

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
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.toggleConfirmChangesModal(false);
  }
  handleOk = () => {
    this.props.onSave();
    this.props.toggleConfirmChangesModal(false);
  }
  render() {
    const { visible, changes, form: { getFieldDecorator } } = this.props;
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
        <Table size="small" columns={columns} dataSource={changes} rowKey="field" pagination={false} style={{ marginBottom: 24 }} />
        <FormItem label="备注">
          {getFieldDecorator('remark', {
          })(<TextArea placeholder="说明此次变更的原因" autosize={{ minRows: 1, maxRows: 4 }} />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('reserved', {
          })(<Checkbox>保留历史版本(仅用于保税库存出库申报)</Checkbox>)}
        </FormItem>
      </Modal>
    );
  }
}
