import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Modal, Select, message } from 'antd';
import { closeDeclInputModal, loadDeclAdvanceParties, computeDeclAdvanceFee } from 'common/reducers/cmsExpense';
import { CMS_DUTY_TAXTYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const colSpan = 6;

@injectIntl
@connect(
  state => ({
    showDeclInputModal: state.cmsExpense.showDeclInputModal,
    declInModal: state.cmsExpense.declInModal,
    declAdvanceParties: state.cmsExpense.declAdvanceParties,
  }),
  { closeDeclInputModal, loadDeclAdvanceParties, computeDeclAdvanceFee }
)
@Form.create()
export default class DeclexpInputModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showDeclInputModal: PropTypes.bool.isRequired,
    declInModal: PropTypes.shape({
      delg_no: PropTypes.string.isRequired,
      entry_id: PropTypes.string.isRequired,
      fee_name: PropTypes.string.isRequired,
      fee_code: PropTypes.string.isRequired,
      is_ciq: PropTypes.bool.isRequired,
    }).isRequired,
    declAdvanceParties: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    loadDeclAdvanceParties: PropTypes.func.isRequired,
    computeDeclAdvanceFee: PropTypes.func.isRequired,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.declInModal !== this.props.declInModal) {
      this.props.loadDeclAdvanceParties(nextProps.declInModal.is_ciq, nextProps.declInModal.delg_no);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = this.props.form.getFieldsValue();
        this.props.computeDeclAdvanceFee({
          entry_id: this.props.declInModal.entry_id,
          disp_id: formData.advance_party_dispid,
          fee_code: this.props.declInModal.fee_code,
          fee_value: formData.amount,
          advance_tax_type: formData.advance_tax_type,
          remark: formData.remark,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.props.closeDeclInputModal();
            this.props.form.resetFields();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.closeDeclInputModal();
    this.props.form.resetFields();
  }

  render() {
    const { form: { getFieldDecorator }, declInModal, declAdvanceParties } = this.props;
    return (
      <Modal title="添加垫付费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.showDeclInputModal} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="报关单号" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }}>
            {declInModal.entry_id}
          </FormItem>
          <FormItem label="费用名称" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }}>
            {declInModal.fee_name}
          </FormItem>
          <FormItem label="代垫方" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required>
            {getFieldDecorator('advance_party_dispid')(<Select>
              {
              declAdvanceParties.map(item => (<Option value={item.id} key={item.id}>{item.name}</Option>))
            }
            </Select>)}
          </FormItem>
          <FormItem label="费用金额" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required>
            {getFieldDecorator('amount', {
              initialValue: '',
            })(<Input type="number" placeholder="请输入金额" addonAfter="元" />)}
          </FormItem>
          <FormItem label="开票" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {
              getFieldDecorator('advance_tax_type', {
                rules: [{ required: true, message: this.msg('advanceTaxTypeRequired'), type: 'number' }],
              })(
                <Select>
                  {
                    CMS_DUTY_TAXTYPE.map(cdt => <Option key={cdt.value} value={cdt.value}>{cdt.text}</Option>)
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem label="垫付备注" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} >
            {getFieldDecorator('remark')(
              <Input type="textarea" rows="3" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
