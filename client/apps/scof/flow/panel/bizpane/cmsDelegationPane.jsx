import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    bizDelegation: state.scofFlow.cmsParams.bizDelegation,
    cmsQuotes: state.scofFlow.cmsQuotes,
  }),
)
export default class CMSDelegationPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, onNodeActionsChange, model,
      bizDelegation: { declPorts, customsBrokers, ciqBrokers }, cmsQuotes } = this.props;
    const declWays = model.kind === 'export' ? DECL_E_TYPE : DECL_I_TYPE;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('declCustoms')}>
                {getFieldDecorator('decl_port', {
                  initialValue: model.decl_port,
                })(<Select allowClear showSearch>
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
                })(<Select allowClear>
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
                })(<Select allowClear>
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
                {getFieldDecorator('customs_partner_id', {
                  initialValue: model.customs_partner_id,
                })(<Select allowClear>
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
                })(<Select allowClear>
                  {
                    ciqBrokers.map(cb =>
                      <Option value={cb.partner_id} key={cb.partner_id}>{cb.partner_code}|{cb.name}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('quoteNo')}>
                {getFieldDecorator('quote_no', {
                  initialValue: model.quote_no,
                })(<Select allowClear>
                  {
                    cmsQuotes.map(cq => <Option value={cq.quote_no} key={cq._id}>{cq.quote_no}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cmsDelegation" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
