import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, Input, Select, DatePicker, message, Modal } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadPartners } from 'common/reducers/transportBilling';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partners: state.transportBilling.partners,
  }),
  { loadPartners }
)
@Form.create()
export default class BillingForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    loadPartners: PropTypes.func.isRequired,
    partners: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    beginDate: new Date().setDate(1),
    endDate: new Date(),
    name: '',
    chooseModel: '',
    partnerId: -1,
    partnerName: '',
  }
  componentWillMount() {
    let roles = [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS];
    const businessTypes = [PARTNER_BUSINESSE_TYPES.transport];
    if (this.props.type === 'receivable') {
      roles = [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS];
    } else if (this.props.type === 'payable') {
      roles = [PARTNER_ROLES.SUP];
    }
    this.props.loadPartners(this.props.tenantId, roles, businessTypes);
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleOk = () => {
    const fieldsValue = this.props.form.getFieldsValue();
    const { beginDate, endDate } = this.state;
    if (!fieldsValue.name) {
      message.error(this.msg('namePlaceholder'));
    } else if (fieldsValue.partnerId === undefined) {
      message.error(this.msg('partnerPlaceholder'));
    } else if (!fieldsValue.chooseModel) {
      message.error(this.msg('chooseModelPlaceholder'));
    } else if (!beginDate || !endDate) {
      message.error(this.msg('rangePlaceholder'));
    } else {
      const partner = this.props.partners.find(item => item.partner_id === fieldsValue.partnerId);
      const partnerName = partner.name;
      const partnerTenantId = partner.tid;
      this.context.router.push({
        pathname: `/transport/billing/${this.props.type}/create`,
        query: {
          ...fieldsValue,
          partnerName,
          partnerTenantId,
          beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
          endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
        },
      });
    }
  }
  handleCancel = () => {
    this.props.toggle();
  }
  handleDateChange = (dates) => {
    this.setState({
      beginDate: dates[0].toDate(),
      endDate: dates[1].toDate(),
    });
  }
  render() {
    const { form: { getFieldDecorator }, partners, visible } = this.props;
    const { beginDate, endDate, name } = this.state;
    return (
      <Modal maskClosable={false} visible={visible} title={`${this.msg(this.props.type)}${this.msg('billing')}`}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem
            id="select"
            label={this.msg('partner')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {getFieldDecorator('partnerId')(
              <Select id="select"
                showSearch
                placeholder=""
                optionFilterProp="children"
                notFoundContent=""
              >
                {
                  partners.map(pt => (
                    <Option searched={`${pt.partner_code}${pt.name}`}
                      value={pt.partner_id} key={pt.partner_id}
                    >
                      {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                    </Option>)
                  )
                }
              </Select>
            )}
          </FormItem>
          <FormItem
            id="select"
            label={this.msg('chooseModel')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {getFieldDecorator('chooseModel')(
              <Select id="select" >
                <Option value="pickupEstDate">{this.msg('pickupEstDate')}</Option>
                <Option value="deliverEstDate">{this.msg('deliverEstDate')}</Option>
                <Option value="pickupActDate">{this.msg('pickupActDate')}</Option>
                <Option value="deliverActDate">{this.msg('deliverActDate')}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            id="control-input"
            label={this.msg('range')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            <RangePicker value={[moment(beginDate), moment(endDate)]} onChange={this.handleDateChange} />
          </FormItem>
          <FormItem
            id="control-input"
            label={this.msg('billingName')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {getFieldDecorator('name', {
              initialValue: name,
            })(
              <Input id="control-input" placeholder={this.msg('namePlaceholder')} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
