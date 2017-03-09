import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import FlowTriggerTable from '../flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    bizDelegation: state.scofFlow.cmsParams.bizDelegation,
  }),
)
export default class CMSDelegationPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  eventData = [{
    key: 'delgCreated',
    name: 'onCreated',
  }, {
    key: 'delgDeclared',
    name: 'onDeclared',
  }, {
    key: 'delgInspected',
    name: 'onInspected',
  }, {
    key: 'delgReleased',
    name: 'onReleased',
  }, {
    key: 'delgFinished',
    name: 'onFinished',
  }]
  render() {
    const { form: { getFieldDecorator, getFieldValue } } = this.props;
    const declWays = getFieldValue('ie_type') ? DECL_I_TYPE : DECL_E_TYPE;
    return (
      <div>
        <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
          <Panel header={this.msg('properties')} key="properties">
            <Row gutter={16}>
              <Col sm={24} lg={24}>
                <FormItem label={this.msg('declCustoms')}>
                  {getFieldDecorator('ie_type', {
                  })(<Switch checkedChildren={'进口'} unCheckedChildren={'出口'} />)}
                </FormItem>
              </Col>
              <Col sm={24} lg={8}>
                <FormItem label={this.msg('declCustoms')}>
                  {getFieldDecorator('decl_customs', {
                  })(<Select />)}
                </FormItem>
              </Col>
              <Col sm={24} lg={8}>
                <FormItem label={this.msg('declWay')}>
                  {getFieldDecorator('decl_way', {
                  })(<Select>
                    {
                      declWays.map(tr =>
                        <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                      )
                    }
                  </Select>)}
                </FormItem>
              </Col>
              <Col sm={24} lg={8}>
                <FormItem label={this.msg('transMode')}>
                  {getFieldDecorator('trans_mode', {
                  })(<Select>
                    {
                      TRANS_MODE.map(tr =>
                        <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                      )
                    }
                  </Select>)}
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
            <FlowTriggerTable events={this.eventData} />
          </Panel>
        </Collapse>
      </div>
    );
  }
}
