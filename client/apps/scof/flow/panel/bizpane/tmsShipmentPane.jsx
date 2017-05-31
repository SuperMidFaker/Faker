import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Switch, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { TARIFF_METER_METHODS, GOODS_TYPES } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { loadTariffsByTransportInfo } from 'common/reducers/scofFlow';
import * as Location from 'client/util/location';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tmsParams: state.scofFlow.tmsParams,
    partnerId: state.scofFlow.currentFlow.partner_id,
    transitModes: state.crmOrders.formRequires.transitModes,
  }), { loadTariffsByTransportInfo }
)
export default class TMSShipmentPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    partnerId: PropTypes.number.isRequired,
    loadTariffsByTransportInfo: PropTypes.func.isRequired,
    transitModes: PropTypes.array.isRequired,
  }
  state = {
    transitMode: -1,
    goodsType: -1,
    tariffs: [],
  }
  componentWillReceiveProps(nextProps) {
    const { partnerId, model, tmsParams: { transitModes } } = nextProps;
    const mode = transitModes.find(item => item.mode_code === model.transit_mode);
    const transitMode = mode ? mode.id : -1;
    if (this.state.transitMode !== -1 && this.state.goodsType !== -1) {
      this.props.loadTariffsByTransportInfo(partnerId, transitMode, model.goods_type).then((result) => {
        this.setState({ tariffs: result.data });
      });
    }
    if (this.state.transitMode === -1) {
      this.setState({ transitMode });
    }
    if (this.state.goodsType === -1) {
      this.setState({ goodsType: model.goods_type });
    }
  }
  msg = formatMsg(this.props.intl)
  handleLoadTariff = () => {
    const { partnerId } = this.props;
    const { transitMode, goodsType } = this.state;
    if (transitMode > -1 && goodsType > -1) {
      this.props.loadTariffsByTransportInfo(partnerId, transitMode, goodsType).then((result) => {
        this.setState({ tariffs: result.data });
      });
    }
  }
  handleTransitModeSelect = (value) => {
    const { tmsParams: { transitModes } } = this.props;
    const mode = transitModes.find(item => item.mode_code === value);
    const transitMode = mode ? mode.id : -1;
    this.setState({ transitMode }, this.handleLoadTariff);
  }
  handleCargoTypeSelect = (value) => {
    this.setState({ goodsType: value }, this.handleLoadTariff);
  }
  renderTmsTariffCondition = (row) => {
    let text = row.quoteNo;
    const tms = this.props.transitModes.find(tm => tm.id === Number(row.transModeCode));
    const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
    const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
    if (tms) text = `${text}-${tms.mode_name}`;
    if (meter) text = `${text}/${meter.text}`;
    if (goodType) text = `${text}/${goodType.text}`;
    return text;
  }
  renderConsign = consign => `${consign.name} | ${Location.renderLoc(consign)} | ${consign.contact || ''} | ${consign.mobile || ''}`
  render() {
    const { form: { getFieldDecorator }, onNodeActionsChange, model, tmsParams: { consigners, consignees, transitModes }, partnerId } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('transitMode')}>
                {getFieldDecorator('transit_mode', {
                  initialValue: model.transit_mode,
                })(<Select allowClear onSelect={this.handleTransitModeSelect}>
                  { transitModes.map(tr => <Option value={tr.mode_code} key={tr.mode_code}>{tr.mode_name}</Option>) }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('cargoType')}>
                {getFieldDecorator('goods_type', {
                  initialValue: model.goods_type,
                })(<Select allowClear onSelect={this.handleCargoTypeSelect}>
                  { GOODS_TYPES.map(gt => <Option value={gt.value} key={gt.value}>{gt.text}</Option>) }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('quoteNo')}>
                {getFieldDecorator('quote_no', {
                  initialValue: model.quote_no,
                })(<Select allowClear>
                  { this.state.tariffs.map(t => <Option value={t.quoteNo} key={t.quoteNo}>{this.renderTmsTariffCondition(t)}</Option>) }
                </Select>)}
              </FormItem>
            </Col>

            <Col sm={24} lg={8}>
              <FormItem label={this.msg('consigner')}>
                {getFieldDecorator('consigner_id', {
                  initialValue: model.consigner_id,
                })(
                  <Select allowClear
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ width: 400 }}
                    optionFilterProp="children"
                    showSearch
                  >
                    {
                      consigners.filter(cl => cl.ref_partner_id === partnerId || cl.ref_partner_id === -1).map(cg => <Option value={cg.node_id} key={cg.node_id}>{this.renderConsign(cg)}</Option>)
                    }
                  </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('consignee')}>
                {getFieldDecorator('consignee_id', {
                  initialValue: model.consignee_id,
                })(
                  <Select allowClear
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ width: 400 }}
                    optionFilterProp="children"
                    showSearch
                  >
                    {
                      consignees.filter(cl => cl.ref_partner_id === partnerId || cl.ref_partner_id === -1).map(cg => <Option value={cg.node_id} key={cg.node_id}>{this.renderConsign(cg)}</Option>)
                    }
                  </Select>)}
              </FormItem>
            </Col>

            <Col sm={24} lg={8}>
              <FormItem label={this.msg('podType')}>
                {getFieldDecorator('pod', {
                  valuePropName: 'checked',
                  initialValue: model.pod,
                })(<Switch />)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="tmsShipment" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
