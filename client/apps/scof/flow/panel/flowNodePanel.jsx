import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from './flowTriggerTable';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    name: state.scofFlow.activeElement.name,
  })
)
export default class FlowNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  eventData = [{
    key: 'entered',
    name: 'onEntered',
  }, {
    key: 'exited',
    name: 'onExited',
  }]
  render() {
    const { form: { getFieldDecorator }, name } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('properties')} key="properties">
          <FormItem label={this.msg('nodeName')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [{ required: true, message: '名称必填' }],
            })(<Input />)}
          </FormItem>
        </Panel>
        <Panel header={this.msg('events')} key="events">
          <FlowTriggerTable events={this.eventData} />
        </Panel>
      </Collapse>
    );
  }
}
