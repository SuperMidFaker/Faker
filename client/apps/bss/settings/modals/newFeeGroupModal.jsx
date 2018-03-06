import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message } from 'antd';
import { toggleNewFeeGroupModal, addFeeGroup } from 'common/reducers/bssSettings';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@injectIntl
@connect(
  state => ({
    visible: state.bssSettings.visibleNewFeeGModal,
    feeGroups: state.bssSettings.feeGroupslist.data,
  }),
  { toggleNewFeeGroupModal, addFeeGroup }
)
@Form.create()
export default class NewFeeGroupModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleNewFeeGroupModal(false);
  }
  handleOk = () => {
    const data = this.props.form.getFieldsValue();
    const repeat = this.props.feeGroups.filter(gp => gp.fee_group_code === data.fee_group_code)[0];
    if (repeat) {
      message.error('费用分组代码已存在，请勿重复添加', 6);
    } else {
      this.props.addFeeGroup({
        groupCode: data.fee_group_code,
        groupName: data.fee_group_name,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else {
          this.props.toggleNewFeeGroupModal(false);
          this.props.reload();
        }
      });
    }
  }

  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newFeeGroup')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="分组代码" {...formItemLayout} >
            {getFieldDecorator('fee_group_code', {
              rules: [{ required: true }],
            })(<Input />)}
          </FormItem>
          <FormItem label="分组名称" {...formItemLayout}>
            {getFieldDecorator('fee_group_name', {
              rules: [{ required: true }],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
