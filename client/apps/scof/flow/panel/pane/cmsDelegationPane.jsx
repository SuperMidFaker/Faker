import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
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
    const { form: { getFieldDecorator }, model, bizDelegation: { declPorts, customsBrokers, ciqBrokers } } = this.props;
    const declWays = model.kind === 'export' ? DECL_E_TYPE : DECL_I_TYPE;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('properties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('declCustoms')}>
                {getFieldDecorator('decl_port', {
                  initialValue: model.decl_port,
                })(<Select>
                  {
                    declPorts.map(dp => <Option value={dp.code} key={dp.code}>{dp.code}|{dp.name}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('declWay')}>
                {getFieldDecorator('decl_way', {
                  initialValue: model.decl_way,
                })(<Select>
                  {
                    declWays.map(dw =>
                      <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('transMode')}>
                {getFieldDecorator('trans_mode', {
                  initialValue: model.trans_mode,
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
                {getFieldDecorator('customs_parnter_id', {
                  initialValue: model.customs_parnter_id,
                })(<Select>
                  {
                    customsBrokers.map(cb =>
                      <Option value={cb.partner_id} key={cb.partner_id}>{cb.partner_code}|{cb.name}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('ciqBroker')}>
                {getFieldDecorator('ciq_partner_id', {
                  initialValue: model.ciq_partner_id,
                })(<Select>
                  {
                    ciqBrokers.map(cb =>
                      <Option value={cb.partner_id} key={cb.partner_id}>{cb.partner_code}|{cb.name}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('quote')}>
                {getFieldDecorator('quote_no', {
                  initialValue: model.quote_no,
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
