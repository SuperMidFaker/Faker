import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Switch, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { TARIFF_METER_METHODS, GOODS_TYPES } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import AddLineModal from 'client/apps/scof/flow/modal/addLineModal';
import { loadTariffsByTransportInfo, loadRatesSources, loadRateEnds, toggleAddLineModal } from 'common/reducers/scofFlow';
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
    partnerName: state.scofFlow.currentFlow.customer_partner_name,
    needLoadTariff: state.scofFlow.needLoadTariff,
  }), { loadTariffsByTransportInfo, loadRatesSources, loadRateEnds, toggleAddLineModal }
)
export default class TMSShipmentPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    partnerId: PropTypes.number.isRequired,
    partnerName: PropTypes.string.isRequired,
    loadTariffsByTransportInfo: PropTypes.func.isRequired,
    loadRatesSources: PropTypes.func.isRequired,
    loadRateEnds: PropTypes.func.isRequired,
    toggleAddLineModal: PropTypes.func.isRequired,
    needLoadTariff: PropTypes.bool.isRequired,
  }
  state = {
    transitMode: -1,
    goodsType: -1,
    tariffs: [],
    rateSources: [],
    rateEnds: [],
  }
  componentWillMount() {
    this.handleLoadTariffs(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.needLoadTariff) {
      this.handleLoadTariffs(nextProps);
    }
  }
  handleLoadTariffs = (props) => {
    const { partnerId, model, tmsParams: { transitModes, consigners } } = props;
    const mode = transitModes.find(item => item.mode_code === model.transit_mode);
    const transitMode = mode ? mode.id : -1;
    const consigner = consigners.find(item => item.node_id === model.consigner_id);

    props.loadTariffsByTransportInfo(partnerId, transitMode, model.goods_type).then((result) => {
      this.setState({
        tariffs: result.data || [],
        transitMode,
        goodsType: model.goods_type,
      });
      if (result.data) {
        const tariff = result.data.find(item => item.quoteNo === model.quote_no);
        if (tariff) {
          props.loadRatesSources({
            tariffId: tariff._id,
            pageSize: 999999,
            currentPage: 1,
          }).then((result1) => {
            this.setState({ rateSources: result1.data.data || [] });
            if (result1.data.data && consigner) {
              const rss = result1.data.data.filter(item => item.source.province === consigner.province);
              const promises = rss.map(item => props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
              Promise.all(promises).then((results) => {
                let rateEnds = [];
                results.forEach((item) => {
                  rateEnds = rateEnds.concat(item.data.data);
                });
                this.setState({ rateEnds });
              });
            }
          });
        }
      }
    });
  }
  msg = formatMsg(this.props.intl)
  handleLoadTariff = () => {
    const { partnerId } = this.props;
    const { transitMode, goodsType } = this.state;
    this.props.loadTariffsByTransportInfo(partnerId, transitMode, goodsType).then((result) => {
      this.setState({ tariffs: result.data });
    });
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
  handleConsignerSelect = (value) => {
    if (value === -1) {
      const { partnerId, partnerName } = this.props;
      this.props.toggleAddLineModal({
        visible: true,
        quoteNo: this.props.form.getFieldValue('quote_no'),
        partnerId,
        partnerName,
      });
      setTimeout(() => {
        if (this.props.form.getFieldValue('consigner_id') === -1) {
          this.props.form.resetFields(['consigner_id']);
        }
      }, 100);
    } else {
      const { tmsParams: { consigners } } = this.props;
      const consigner = consigners.find(item => item.node_id === value);
      const { rateSources } = this.state;
      const rss = rateSources.filter(item => item.source.province === consigner.province);

      const promises = rss.map(item => this.props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
      Promise.all(promises).then((results) => {
        let rateEnds = [];
        results.forEach((item) => {
          rateEnds = rateEnds.concat(item.data.data);
        });
        this.setState({ rateEnds });
      });
    }
  }
  handleConsigneeSelect = (value) => {
    if (value === -1) {
      this.props.toggleAddLineModal(true, this.props.form.getFieldValue('quote_no'));
      setTimeout(() => {
        if (this.props.form.getFieldValue('consignee_id') === -1) {
          this.props.form.resetFields(['consignee_id']);
        }
      }, 100);
    }
  }
  handleTariffSelect = (quoteNo) => {
    const { tmsParams: { consigners } } = this.props;
    const consigner = consigners.find(item => item.node_id === this.props.form.getFieldValue('consigner_id'));
    const tariff = this.state.tariffs.find(item => item.quoteNo === quoteNo);
    if (tariff) {
      this.props.loadRatesSources({
        tariffId: tariff._id,
        pageSize: 999999,
        currentPage: 1,
      }).then((result1) => {
        this.setState({ rateSources: result1.data.data || [] });
        if (result1.data.data) {
          const rss = result1.data.data.filter(item => item.source.province === consigner.province);
          const promises = rss.map(item => this.props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
          Promise.all(promises).then((results) => {
            let rateEnds = [];
            results.forEach((item) => {
              rateEnds = rateEnds.concat(item.data.data);
            });
            this.setState({ rateEnds });
          });
        }
      });
    }
  }
  renderTmsTariff = (row) => {
    let text = row.quoteNo;
    const tms = this.props.tmsParams.transitModes.find(tm => tm.id === Number(row.transModeCode));
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
    const { rateSources, rateEnds } = this.state;
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
                })(<Select allowClear onSelect={this.handleTariffSelect}>
                  { this.state.tariffs.map(t => <Option value={t.quoteNo} key={t.quoteNo}>{this.renderTmsTariff(t)}</Option>) }
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
                    onSelect={this.handleConsignerSelect}
                  >
                    {
                      consigners.filter(cl => cl.ref_partner_id === partnerId || cl.ref_partner_id === -1)
                      .filter(cl => rateSources.length === 0 || rateSources.find(rs => rs.source.province === cl.province))
                      .map(cg => <Option value={cg.node_id} key={cg.node_id}>{this.renderConsign(cg)}</Option>)
                    }
                    <Option value={-1} key={-1}>+ 添加地址</Option>
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
                    onSelect={this.handleConsigneeSelect}
                  >
                    {
                      consignees.filter(cl => cl.ref_partner_id === partnerId || cl.ref_partner_id === -1)
                      .filter(cl => rateEnds.length === 0 || rateEnds.find(rs => rs.end.code === cl.region_code))
                      .map(cg => <Option value={cg.node_id} key={cg.node_id}>{this.renderConsign(cg)}</Option>)
                    }
                    <Option value={-1} key={-1}>+ 添加地址</Option>
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
          <AddLineModal />
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="tmsShipment" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
