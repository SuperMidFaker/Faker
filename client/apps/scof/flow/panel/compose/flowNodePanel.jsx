import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from './flowTriggerTable';
import { loadOperators } from 'common/reducers/crmCustomers';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnerId: state.scofFlow.currentFlow.partner_id,
    serviceTeam: state.crmCustomers.operators,
  }),
  { loadOperators }
)
export default class FlowNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
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
    const { form: { getFieldDecorator }, node, serviceTeam } = this.props;
    const model = node.get('model');
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <FormItem label={this.msg('nodeName')}>
            {getFieldDecorator('name', {
              initialValue: model.name,
              rules: [{ required: true, message: '名称必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('nodeExecutor')}>
            {getFieldDecorator('person_id', {
              initialValue: model.person_id,
            })(
              <Select onChange={this.handleResponsiblerSelect} allowClear showSearch optionFilterProp="children">
                {serviceTeam.map(st => <Option key={st.lid} value={st.lid}>{st.name}</Option>)}
              </Select>)}
          </FormItem>
        </Panel>
        <Panel header={this.msg('nodeEvents')} key="events">
          <FlowTriggerTable kind={model.kind} />
        </Panel>
      </Collapse>
    );
  }
}
