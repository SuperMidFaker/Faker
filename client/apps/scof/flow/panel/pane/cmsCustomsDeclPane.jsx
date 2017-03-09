import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  })
)
export default class CMSCustomsDeclPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  eventData = [{
    key: 'customsCreated',
    name: 'onCreated',
  }, {
    key: 'customsReviewed',
    name: 'onReviewed',
  }, {
    key: 'customsDeclared',
    name: 'onDeclared',
  }, {
    key: 'customsReleased',
    name: 'onReleased',
  }, {
    key: 'customsFinished',
    name: 'onFinished',
  }]
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('properties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('reviewer')}>
                {getFieldDecorator('reviewer', {
                })(<Select />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('ediChannel')}>
                {getFieldDecorator('edi', {
                })(<Select />)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('events')} key="events">
          <FlowTriggerTable events={this.eventData} />
        </Panel>
      </Collapse>
    );
  }
}
