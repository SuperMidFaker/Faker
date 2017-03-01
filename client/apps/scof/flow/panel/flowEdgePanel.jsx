/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Collapse, Form, Table, Card, Col, Icon, Row, Select, Switch, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Panel = Collapse.Panel;

@injectIntl
export default class FlowEdgePanel extends Component {
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
        event_name: 'onEntered',
      },
      {
        event_name: 'onExited',
      },
    ];
    return (
      <div>
        <Card title={this.msg('flowEdge')} bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['properties', 'condition']}>
            <Panel header={this.msg('properties')} key="properties">
              <Row gutter={16}>
                <Col sm={24}>
                  <FormItem label={this.msg('sourceNode')}>
                    {getFieldDecorator('source_node', {
                    })(<Select />)}
                  </FormItem>
                </Col>
                <Col sm={6}>
                  <FormItem label={this.msg('isTerminal')}>
                    {getFieldDecorator('is_terminal', {
                    })(<Switch checkedChildren={'是'} unCheckedChildren={'否'} />)}
                  </FormItem>
                </Col>
                <Col sm={18}>
                  <FormItem label={this.msg('targetNode')}>
                    {getFieldDecorator('target_node', {
                    })(<Select />)}
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header={<span>
              {this.msg('condition')}&nbsp;
              <Tooltip title={this.msg('tooltipEdgeCondition')}>
                <Icon type="question-circle-o" />
              </Tooltip></span>} key="condition"
            >
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
