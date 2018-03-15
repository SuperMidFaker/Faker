import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, Form } from 'antd';
import { toggleAddSpeModal, addSpe } from 'common/reducers/cmsExpense';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    visible: state.cmsExpense.addSpeModal.visible,
    feeGroupslist: state.bssFeeSettings.feeGroupslist,
  }),
  { toggleAddSpeModal, addSpe }
)
@Form.create()
export default class AddSpeModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    expenseNo: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleAddSpeModal(false);
  }
  handleOk = () => {
    const { expenseNo } = this.props;
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.addSpe(values, expenseNo).then((result) => {
          if (!result.error) {
            this.props.reload(expenseNo);
            this.handleCancel();
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newSpe')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <div>
          <FormItem label={this.msg('speName')} {...formItemLayout}>
            {getFieldDecorator('fee_name', {
              rules: [{ required: true, message: '费用名称必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('origAmount')} {...formItemLayout}>
            {getFieldDecorator('orig_amount', {
              rules: [{ required: true, message: '费用金额必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('remark')} {...formItemLayout}>
            {getFieldDecorator('remark')(<Input />)}
          </FormItem>
        </div>
      </Modal>
    );
  }
}

