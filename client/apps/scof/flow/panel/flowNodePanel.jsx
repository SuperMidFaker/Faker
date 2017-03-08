import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Radio, Table, Card, Col, Row, Input, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { openAddTriggerModal } from 'common/reducers/scofFlow';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { openAddTriggerModal }
)
export default class FlowNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  expandedRowRender = () => {
    const triggerColumns = [
      { title: 'Condition', dataIndex: 'condition', key: 'condition' },
      { title: 'Action', dataIndex: 'action', key: 'action' },
      {
        title: 'Operation',
        dataIndex: 'operation',
        key: 'operation',
        render: () => (
          <span className={'table-operation'}>
            <a href="#">Pause</a>
            <a href="#">Stop</a>
          </span>
        ),
      },
    ];

    const triggerData = [];
    for (let i = 0; i < 2; ++i) {
      triggerData.push({
        key: i,
        condition: 'ALL',
        action: 'This is production name',
      });
    }
    return (
      <Table
        columns={triggerColumns}
        dataSource={triggerData}
        pagination={false}
      />
    );
  };
  handleAddTrigger = () => {
    this.props.openAddTriggerModal();
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const eventColumns = [
      { title: 'Event Name', dataIndex: 'event_name', key: 'event_name' },
      { title: 'Triggers', key: 'operation', width: 100, render: () => <a href="#" onClick={this.handleAddTrigger}>Add Trigger</a> },
    ];
    const eventData = [
      {
        key: 0,
        event_name: 'onEntered',
      },
      {
        key: 1,
        event_name: 'onExited',
      },
    ];
    return (
      <div>
        <Card title={this.msg('flowNode')} bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
            <Panel header={this.msg('properties')} key="properties">
              <Row gutter={16}>
                <Col sm={18}>
                  <FormItem label={this.msg('nodeName')}>
                    {getFieldDecorator('asn_no', {
                    })(<Input />)}
                  </FormItem>
                </Col>
                <Col sm={6}>
                  <FormItem label={this.msg('isOrigin')}>
                    {getFieldDecorator('is_origin', {
                    })(<Switch checkedChildren={'是'} unCheckedChildren={'否'} disabled />)}
                  </FormItem>
                </Col>
                <Col sm={24}>
                  <FormItem label={this.msg('nodeClass')}>
                    {getFieldDecorator('node_class', {
                    })(<RadioGroup>
                      <RadioButton value="nodeCMS">{this.msg('nodeCMS')}</RadioButton>
                      <RadioButton value="nodeTMS">{this.msg('nodeTMS')}</RadioButton>
                      <RadioButton value="nodeCWM">{this.msg('nodeCWM')}</RadioButton>
                    </RadioGroup>)}
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header={this.msg('events')} key="events">
              <Table
                size="middle"
                columns={eventColumns}
                expandedRowRender={this.expandedRowRender}
                dataSource={eventData}
                pagination={false}
                showHeader={false}
              />
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
