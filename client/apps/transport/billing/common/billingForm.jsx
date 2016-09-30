import React, { PropTypes } from 'react';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { updateBilling, loadPartners } from 'common/reducers/transportBilling';
import { PARTNERSHIP_TYPE_INFO } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const firstDay = new Date();
firstDay.setDate(1);
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partners: state.transportBilling.partners,
  }),
  { updateBilling, loadPartners }
)
@Form.create()
export default class BillingForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    nextStep: PropTypes.func.isRequired,
    updateBilling: PropTypes.func.isRequired,
    loadPartners: PropTypes.func.isRequired,
    partners: PropTypes.array.isRequired,
  }
  state = {
    beginDate: firstDay,
    endDate: new Date(),
    name: '',
    chooseModel: '',
    partnerId: -1,
    partnerName: '',
  }
  componentWillMount() {
    let partnerShipType = PARTNERSHIP_TYPE_INFO.customer;
    if (this.props.type === 'receivable') {
      partnerShipType = PARTNERSHIP_TYPE_INFO.customer;
    } else if (this.props.type === 'payable') {
      partnerShipType = PARTNERSHIP_TYPE_INFO.transportation;
    }
    this.props.loadPartners(this.props.tenantId, partnerShipType);
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  nextStep = () => {
    const fieldsValue = this.props.form.getFieldsValue();
    const { beginDate, endDate } = this.state;
    if (!fieldsValue.name) {
      message.error(this.msg('namePlaceholder'));
    } else if (!fieldsValue.partnerId) {
      message.error(this.msg('partnerPlaceholder'));
    } else if (!fieldsValue.chooseModel) {
      message.error(this.msg('chooseModelPlaceholder'));
    } else if (!beginDate || !endDate) {
      message.error(this.msg('rangePlaceholder'));
    } else {
      const partner = this.props.partners.find(item => item.partner_id === fieldsValue.partnerId);
      const partnerName = partner.name;
      this.props.updateBilling({ ...fieldsValue, partnerName, beginDate, endDate });
      this.props.nextStep();
    }
  }
  handleDateChange = (dates) => {
    this.setState({
      beginDate: dates[0],
      endDate: dates[1],
    });
  }
  render() {
    const { form: { getFieldProps }, partners } = this.props;
    const { beginDate, endDate, name, chooseModel, partnerId } = this.state;
    return (
      <div>
        <header className="top-bar">
          <div className="tools">
            <Button type="primary" onClick={this.nextStep}>{this.msg('nextStep')}</Button>
          </div>
          <span>{this.msg('createBilling')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
            </div>
            <div className="panel-body">
              <Form style={{ padding: '70px 20%' }}>
                

                <FormItem
                  id="select"
                  label={this.msg('partner')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                >
                  <Select id="select" size="large"
                    {...getFieldProps('partnerId')}
                  >
                    {
                      partners.map(pt => (
                        <Option searched={`${pt.partner_code}${pt.name}`}
                          value={pt.partner_id} key={pt.partner_id}
                        >
                        {pt.name}
                        </Option>)
                      )
                    }
                  </Select>
                </FormItem>
                <FormItem
                  id="select"
                  label={this.msg('chooseModel')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                >
                  <Select id="select" size="large"
                    {...getFieldProps('chooseModel')}
                  >
                    <Option value="pickupEstDate">{this.msg('pickupEstDate')}</Option>
                    <Option value="deliverEstDate">{this.msg('deliverEstDate')}</Option>
                    <Option value="pickupActDate">{this.msg('pickupActDate')}</Option>
                    <Option value="deliverActDate">{this.msg('deliverActDate')}</Option>
                  </Select>
                </FormItem>
                <FormItem
                  id="control-input"
                  label={this.msg('range')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                >
                  <RangePicker value={[beginDate, endDate]} onChange={this.handleDateChange} />
                </FormItem>
                <FormItem
                  id="control-input"
                  label={this.msg('billingName')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                >
                  <Input id="control-input" placeholder={this.msg('namePlaceholder')}
                    {...getFieldProps('name', {
                      initialValue: name,
                    })}
                  />
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
