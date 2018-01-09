import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Input, Select, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadOperators } from 'common/reducers/crmCustomers';
import FlowTriggerTable from './flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    partnerId: state.scofFlow.currentFlow.partner_id,
    serviceTeam: state.crmCustomers.operators,
    customerPartners: state.partner.partners,
    vendorTenants: state.scofFlow.vendorTenants,
    providerFlows: state.scofFlow.flowGraph.providerFlows,
  }),
  { loadOperators }
)
export default class FlowNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    serviceTeam: PropTypes.arrayOf(PropTypes.shape({
      lid: PropTypes.number.isRequired, name: PropTypes.string.isRequired,
    })),
  }
  componentDidMount() {
    this.props.loadOperators(this.props.partnerId, this.props.tenantId);
  }
  msg = formatMsg(this.props.intl)
  handleResponsiblerSelect = (lid) => {
    const person = this.props.serviceTeam.filter(st => st.lid === lid)[0];
    if (person) {
      this.props.graph.update(this.props.node, { person: person.name });
    }
  }
  render() {
    const {
      form: { getFieldDecorator }, customerPartners, node, serviceTeam, tenantId, tenantName,
      vendorTenants, providerFlows,
    } = this.props;
    const model = node.get('model');
    let demanderName;
    const demander = customerPartners.filter(cusp => cusp.id === node.demander_partner_id)[0];
    if (!demander) {
      demanderName = tenantName;
    } else {
      demanderName = demander.partner_name;
    }
    const providers = providerFlows.map(pf => ({
      id: pf.tenant_id,
      name: vendorTenants.filter(vt => vt.partner_tenant_id === pf.tenant_id)[0].name,
    })).concat({ id: tenantId, name: tenantName });
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']} style={{ marginTop: 2 }} >
        <Panel header={this.msg('bizProperties')} key="properties">
          <FormItem label={this.msg('nodeName')}>
            {getFieldDecorator('name', {
              initialValue: model.name,
              rules: [{ required: true, message: '名称必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('demander')}>
            {demanderName}
          </FormItem>
          <FormItem label={this.msg('provider')}>
            {getFieldDecorator('provider_tenant_id', {
              initialValue: model.provider_tenant_id,
            })(<Select allowClear showSearch>
              {providers.map(st => <Option key={st.id} value={st.id}>{st.name}</Option>)}
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('nodeExecutor')}>
            {getFieldDecorator('person_id', {
              initialValue: model.person_id,
            })(<Select onChange={this.handleResponsiblerSelect} allowClear showSearch>
              {serviceTeam.map(st => <Option key={st.lid} value={st.lid}>{st.name}</Option>)}
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('multiBizInstance')}>
            {getFieldDecorator('multi_bizobj', {
              initialValue: model.multi_bizobj,
              valuePropName: 'checked',
            })(<Switch />)}
          </FormItem>
        </Panel>
        <Panel header={this.msg('nodeEvents')} key="events">
          <FlowTriggerTable kind={model.kind} />
        </Panel>
      </Collapse>
    );
  }
}
