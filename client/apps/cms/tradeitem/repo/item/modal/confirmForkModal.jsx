import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Table } from 'antd';
import { toggleConfirmForkModal } from 'common/reducers/cmsTradeitem';

const FormItem = Form.Item;
const { TextArea } = Input;

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    if (formData.srcNos && formData.srcNos.length > 0) {
      init.src_product_no = `${formData.cop_product_no}_${formData.srcNos.length}`;
      let num = 0;
      for (let i = 0; i < formData.srcNos.length; i++) {
        if (formData.srcNos[i] === init.src_product_no) {
          num += 1;
          init.src_product_no = `${formData.cop_product_no}_${formData.srcNos.length + num}`;
          i = 0;
        }
      }
    }
  }
  return init;
}
@connect(
  state => ({
    visible: state.cmsTradeitem.confirmForkModal.visible,
    changes: state.cmsTradeitem.itemMasterChanges,
  }),
  { toggleConfirmForkModal }
)
export default class ConfirmForkModal extends Component {
  static propTypes = {
    onSave: PropTypes.func,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    itemData: PropTypes.shape({ cop_product_no: PropTypes.string }).isRequired,
  }
  state = { fieldInits: {} }
  componentWillReceiveProps(nextProps) {
    if (nextProps.itemData !== this.props.itemData) {
      const fieldInits = getFieldInits(nextProps.itemData);
      this.setState({ fieldInits });
    }
  }

  handleCancel = () => {
    this.props.toggleConfirmForkModal(false);
  }
  handleOk = () => {
    this.props.onSave();
    this.props.toggleConfirmForkModal(false);
  }
  render() {
    const { visible, changes, form: { getFieldDecorator } } = this.props;
    const { fieldInits } = this.state;
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
        title="确认分支归类信息"
        visible={visible}
        width={800}
        maskClosable={false}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <Table size="small" columns={columns} dataSource={changes} rowKey="field" pagination={false} style={{ marginBottom: 24 }} />
        <FormItem label="分支标记">
          {getFieldDecorator('src_product_no', {
            initialValue: fieldInits.src_product_no,
          })(<Input disabled />)}
        </FormItem>
        <FormItem label="备注">
          {getFieldDecorator('remark', {
          })(<TextArea placeholder="说明建立此分支的原因" autosize={{ minRows: 1, maxRows: 4 }} />)}
        </FormItem>
      </Modal>
    );
  }
}
