import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { loadEpList } from 'common/reducers/scofFlow';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';


const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    bizDelegation: state.scofFlow.cmsParams.bizDelegation,
    cmsQuotes: state.scofFlow.cmsQuotes,
  }),
  { loadEpList }
)
export default class CMSDelegationPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func }).isRequired,
  }
  componentWillMount() {
    this.queryEpList(
      this.props.tenantId,
      this.props.model.customs_partner_id,
      this.props.bizDelegation.customsBrokers
    );
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.bizDelegation !== this.props.bizDelegation) {
      this.queryEpList(
        nextProps.tenantId,
        nextProps.model.customs_partner_id,
        nextProps.bizDelegation.customsBrokers
      );
    }
  }
  msg = formatMsg(this.props.intl)
  handleCustomsChange = (customsPid) => {
    this.queryEpList(this.props.tenantId, customsPid, this.props.bizDelegation.customsBrokers);
  }
  queryEpList = (tenantId, customsPid, customsBrokers) => {
    const customs = customsBrokers.filter(cb => cb.partner_id === customsPid)[0];
    this.props.loadEpList(tenantId, customs && customs.customs_code);
  }
  render() {
    const {
      form: { getFieldDecorator }, model, tenantId,
      bizDelegation: { declPorts, customsBrokers, ciqBrokers }, cmsQuotes,
    } = this.props;
    const declWays = model.kind === 'export' ? DECL_E_TYPE : DECL_I_TYPE;
    const provider = model.provider_tenant_id === tenantId;
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('declCustoms')}>
                {getFieldDecorator('decl_port', {
                  initialValue: model.decl_port,
                })(<Select allowClear showSearch optionFilterProp="children">
                  {
                    declPorts.map(dp =>
                      <Option value={dp.code} key={dp.code}>{dp.code}|{dp.name}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('declWay')}>
                {getFieldDecorator('decl_way', {
                  initialValue: model.decl_way,
                  rules: [{ required: true }],
                })(<Select allowClear>
                  {
                    declWays.map(dw =>
                      <Option value={dw.key} key={dw.key}>{dw.value}</Option>)
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
                      <Option value={tr.value} key={tr.value}>{tr.text}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('customsBroker')}>
                {getFieldDecorator('customs_partner_id', {
                  initialValue: provider ? model.customs_partner_id : null,
                  onChange: this.handleCustomsChange,
                })(<Select allowClear disabled={!provider}>
                  {
                    customsBrokers.map(cb =>
                      (<Option value={cb.partner_id} key={cb.partner_id}>
                        {cb.customs_code}|{cb.name}
                      </Option>))
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('ciqBroker')}>
                {getFieldDecorator('ciq_partner_id', {
                  initialValue: provider ? model.ciq_partner_id : null,
                })(<Select allowClear disabled={!provider}>
                  {
                    ciqBrokers.map(cb =>
                      (<Option value={cb.partner_id} key={cb.partner_id}>
                        {cb.customs_code}|{cb.name}
                      </Option>))
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('quoteNo')}>
                {getFieldDecorator('quote_no', {
                  initialValue: provider ? model.quote_no : null,
                })(<Select allowClear disabled={!provider}>
                  {cmsQuotes.map(cq =>
                    <Option value={cq.quote_no} key={cq._id}>{cq.quote_no}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cmsDelegation" />
        </Panel>
      </Collapse>
    );
  }
}
