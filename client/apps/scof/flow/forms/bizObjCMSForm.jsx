/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Collapse, Form, Card, Col, Row, Icon, Input, Select, Table, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

@injectIntl
export default class BizObjectForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  expandedRowRender = () => {
    const triggerColumns = [
      { title: 'Condition', dataIndex: 'condition', key: 'condition' },
      { title: 'Action', dataIndex: 'action', key: 'action' },
      {
        dataIndex: 'operation',
        key: 'operation',
        width: 40,
        render: () => (
          <span className={'table-operation'}>
            <a href="#"><Icon type="pause-circle" /></a>
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
        size="small"
        columns={triggerColumns}
        dataSource={triggerData}
        pagination={false}
      />
    );
  };
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const eventColumns = [
      { title: 'Event Name', dataIndex: 'event_name', key: 'event_name' },
      { title: 'Triggers', key: 'operation', width: 100, render: () => <a href="#">Add Trigger</a> },
    ];
    const eventData = [
      {
        key: 0,
        event_name: 'onCreated',
      },
      {
        key: 1,
        event_name: 'onAccepted',
      },
      {
        key: 2,
        event_name: 'onDeclared',
      },
      {
        key: 3,
        event_name: 'onInspected',
      },
      {
        key: 4,
        event_name: 'onReleased',
      },
      {
        key: 5,
        event_name: 'onFinished',
      },
    ];
    return (
      <div>
        <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="objDelegation">
            <TabPane tab={this.msg('objDelegation')} key="objDelegation">
              <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
                <Panel header={this.msg('properties')} key="properties">
                  <Row gutter={16}>
                    <Col sm={24} lg={8}>
                      <FormItem label={this.msg('declCustoms')}>
                        {getFieldDecorator('decl_customs', {
                        })(<Select />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={8}>
                      <FormItem label={this.msg('declWay')}>
                        {getFieldDecorator('decl_way', {
                        })(<Select />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={8}>
                      <FormItem label={this.msg('transMode')}>
                        {getFieldDecorator('trans_mode', {
                        })(<Select />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={8}>
                      <FormItem label={this.msg('customsBroker')}>
                        {getFieldDecorator('customs_broker', {
                        })(<Select />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={8}>
                      <FormItem label={this.msg('ciqBroker')}>
                        {getFieldDecorator('ciq_brokder', {
                        })(<Select />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={8}>
                      <FormItem label={this.msg('quote')}>
                        {getFieldDecorator('quote', {
                        })(<Select />)}
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
            </TabPane>
            <TabPane tab={this.msg('objDeclManifest')} key="objDeclManifest" >
              <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
                <Panel header={this.msg('properties')} key="properties">
                  <Row gutter={16}>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('manifestTemplate')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('edi')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
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
            </TabPane>
            <TabPane tab={this.msg('objCustomsDecl')} key="objCustomsDecl" />
          </Tabs>
        </Card>
      </div>
    );
  }
}
