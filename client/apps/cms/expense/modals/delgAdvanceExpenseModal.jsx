import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import { loadCurrencies, loadAdvanceParties, closeAdvanceFeeModal,
  loadDelgAdvanceFee, computeDelgAdvanceFee } from 'common/reducers/cmsExpense';
import { CMS_DUTY_TAXTYPE } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const labelCol = 6;

@injectIntl
@connect(state => ({
  visible: state.cmsExpense.advanceFeeModal.visible,
  fees: state.cmsExpense.advanceFeeModal.fees,
  currencies: state.cmsExpense.currencies,
  advanceParties: state.cmsExpense.advanceParties,
}),
  { loadCurrencies, loadAdvanceParties, closeAdvanceFeeModal, loadDelgAdvanceFee, computeDelgAdvanceFee })
@Form.create()
export default class DelgAdvanceExpenseModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string,
    visible: PropTypes.bool.isRequired,
    fees: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })),
    currencies: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })),
    advanceParties: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      dispIds: PropTypes.arrayOf(PropTypes.number).isRequired,
      name: PropTypes.string.isRequired,
    })),
    loadCurrencies: PropTypes.func.isRequired,
    loadAdvanceParties: PropTypes.func.isRequired,
    closeAdvanceFeeModal: PropTypes.func.isRequired,
    loadDelgAdvanceFee: PropTypes.func.isRequired,
    computeDelgAdvanceFee: PropTypes.func.isRequired,
  }
  componentWillMount() {
    if (this.props.currencies.length === 0) {
      this.props.loadCurrencies();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      this.props.loadAdvanceParties(nextProps.delgNo);
    }
  }
  msg = formatMsg(this.props.intl)
  handlePartyChange = (value) => {
    const dispIds = this.props.advanceParties.filter(ap => ap.key === value)[0].dispIds;
    this.props.loadDelgAdvanceFee(dispIds);
  }
  handleCancel = () => {
    this.props.closeAdvanceFeeModal();
    this.props.form.resetFields();
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = this.props.form.getFieldsValue();
        this.props.computeDelgAdvanceFee(formData).then((result) => {
          if (!result.error) {
            this.props.closeAdvanceFeeModal();
            this.props.form.resetFields();
          }
        });
      }
    });
  }
  render() {
    const { advanceParties, currencies, visible, delgNo, fees, form: { getFieldDecorator } } = this.props;
    const formCols = {
      labelCol: { span: labelCol },
      wrapperCol: { span: 18 - labelCol },
    };
    return (
      <Modal title={this.msg('advanceFee')} onOk={this.handleOk}
        onCancel={this.handleCancel} visible={visible}
      >
        <Form horizontal>
          <FormItem label={this.msg('delgNo')} {...formCols}>
            <Input value={delgNo} readOnly />
          </FormItem>
          <FormItem {...formCols} label={this.msg('advanceParty')}>
            {
              getFieldDecorator('advance_party_key', {
                rules: [{ required: true, message: this.msg('advancePartyRequired') }],
                onChange: this.handlePartyChange,
              })(
                <Select>
                  {
                    advanceParties.map(ap => <Option key={ap.key} value={ap.key}>{ap.name}</Option>)
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem label={this.msg('feeName')} {...formCols}>
            {
              getFieldDecorator('fee_code', {
                rules: [{ required: true, message: '费用类型必选' }],
              })(
                <Select>
                  {
                    fees.map(fee => <Option key={fee.code} value={fee.code}>{fee.name}</Option>)
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem {...formCols} label={this.msg('feeVal')}>
            {
              getFieldDecorator('advance_fee', {
                rules: [{ required: true, message: this.msg('advanceFeeRequired'), type: 'number' }],
                initialValue: 0,
              })(
                <InputNumber style={{ width: '100%' }} min={0} />
              )
            }
          </FormItem>
          <FormItem {...formCols} label={this.msg('currency')}>
            {
              getFieldDecorator('advance_curr')(
                <Select>
                  {
                    currencies.map(curr => <Option key={curr.curr_code} value={curr.curr_code}>{curr.curr_name}</Option>)
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem {...formCols} label={this.msg('advanceTaxType')}>
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
          <FormItem label={this.msg('remark')} {...formCols}>
            {getFieldDecorator('remark')(
              <Input type="textarea" rows="3" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
