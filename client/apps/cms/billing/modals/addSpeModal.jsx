import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, Form, Select } from 'antd';
import { toggleAddSpeModal, addSpe } from 'common/reducers/cmsExpense';
import { loadAllFeeGroups } from 'common/reducers/bssFeeSettings';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    visible: state.cmsExpense.addSpeModal.visible,
    allFeeGroups: state.bssFeeSettings.allFeeGroups,
  }),
  { toggleAddSpeModal, addSpe, loadAllFeeGroups }
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
  componentDidMount() {
    this.props.loadAllFeeGroups();
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
    const { form: { getFieldDecorator }, visible, allFeeGroups } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newSpecialFee')}
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
          <FormItem label={this.msg('feeGroup')} {...formItemLayout}>
            {getFieldDecorator('fee_group', {
              rules: [{ required: true, message: '费用分组必填' }],
            })(<Select showSearch optionFilterProp="children" style={{ width: '100%' }}>
              {allFeeGroups.map(data =>
              (<Option key={data.fee_group_code} value={data.fee_group_code}>
                {`${data.fee_group_code}|${data.fee_group_name}`}
              </Option>))}
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('remark')} {...formItemLayout}>
            {getFieldDecorator('remark')(<Input />)}
          </FormItem>
        </div>
      </Modal>
    );
  }
}

