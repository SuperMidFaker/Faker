import React, { Component, PropTypes } from 'react';
import { Collapse, Form, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from './flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;

@injectIntl
export default class FlowNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, model, onNodeActionsChange } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <FormItem label={this.msg('nodeName')}>
            {getFieldDecorator('name', {
              initialValue: model.name,
              rules: [{ required: true, message: '名称必填' }],
            })(<Input />)}
          </FormItem>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
