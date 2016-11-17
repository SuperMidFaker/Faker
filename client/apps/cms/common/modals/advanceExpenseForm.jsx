import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, InputNumber, Select } from 'antd';
import { loadCurrencies, loadAdvanceParties } from 'common/reducers/cmsExpense';
import { formatMsg } from './message.i18n';
import { CMS_DUTY_TAXTYPE } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(state => ({
  currencies: state.cmsExpense.currencies,
  advanceParties: state.cmsExpense.advanceParties,
  tenantId: state.account.tenantId,
}),
  { loadCurrencies, loadAdvanceParties }
)
export default class AdvanceExpenseForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    labelCol: PropTypes.number.isRequired,
    currencies: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })),
    advanceParties: PropTypes.arrayOf(PropTypes.shape({
      disp_id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })),
    loadCurrencies: PropTypes.func.isRequired,
    loadAdvanceParties: PropTypes.func.isRequired,
  }
  componentWillMount() {
    if (this.props.currencies.length === 0) {
      this.props.loadCurrencies();
    }
    this.props.loadAdvanceParties(this.props.delgNo, this.props.tenantId);
  }
  msg = formatMsg(this.props.intl);
  render() {
    const {
      formhoc: { getFieldDecorator }, labelCol,
      advanceParties, currencies,
    } = this.props;
    const formCols = {
      labelCol: { span: labelCol },
      wrapperCol: { span: 18 - labelCol },
    };
    return (
      <Form horizontal>
        <FormItem {...formCols} label={this.msg('advanceParty')}>
          {
            getFieldDecorator('advance_disp_id', {
              rules: [{ required: true, message: this.msg('advancePartyRequired'), type: 'number' }],
            })(
              <Select>
                {
                  advanceParties.map(ap => <Option key={ap.disp_id} value={ap.disp_id}>{ap.name}</Option>)
                }
              </Select>
            )
          }
        </FormItem>
        <FormItem {...formCols} label={this.msg('advanceFee')}>
          {
            getFieldDecorator('advance_fee', {
              rules: [{ required: true, message: this.msg('advanceFeeRequired'), type: 'number' }],
              initialValue: 0,
            })(
              <InputNumber style={{ width: '100%' }} min={0} />
            )
          }
        </FormItem>
        <FormItem {...formCols} label={this.msg('advanceCurrency')}>
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
    );
  }
}
