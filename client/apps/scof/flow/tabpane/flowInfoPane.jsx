import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Form, Input, Select, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateFlowInfo, loadFlowList, openFlow } from 'common/reducers/scofFlow';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@Form.create()
@connect(
  state => ({
    customerPartners: state.partner.partners,
    currentFlow: state.scofFlow.currentFlow,
    listFilter: state.scofFlow.listFilter,
    flowList: state.scofFlow.flowList,
  }),
  { updateFlowInfo, loadFlowList, openFlow }
)
export default class InfoPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)

  handleSave = () => {
    const data = this.props.form.getFieldsValue();
    const { customerPartners, currentFlow } = this.props;
    const partner = customerPartners.find(cp => cp.id === Number(data.customer));
    if (partner) {
      this.props.form.setFieldsValue({
        customer: partner.name,
      });
      this.props.updateFlowInfo(
        data.name, partner.partner_tenant_id,
        partner.id, partner.name, currentFlow.id
      ).then((result) => {
        if (!result.error) {
          message.success('保存成功');
          this.props.loadFlowList({
            filter: JSON.stringify(this.props.listFilter),
            pageSize: this.props.flowList.pageSize,
            current: this.props.flowList.current,
          }).then((re) => {
            if (re.error) {
              const flow = re.data.find(da => da.id === currentFlow.id);
              this.props.openFlow(flow);
            }
          });
        }
      });
    } else {
      this.props.updateFlowInfo(data.name, -1, -1, data.customer || '', currentFlow.id).then((result) => {
        if (!result.error) {
          message.success('保存成功');
          this.props.loadFlowList({
            filter: JSON.stringify(this.props.listFilter),
            pageSize: this.props.flowList.pageSize,
            current: this.props.flowList.current,
          }).then((re) => {
            if (re.error) {
              const flow = re.data.find(da => da.id === currentFlow.id);
              this.props.openFlow(flow);
            }
          });
        }
      });
    }
  }
  handleCustomerSelect = (value) => {
    const { customerPartners } = this.props;
    const partner = customerPartners.find(cp => cp.id === Number(value));
    if (partner) {
      return partner.name;
    }
    return value;
  }
  render() {
    const { form: { getFieldDecorator }, currentFlow, customerPartners } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('flowName')}>
          {
       getFieldDecorator('name', {
        initialValue: currentFlow.name,
         rules: [{ required: true, message: '流程名称必填' }],
       })(<Input />)
     }
        </FormItem>
        <FormItem label={this.msg('flowCustomer')}>
          {
       getFieldDecorator('customer', {
        initialValue: currentFlow.customer,
        getValueFromEvent: this.handleCustomerSelect,
       })(<Select mode="combobox" showSearch allowClear optionFilterProp="children" >
         {customerPartners.map(data => (
           <Option key={data.id} value={String(data.id)}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
       </Select>)
      }
        </FormItem>

        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
      </Form>
    );
  }
}
