/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Collapse, Form, Card, Col, Row, Input, Table, Tabs } from 'antd';
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
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const eventColumns = [
      { title: 'Event Name', dataIndex: 'event_name', key: 'event_name' },
      { title: 'Triggers', key: 'operation', width: 100, render: () => <a href="#">Add Trigger</a> },
    ];
    const eventData = [
      {
        event_name: 'onCreated',
      },
      {
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
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('declCustoms')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={6}>
                      <FormItem label={this.msg('declWay')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={6}>
                      <FormItem label={this.msg('transMode')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('customsBroker')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('ciqBroker')}>
                        {getFieldDecorator('asn_no', {
                        })(<Input />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('quote')}>
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
