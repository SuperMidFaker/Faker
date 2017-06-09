import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Switch, Select, Alert } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { TARIFF_METER_METHODS, GOODS_TYPES } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import AddLineModal from 'client/apps/scof/flow/modal/addLineModal';
import { loadTariffsByTransportInfo, toggleAddLineModal, isLineIntariff } from 'common/reducers/scofFlow';
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
  }), { loadTariffsByTransportInfo, toggleAddLineModal, isLineIntariff }
)
export default class TMSShipmentPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    partnerId: PropTypes.number.isRequired,
    partnerName: PropTypes.string.isRequired,
    loadTariffsByTransportInfo: PropTypes.func.isRequired,
    toggleAddLineModal: PropTypes.func.isRequired,
    needLoadTariff: PropTypes.bool.isRequired,
    isLineIntariff: PropTypes.bool.isRequired,
  }
  state = {
    transitMode: -1,
    goodsType: -1,
    tariffs: [],
    quoteNo: '',
    isLineIntariff: true,
  }
  componentWillMount() {
    const { model, tmsParams: { transitModes } } = this.props;
    if (model.consigner_id) {
      const mode = transitModes.find(item => item.mode_code === model.transit_mode);
      const transitMode = mode ? mode.id : -1;
      this.setState({ transitMode, goodsType: model.goods_type, quoteNo: model.quote_no }, () => {
        this.handleLoadTariffs(this.props);
      });
    } else {
      this.handleLoadTariffs(this.props);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.needLoadTariff) {
      this.handleLoadTariffs(nextProps);
      this.setState({ isLineIntariff: true });
    }
    const { model, tmsParams: { transitModes } } = nextProps;
    if (this.props.model.consigner_id !== model.consigner_id) {
      const mode = transitModes.find(item => item.mode_code === model.transit_mode);
      const transitMode = mode ? mode.id : -1;
      this.setState({ transitMode, goodsType: model.goods_type, quoteNo: model.quote_no });
    }
  }
  handleLoadTariffs = (props) => {
    const { partnerId } = props;
    const { transitMode, goodsType } = this.state;
    props.loadTariffsByTransportInfo(partnerId, transitMode, goodsType).then((result) => {
      this.setState({
        tariffs: result.data || [],
      });
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
  handleJudgeLine = ({ consignerId, consigneeId, quoteNo }) => {
    const { tmsParams: { consigners, consignees } } = this.props;
    const csnrId = consignerId || this.props.form.getFieldValue('consigner_id');
    const consigner = consigners.find(item => item.node_id === csnrId);
    const csneId = consigneeId || this.props.form.getFieldValue('consignee_id');
    const consignee = consignees.find(item => item.node_id === csneId);
    if ((quoteNo || this.state.quoteNo) && consigner && consignee) {
      const tariff = this.state.tariffs.find(item => item.quoteNo === (quoteNo || this.state.quoteNo));
      const line = {
        source: {
          code: consigner.region_code,
          province: consigner.province,
          city: consigner.city,
          district: consigner.district,
          street: consigner.street,
        },
        end: {
          code: consignee.region_code,
          province: consignee.province,
          city: consignee.city,
          district: consignee.district,
          street: consignee.street,
          name: consignee.byname,
        },
      };

      this.props.isLineIntariff({
        tariffId: tariff._id,
        line,
      }).then((result) => {
        this.setState({ isLineIntariff: result.data.isLineIntariff });
      });
    }
  }
  handleConsignerSelect = (value) => {
    if (value === -1) {
      // setTimeout(() => {
      //   if (this.props.form.getFieldValue('consigner_id') === -1) {
      //     this.props.form.resetFields(['consigner_id']);
      //   }
      // }, 100);
    } else {
      this.handleJudgeLine({ consignerId: value });
    }
  }
  handleConsigneeSelect = (value) => {
    if (value === -1) {
      // setTimeout(() => {
      //   if (this.props.form.getFieldValue('consignee_id') === -1) {
      //     this.props.form.resetFields(['consignee_id']);
      //   }
      // }, 100);
    } else {
      this.handleJudgeLine({ consigneeId: value });
    }
  }
  handleShowAddLineModal = () => {
    const { tmsParams: { consigners, consignees } } = this.props;
    const consignerId = this.props.form.getFieldValue('consigner_id');
    const consigner = consigners.find(item => item.node_id === consignerId);
    const consigneeId = this.props.form.getFieldValue('consignee_id');
    const consignee = consignees.find(item => item.node_id === consigneeId);

    const tariff = this.state.tariffs.find(item => item.quoteNo === this.state.quoteNo);
    const line = {
      source: {
        code: consigner.region_code,
        province: consigner.province,
        city: consigner.city,
        district: consigner.district,
        street: consigner.street,
      },
      end: {
        code: consignee.region_code,
        province: consignee.province,
        city: consignee.city,
        district: consignee.district,
        street: consignee.street,
        name: consignee.byname,
      },
    };
    this.props.toggleAddLineModal({
      visible: true,
      tariff,
      line,
    });
  }
  handleTariffSelect = (quoteNo) => {
    this.setState({ quoteNo });
    this.handleJudgeLine({ quoteNo });
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
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('transitMode')}>
                {getFieldDecorator('transit_mode', {
                  initialValue: model.transit_mode,
                })(<Select allowClear onChange={this.handleTransitModeSelect}>
                  { transitModes.map(tr => <Option value={tr.mode_code} key={tr.mode_code}>{tr.mode_name}</Option>) }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('cargoType')}>
                {getFieldDecorator('goods_type', {
                  initialValue: model.goods_type,
                })(<Select allowClear onChange={this.handleCargoTypeSelect}>
                  { GOODS_TYPES.map(gt => <Option value={gt.value} key={gt.value}>{gt.text}</Option>) }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('quoteNo')}>
                {getFieldDecorator('quote_no', {
                  initialValue: model.quote_no,
                })(<Select allowClear onChange={this.handleTariffSelect}>
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
                    notFoundContent={<a onClick={() => {}}>+ 添加地址</a>}
                  >
                    {
                      consigners.filter(cl => cl.ref_partner_id === partnerId || cl.ref_partner_id === -1)
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
                    notFoundContent={<a onClick={() => {}}>+ 添加地址</a>}
                  >
                    {
                      consignees.filter(cl => cl.ref_partner_id === partnerId || cl.ref_partner_id === -1)
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
          {
            !this.state.isLineIntariff && <Row>
              <Alert message={<div>发货/收货地址不在报价协议的线路里 <a onClick={this.handleShowAddLineModal}>添加到报价协议</a></div>} type="warning" showIcon />
            </Row>
          }
          <AddLineModal />
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="tmsShipment" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
