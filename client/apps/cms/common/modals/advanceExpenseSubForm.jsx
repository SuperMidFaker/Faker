import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select } from 'antd';
import { loadCurrencies, loadAdvanceParties } from 'common/reducers/cmsExpense';
import { formatMsg } from './message.i18n';
import { CMS_DUTY_TAXTYPE } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(state => ({
  currencies: state.cmsExpense.currencies,
  advanceParties: state.cmsExpense.advanceParties,
}),
  { loadAdvanceParties }
)
export default class AdvanceExpenseSubForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired,
    formCols: PropTypes.shape({
      labelCol: PropTypes.shape({ span: PropTypes.number.isRequired }),
      wrapperCol: PropTypes.shape({ span: PropTypes.number.isRequired }),
    }),
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.node,
    currencies: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })),
    advanceParties: PropTypes.arrayOf(PropTypes.shape({
      disp_id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })),
    loadAdvanceParties: PropTypes.func.isRequired,
  }
  componentWillMount() {
    if (this.props.currencies.length === 0) {
      this.props.dispatch(loadCurrencies());
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      this.props.loadAdvanceParties(nextProps.delgNo, nextProps.tenantId);
    }
  }
  msg = formatMsg(this.props.intl);
  render() {
    const {
      formhoc, formhoc: { getFieldDecorator }, formCols, children,
      advanceParties, currencies,
    } = this.props;
    return (
      <Form horizontal form={formhoc}>
        <FormItem {...formCols} label={this.msg('advanceParty')}>
          {
            getFieldDecorator('advance_disp_id', {
              rules: [{ required: true, message: this.msg('advancePartyRequired') }],
            })(
              <Select>
                {
                  advanceParties.map(ap => <Option key={ap.disp_id} value={ap.disp_id}>{ap.name}</Option>)
                }
              </Select>
            )
          }
        </FormItem>
        {children}
        <FormItem {...formCols} label={this.msg('advanceFee')}>
          {
            getFieldDecorator('advance_fee', {
              rules: [{ required: true, message: this.msg('advanceFeeRequired') }],
            })(
              <Input />
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
              rules: [{ required: true, message: this.msg('advanceTaxTypeRequired') }],
            })(
              <Select>
                {
                  CMS_DUTY_TAXTYPE.map(cdt => <Option key={cdt.value} value={cdt.value}>{cdt.text}</Option>)
                }
              </Select>
            )
          }
        </FormItem>
      </Form>
    );
  }
}
