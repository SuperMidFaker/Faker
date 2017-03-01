/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Icon, Select, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { openAddTriggerModal } from 'common/reducers/scofFlow';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { openAddTriggerModal }
)
export default class CMSDeclManifestPane extends Component {
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
  handleAddTrigger = () => {
    this.props.openAddTriggerModal();
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const eventColumns = [
      { title: 'Event Name', dataIndex: 'event_name', key: 'event_name' },
      { title: 'Triggers', key: 'operation', width: 100, render: () => <a href="#" onClick={this.handleAddTrigger}>Add Trigger</a> },
    ];
    const eventData = [
      {
        key: 0,
        event_name: 'onCreated',
      },
      {
        key: 1,
        event_name: 'onGenerated',
      },
      {
        key: 9,
        event_name: 'onFinished',
      },
    ];
    return (
      <div>
        <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
          <Panel header={this.msg('properties')} key="properties">
            <Row gutter={16}>
              <Col sm={24} lg={8}>
                <FormItem label={this.msg('trading')}>
                  {getFieldDecorator('trading', {
                  })(<Select />)}
                </FormItem>
              </Col>
              <Col sm={24} lg={8}>
                <FormItem label={this.msg('owner')}>
                  {getFieldDecorator('owner', {
                  })(<Select />)}
                </FormItem>
              </Col>
              <Col sm={24} lg={8}>
                <FormItem label={this.msg('agent')}>
                  {getFieldDecorator('agent', {
                  })(<Select />)}
                </FormItem>
              </Col>
              <Col sm={24} lg={12}>
                <FormItem label={this.msg('manifestTemplate')}>
                  {getFieldDecorator('manifest_template', {
                  })(<Select />)}
                </FormItem>
              </Col>
              <Col sm={24} lg={12}>
                <FormItem label={this.msg('mergeSplitRules')}>
                  {getFieldDecorator('manifest_template', {
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
      </div>
    );
  }
}
