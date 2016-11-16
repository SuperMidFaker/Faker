import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Modal, Select } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { closeDeclInputModal } from 'common/reducers/cmsExpense';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    showDeclInputModal: state.cmsExpense.showDeclInputModal,
    declInModal: state.cmsExpense.declInModal,
    fees: state.transportTariff.fees,
  }),
  { closeDeclInputModal }
)
@Form.create()
export default class DeclexpInputModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    showDeclInputModal: PropTypes.bool.isRequired,
    declInModal: PropTypes.object.isRequired,
    fees: PropTypes.array.isRequired,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {

  }
  handleCancel = () => {
    this.props.closeDeclInputModal();
  }

  render() {
    const { form: { getFieldDecorator }, declInModal } = this.props;
    let feeName = '';
    if (declInModal.feecode.indexOf('hgcy') !== -1) {
      feeName = '海关查验场地费';
    } else if (declInModal.feecode.indexOf('pzcy') !== -1) {
      feeName = '品质查验场地费';
    } else if (declInModal.feecode.indexOf('dj') !== -1) {
      feeName = '动检场地费';
    }
    const colSpan = 6;
    return (
      <Modal title="添加垫付费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.showDeclInputModal} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="报关单号" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }}>
            { declInModal.entryId }
          </FormItem>
          <FormItem label="费用名称" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }}>
            { feeName }
          </FormItem>
          <FormItem label="代垫方" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('type')(<Select placeholder="请选择垫付方">
              {
              this.props.fees.map(item => (<Option value={item.fee_code}>{item.fee_name}</Option>))
            }
            </Select>)}
          </FormItem>
          <FormItem label="费用金额" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('amount', {
              initialValue: '',
            })(<Input type="number" placeholder="请输入金额" addonAfter="元" />)}
          </FormItem>
          <FormItem label="开票" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('type')(<Select placeholder="请选择开票类型">
              {
              this.props.fees.map(item => (<Option value={item.fee_code}>{item.fee_name}</Option>))
            }
            </Select>)}
          </FormItem>
          <FormItem label="垫付备注" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} >
            {getFieldDecorator('remark', {
              initialValue: '',
            })(
              <Input type="textarea" id="control-textarea" rows="3" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
