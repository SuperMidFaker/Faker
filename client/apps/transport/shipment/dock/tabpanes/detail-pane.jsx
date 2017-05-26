import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Table, Steps, Card, Icon, Dropdown, Menu, Row, Button, message, notification } from 'antd';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { PRESET_TRANSMODES, TMS_SHIPMENT_STATUS_DESC, SHIPMENT_TRACK_STATUS, COURIERS } from 'common/constants';
import ChangeShipment from '../change-shipment';
import { showChangeShipmentModal, loadForm, computeSaleCharge, updateFee, loadShipmtCharges } from 'common/reducers/shipment';
import { saveEdit, revokeOrReject } from 'common/reducers/transport-acceptance';
import { showChangeActDateModal } from 'common/reducers/trackingLandStatus';
import InfoItem from 'client/components/InfoItem';
import { getChargeAmountExpression } from '../../../common/charge';
import messages from '../../message.i18n';
import './pane.less';

const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    shipmt: state.shipment.previewer.shipmt,
    goodsTypes: state.shipment.formRequire.goodsTypes,
    packagings: state.shipment.formRequire.packagings,
    transitModes: state.shipment.formRequire.transitModes,
    vehicleTypes: state.shipment.formRequire.vehicleTypes,
    vehicleLengths: state.shipment.formRequire.vehicleLengths,
    containerPackagings: state.shipment.formRequire.containerPackagings,
    dispatch: state.shipment.previewer.dispatch,
    upstream: state.shipment.previewer.upstream,
    downstream: state.shipment.previewer.downstream,
    formData: state.shipment.formData,
    charges: state.shipment.charges,
  }),
  { showChangeShipmentModal,
    loadForm,
    saveEdit,
    revokeOrReject,
    computeSaleCharge,
    updateFee,
    showChangeActDateModal,
    loadShipmtCharges }
)
export default class DetailPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    shipmt: PropTypes.object.isRequired,
    goodsTypes: PropTypes.array.isRequired,
    packagings: PropTypes.array.isRequired,
    transitModes: PropTypes.array.isRequired,
    showChangeShipmentModal: PropTypes.func.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    containerPackagings: PropTypes.array.isRequired,
    dispatch: PropTypes.object.isRequired,
    upstream: PropTypes.object.isRequired,
    downstream: PropTypes.object.isRequired,
    loadForm: PropTypes.func.isRequired,
    formData: PropTypes.object.isRequired,
    saveEdit: PropTypes.func.isRequired,
    revokeOrReject: PropTypes.func.isRequired,
    computeSaleCharge: PropTypes.func.isRequired,
    updateFee: PropTypes.func.isRequired,
    charges: PropTypes.object.isRequired,
    showChangeActDateModal: PropTypes.func.isRequired,
    loadShipmtCharges: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.loadForm(null, {
      tenantId: this.props.tenantId,
      shipmtNo: this.props.shipmt.shipmt_no,
    });
    this.props.loadShipmtCharges(this.props.dispatch.id, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.shipmt.shipmt_no !== this.props.shipmt.shipmt_no) {
      this.props.loadForm(null, {
        tenantId: this.props.tenantId,
        shipmtNo: nextProps.shipmt.shipmt_no,
      });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('goodsCode'),
    dataIndex: 'goods_no',
  }, {
    title: this.msg('goodsName'),
    dataIndex: 'name',
  }, {
    title: this.msg('goodsPackage'),
    dataIndex: 'package',
  }, {
    title: this.msg('goodsCount'),
    dataIndex: 'count',
  }, {
    title: this.msg('goodsWeight'),
    dataIndex: 'weight',
  }, {
    title: this.msg('goodsVolume'),
    dataIndex: 'volume',
  }, {
    title: this.msg('goodsLength'),
    dataIndex: 'length',
  }, {
    title: this.msg('goodsWidth'),
    dataIndex: 'width',
  }, {
    title: this.msg('goodsHeight'),
    dataIndex: 'height',
  }, {
    title: this.msg('goodsRemark'),
    dataIndex: 'remark',
  }]
  computeSaleCharge = (changedData, form, type, msg) => {
    const { upstream, downstream, tenantId, charges } = this.props;
    const promises = [];
    const {
      customer_partner_id, consigner_region_code, consignee_region_code,
      transport_mode_id, transport_mode_code, goods_type, container: ctn,
      vehicle_type_id, vehicle_length_id, total_weight, total_volume, pickup_est_date, deliver_est_date,
    } = this.props.formData;
    const created = this.props.formData.created_date || Date.now();
    if (charges.revenue.id) {
      const data = {
        partner_id: customer_partner_id,
        consigner_region_code,
        consignee_region_code,
        goods_type,
        trans_mode: transport_mode_id,
        transport_mode_code,
        ctn,
        tenant_id: this.props.tenantId,
        created_date: created,
        vehicle_type_id,
        vehicle_length_id,
        total_weight,
        total_volume,
        pickup_est_date,
        deliver_est_date,
        tariffType: 'normal',
        ...changedData,
      };
      promises.push(this.props.computeSaleCharge(data));
    }
    if (charges.expense.id) {
      const data = {
        partner_id: downstream.sp_partner_id,
        consigner_region_code,
        consignee_region_code,
        goods_type,
        trans_mode: transport_mode_id,
        transport_mode_code,
        ctn,
        tenant_id: tenantId,
        created_date: created,
        vehicle_type_id,
        vehicle_length_id,
        total_weight,
        total_volume,
        pickup_est_date,
        deliver_est_date,
        tariffType: 'normal',
        ...changedData,
      };
      promises.push(this.props.computeSaleCharge(data));
    }
    Promise.all(promises).then((result) => {
      if (result[0]) {
        const charge = result[0].data;
        if (charge.freight >= 0) {
          if (charge.freight !== charges.revenue.freight_charge) {
            notification.warn({
              message: msg,
              description: `原收入：${charges.revenue.freight_charge}, 现收入：${charge.freight}`,
            });
            const { meter, gradient, miles, quantity, unitRatio, coefficient } = charge;
            this.props.updateFee(upstream.id, {
              freight_charge: charge.freight,
              quote_no: charge.quoteNo,
              pickup_charge: charge.pickup,
              deliver_charge: charge.deliver,
              meter: charge.meter,
              quantity: charge.quantity,
              unit_ratio: charge.unitRatio,
              miles: charge.miles,
              charge_gradient: charge.gradient,
              adjust_coefficient: charge.coefficient,
              total_charge: charges.revenue.total_charge + (charge.freight - charges.revenue.freight_charge),
              charge_amount: getChargeAmountExpression(meter, gradient, miles, quantity,
              unitRatio, coefficient),
            });
          }
        } else {
          notification.warn({
            message: msg,
            description: '根据当前已有报价协议未计算出收入，您可以手动重新计算',
          });
          this.props.updateFee(upstream.id, { need_recalculate: 1 });
        }
      }
      if (result[1]) {
        const charge = result[1].data;
        if (charge.freight >= 0) {
          if (charge.freight !== charges.expense.freight_charge) {
            notification.warn({
              message: msg,
              description: `原成本：${charges.expense.freight_charge}, 现成本：${charge.freight}`,
            });
            const { meter, gradient, miles, quantity, unitRatio, coefficient } = charge;
            this.props.updateFee(downstream.id, {
              freight_charge: charge.freight,
              quote_no: charge.quoteNo,
              pickup_charge: charge.pickup,
              deliver_charge: charge.deliver,
              meter: charge.meter,
              quantity: charge.quantity,
              unit_ratio: charge.unitRatio,
              miles: charge.miles,
              charge_gradient: charge.gradient,
              adjust_coefficient: charge.coefficient,
              total_charge: charges.expense.total_charge + (charge.freight - charges.expense.freight_charge),
              charge_amount: getChargeAmountExpression(meter, gradient, miles, quantity,
              unitRatio, coefficient),
            });
          }
        } else {
          notification.warn({
            message: msg,
            description: '根据当前已有报价协议未计算出成本，您可以手动重新计算',
          });
          this.props.updateFee(downstream.id, { need_recalculate: 1 });
        }
      }

      this.handleSave(form, type, msg);
    });
  }
  handleChangeDistance = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'distanceInfoChanged' });
  }
  handleChangeTransitConsigner = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'consignerInfoChanged' });
  }
  handleChangeTransitConsignee = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'consigneeInfoChanged' });
  }

  handleSave = (shipment, type, msg = '') => {
    const { tenantId, loginId } = this.props;
    this.props.saveEdit(shipment, tenantId, loginId, type, msg)
    .then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.success(this.msg('changeShipmentSuccess'));
      }
    });
  }
  handleSaveShipment = (field, value, type = '') => {
    const { formData, goodsTypes } = this.props;
    const form = { ...formData, [field]: value };
    if (field === 'container') {
      const msg = `集装箱：${formData.container} 变更为 ${value}`;
      this.computeSaleCharge({ [field]: value }, form, type, msg);
    } else if (field === 'goods_type') {
      const oldGoodsType = goodsTypes.find(item => item.value === formData.goods_type);
      const newGoodsType = goodsTypes.find(item => item.value === Number(value));
      const msg = `货物类型：${oldGoodsType.text} 变更为 ${newGoodsType.text}`;
      this.computeSaleCharge({ [field]: value }, form, type, msg);
    } else if (field === 'total_weight') {
      const msg = `总重量：${formData.total_weight} 变更为 ${value}`;
      this.computeSaleCharge({ [field]: value }, form, type, msg);
    } else if (field === 'total_volume') {
      const msg = `总体积：${formData.total_volume} 变更为 ${value}`;
      this.computeSaleCharge({ [field]: value }, form, type, msg);
    } else {
      this.handleSave(form, type);
    }
  }
  handleSaveTransMode = (value, type = '') => {
    const { formData, transitModes } = this.props;
    const mode = transitModes.find(item => item.id === Number(value));
    const form = {
      ...formData,
      transport_mode_id: mode.id,
      transport_mode_code: mode.mode_code,
      transport_mode: mode.mode_name,
    };
    const msg = `运输模式：${formData.transport_mode} 变更为 ${mode.mode_name}`;
    this.computeSaleCharge({ trans_mode: mode.id }, form, type, msg);
  }
  handleSaveVehicleType = (value, type = '') => {
    const { formData, vehicleTypes } = this.props;
    const vehicle = vehicleTypes.find(item => item.value === Number(value));
    const form = {
      ...formData,
      vehicle_type_id: vehicle.value,
      vehicle_type: vehicle.text,
    };
    const msg = `车辆类型：${formData.vehicle_type} 变更为 ${vehicle.text}`;
    this.computeSaleCharge({ vehicle_type_id: vehicle.value }, form, type, msg);
  }
  handleSaveVehicleLength = (value, type = '') => {
    const { formData, vehicleLengths } = this.props;
    const vehicle = vehicleLengths.find(item => item.value === Number(value));
    const form = {
      ...formData,
      vehicle_length_id: vehicle.value,
      vehicle_length: vehicle.text,
    };
    const msg = `车长：${formData.vehicle_length} 变更为 ${vehicle.text}`;
    this.computeSaleCharge({ vehicle_length_id: vehicle.value }, form, type, msg);
  }
  handleSaveCourier = (value, type = '') => {
    const { formData } = this.props;
    const courier = COURIERS.find(item => item.code === value);
    const form = {
      ...formData,
      courier_code: courier.code,
      courier: courier.name,
    };
    this.handleSave(form, type);
  }
  handleSaveConsign = (value, consignType, type = '') => {
    const { formData } = this.props;
    const [code, province, city, district, street] = value;
    if (typeof code === 'number') {
      const changedData = {
        [`${consignType}_region_code`]: code,
        [`${consignType}_province`]: province || '',
        [`${consignType}_city`]: city || '',
        [`${consignType}_district`]: district || '',
        [`${consignType}_street`]: street || '',
      };
      const form = {
        ...formData,
        ...changedData,
      };
      const oldAddr = [];
      if (formData[`${consignType}_province`]) oldAddr.push(formData[`${consignType}_province`]);
      if (formData[`${consignType}_city`]) oldAddr.push(formData[`${consignType}_city`]);
      if (formData[`${consignType}_district`]) oldAddr.push(formData[`${consignType}_district`]);
      if (formData[`${consignType}_street`]) oldAddr.push(formData[`${consignType}_street`]);
      const newAddr = [];
      if (province) newAddr.push(province);
      if (city) newAddr.push(city);
      if (district) newAddr.push(district);
      if (street) newAddr.push(street);
      const msg = `${consignType === 'consigner' ? '发货' : '收货'}地址：${oldAddr.join('-')} 变更为 ${newAddr.join('-')}`;
      this.computeSaleCharge({ [`${consignType}_region_code`]: code }, form, type, msg);
    }
  }
  handleShowChangeActDateModal = (type) => {
    this.props.showChangeActDateModal(true, type);
  }
  render() {
    const { tenantId, shipmt, goodsTypes, packagings, vehicleTypes, vehicleLengths, dispatch, transitModes, containerPackagings } = this.props;
    const pckg = packagings.find(item => item.package_code === shipmt.package);
    const goodsType = goodsTypes.find(item => item.value === shipmt.goods_type);
    const vehicleType = vehicleTypes.find(item => item.value === shipmt.vehicle_type_id);
    const vehicleLength = vehicleLengths.find(item => item.value === shipmt.vehicle_length_id);
    let statusDesc = TMS_SHIPMENT_STATUS_DESC;
    if (dispatch.pod_type === 'none') statusDesc = TMS_SHIPMENT_STATUS_DESC.filter(item => item.status <= 5);
    const editable = tenantId === shipmt.tenant_id && dispatch.status <= SHIPMENT_TRACK_STATUS.delivered;
    const terminable = tenantId === shipmt.tenant_id && dispatch.status < SHIPMENT_TRACK_STATUS.intransit;
    let shipmtScheduleExtra = (<div />);
    if (tenantId === shipmt.tenant_id) {
      shipmtScheduleExtra = (
        <Dropdown overlay={(
          <Menu>
            <Menu.Item>
              <a onClick={this.handleChangeTransitConsigner}>修改发货信息</a>
            </Menu.Item>
            <Menu.Item>
              <a onClick={this.handleChangeTransitConsignee}>修改收货信息</a>
            </Menu.Item>
            <Menu.Item>
              <a onClick={this.handleChangeDistance}>修改路程</a>
            </Menu.Item>
          </Menu>)}
        >
          <a className="ant-dropdown-link">
            <Icon type="edit" />
          </a>
        </Dropdown>
      );
    }
    const distanceStr = shipmt.distance ? `${shipmt.distance}${this.msg('kilometer')}` : '';
    return (
      <div className="pane-content tab-pane">
        <Card
          title={`${this.msg('shipmtSchedule')} ${shipmt.transit_time || '当'}${this.msg('day')} ${distanceStr}`}
          bodyStyle={{ padding: 16 }}
          extra={shipmtScheduleExtra}
        >
          <div className="trans_schedule">
            <div className="schedule">
              <Steps direction="vertical">
                <Step key={0} title={shipmt.consigner_name || (<div style={{ height: 26 }} />)} status="process"
                  icon={<div className="icon">始</div>}
                  description={
                    <div>
                      <Row>
                        <InfoItem label={this.msg('pickupEstDate')}
                          type="date"
                          field={moment(shipmt.pickup_est_date).format('YYYY-MM-DD')}
                          editable={editable}
                          onEdit={value => this.handleSaveShipment('pickup_est_date', new Date(value), 'timeInfoChanged')}
                        />
                      </Row>
                      <Row gutter={10}>
                        <Col span={10}>
                          <InfoItem label="发货地"
                            type="regionCascade"
                            editable={editable}
                            field={[
                              shipmt.consigner_province,
                              shipmt.consigner_city,
                              shipmt.consigner_district,
                              shipmt.consigner_street,
                            ]}
                            onEdit={value => this.handleSaveConsign(value, 'consigner', 'consignerInfoChanged')}
                          />
                        </Col>
                        <Col span={14}>
                          <InfoItem label="详细地址"
                            editable={editable}
                            field={shipmt.consigner_addr}
                            onEdit={value => this.handleSaveShipment('consigner_addr', value, 'consignerInfoChanged')}
                          />
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col span={10}>
                          <InfoItem label="联系人"
                            field={shipmt.consigner_contact}
                            editable={editable}
                            onEdit={value => this.handleSaveShipment('consigner_contact', value, 'consignerInfoChanged')}
                          />
                        </Col>
                        <Col span={14}>
                          <InfoItem label="电话"
                            field={shipmt.consigner_mobile}
                            editable={editable}
                            onEdit={value => this.handleSaveShipment('consigner_mobile', value, 'consignerInfoChanged')}
                          />
                        </Col>
                      </Row>
                    </div>
                }
                />
              </Steps>
            </div>
            <div className="schedule">
              <Steps direction="vertical">
                <Step key={0} title={shipmt.consignee_name || (<div style={{ height: 26 }} />)} status="process"
                  icon={<div className="icon">终</div>}
                  description={
                    <div>
                      <Row>
                        <InfoItem label={this.msg('deliveryEstDate')}
                          type="date"
                          field={moment(shipmt.deliver_est_date).format('YYYY-MM-DD')}
                          editable={editable}
                          onEdit={value => this.handleSaveShipment('deliver_est_date', new Date(value), 'timeInfoChanged')}
                        />
                      </Row>
                      <Row gutter={10}>
                        <Col span={10}>
                          <InfoItem label="收货地"
                            type="regionCascade"
                            editable={editable}
                            field={[
                              shipmt.consignee_province,
                              shipmt.consignee_city,
                              shipmt.consignee_district,
                              shipmt.consigneestreet,
                            ]}
                            onEdit={value => this.handleSaveConsign(value, 'consignee', 'consigneeInfoChanged')}
                          />
                        </Col>
                        <Col span={14}>
                          <InfoItem label="详细地址"
                            editable={editable}
                            field={shipmt.consignee_addr}
                            onEdit={value => this.handleSaveShipment('consignee_addr', value, 'consigneeInfoChanged')}
                          />
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col span={10}>
                          <InfoItem label="联系人"
                            field={shipmt.consignee_contact}
                            editable={editable}
                            onEdit={value => this.handleSaveShipment('consignee_contact', value, 'consigneeInfoChanged')}
                          />
                        </Col>
                        <Col span={14}>
                          <InfoItem label="电话"
                            field={shipmt.consignee_mobile}
                            editable={editable}
                            onEdit={value => this.handleSaveShipment('consignee_mobile', value, 'consigneeInfoChanged')}
                          />
                        </Col>
                      </Row>
                    </div>
                }
                />
              </Steps>
            </div>
          </div>
          <div className="card-footer">
            <Steps progressDot current={dispatch.status - 2}>
              {statusDesc.map((step) => {
                let desc = step.text;
                if (step.status <= dispatch.status) {
                  if (step.status === SHIPMENT_TRACK_STATUS.intransit) {
                    const act = new Date(dispatch[step.date]);
                    act.setHours(0, 0, 0, 0);
                    const est = new Date(shipmt.pickup_est_date);
                    est.setHours(0, 0, 0, 0);
                    if (act.getTime() > est.getTime()) {
                      desc = (
                        <span className="mdc-text-red">
                          {step.text} {moment(dispatch[step.date]).format('YYYY.MM.DD')}
                        </span>);
                    } else {
                      desc = dispatch[step.date] ? `${step.text} ${moment(dispatch[step.date]).format('YYYY.MM.DD')}` : step.text;
                    }
                    desc = <span>{desc} <a><Icon type="edit" onClick={() => this.handleShowChangeActDateModal('pickupActDate')} /></a></span>;
                  } else if (step.status === SHIPMENT_TRACK_STATUS.delivered) {
                    const act = new Date(dispatch[step.date]);
                    act.setHours(0, 0, 0, 0);
                    const est = new Date(shipmt.deliver_est_date);
                    est.setHours(0, 0, 0, 0);
                    if (act.getTime() > est.getTime()) {
                      desc = (
                        <span className="mdc-text-red">
                          {step.text} {moment(dispatch[step.date]).format('YYYY.MM.DD')}
                        </span>);
                    } else {
                      desc = dispatch[step.date] ? `${step.text} ${moment(dispatch[step.date]).format('YYYY.MM.DD')}` : step.text;
                    }
                    desc = <span>{desc} <a><Icon type="edit" onClick={() => this.handleShowChangeActDateModal('deliverActDate')} /></a></span>;
                  } else {
                    desc = dispatch[step.date] ? `${step.text} ${moment(dispatch[step.date]).format('YYYY.MM.DD')}` : step.text;
                  }
                }
                return (<Step description={desc} key={step.status} />);
              })}
            </Steps>
          </div>
        </Card>
        <Card title={this.msg('transitModeInfo')} bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <InfoItem label={this.msg('transitModeInfo')}
                field={shipmt.transport_mode}
                editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveTransMode(e.key, 'transitModeChanged')}>
                  {transitModes.map(tm => (<Menu.Item key={tm.id}>{tm.mode_name}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="8">
              <InfoItem label={this.msg('vehicleType')}
                field={vehicleType ? vehicleType.text : ''}
                editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveVehicleType(e.key, 'transitModeChanged')}>
                  {vehicleTypes.map(tm => (<Menu.Item key={tm.value}>{tm.text}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="8">
              <InfoItem label={this.msg('vehicleLength')}
                field={vehicleLength ? vehicleLength.text : ''} addonAfter="米"
                editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveVehicleLength(e.key, 'transitModeChanged')}>
                  {vehicleLengths.map(tm => (<Menu.Item key={tm.value}>{tm.text}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ctn &&
            <Col span="8">
              <InfoItem label={this.msg('container')}
                field={shipmt.container}
                editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveShipment('container', e.key, 'transitModeChanged')}>
                  {containerPackagings.map(tm => (<Menu.Item key={tm.key}>{tm.value}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ctn &&
            <Col span="8">
              <InfoItem label={this.msg('containerNo')}
                field={shipmt.container_no}
                editable={editable}
                onEdit={value => this.handleSaveShipment('container_no', value, 'transitModeChanged')}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.exp &&
            <Col span="8">
              <InfoItem label={this.msg('courierCompany')}
                field={shipmt.courier}
                editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveCourier(e.key, 'transitModeChanged')}>
                  {COURIERS.map(c => (<Menu.Item key={c.code}>{c.name}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.exp &&
            <Col span="8">
              <InfoItem label={this.msg('courierNo')}
                field={shipmt.courier_no}
                editable={editable}
                onEdit={value => this.handleSaveShipment('courier_no', value, 'transitModeChanged')}
              />
            </Col>
            }
          </Row>
        </Card>
        <Card title={this.msg('goodsInfo')} bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <InfoItem label={this.msg('goodsType')}
                field={goodsType ? goodsType.text : shipmt.goods_type} editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveShipment('goods_type', e.key, 'goodsInfoChanged')}>
                  {goodsTypes.map(c => (<Menu.Item key={c.value}>{c.text}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('goodsPackage')}
                field={pckg ? pckg.package_name : shipmt.package} editable={editable}
                type="dropdown"
                overlay={<Menu onClick={e => this.handleSaveShipment('package', e.key, 'goodsInfoChanged')}>
                  {packagings.map(c => (<Menu.Item key={c.package_code}>{c.package_name}</Menu.Item>))}
                </Menu>}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('insuranceValue')}
                field={shipmt.insure_value} addonAfter="元" editable={editable}
                onEdit={value => this.handleSaveShipment('insure_value', value, 'goodsInfoChanged')}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('totalCount')}
                field={shipmt.total_count} addonAfter="件" editable={editable}
                onEdit={value => this.handleSaveShipment('total_count', value, 'goodsInfoChanged')}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('totalWeight')}
                field={shipmt.total_weight} addonAfter={this.msg('kilogram')} editable={editable}
                onEdit={value => this.handleSaveShipment('total_weight', value, 'goodsInfoChanged')}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('totalVolume')}
                field={shipmt.total_volume} addonAfter={this.msg('cubicMeter')} editable={editable}
                onEdit={value => this.handleSaveShipment('total_volume', value, 'goodsInfoChanged')}
              />
            </Col>
          </Row>
          <Table size="small" columns={this.columns} pagination={false}
            dataSource={shipmt.goodslist}
          />
        </Card>
        <Card title={this.msg('customerInfo')} bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <InfoItem label={this.msg('refExternalNo')} addonBefore={<Icon type="tag-o" />}
                field={shipmt.ref_external_no} editable={editable}
                onEdit={value => this.handleSaveShipment('ref_external_no', value, 'correlInfoChanged')}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('refWaybillNo')} addonBefore={<Icon type="tag-o" />}
                field={shipmt.ref_waybill_no} editable={editable}
                onEdit={value => this.handleSaveShipment('ref_waybill_no', value, 'correlInfoChanged')}
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('refEntryNo')} addonBefore={<Icon type="tag-o" />}
                field={shipmt.ref_entry_no} editable={editable}
                onEdit={value => this.handleSaveShipment('ref_entry_no', value, 'correlInfoChanged')}
              />
            </Col>
            <Col span="24">
              <InfoItem label={this.msg('remark')}
                field={shipmt.remark} editable={editable}
                onEdit={value => this.handleSaveShipment('remark', value, 'remarkChanged')}
              />
            </Col>
          </Row>
        </Card>
        <div>
          {terminable &&
          (<Button type="danger" size="large" icon="delete" onClick={() => this.props.revokeOrReject('revoke', shipmt.shipmt_no, dispatch.id)}>
            终止运单
          </Button>)}

        </div>
        <PrivilegeCover module="transport" feature="shipment" action="edit">
          <ChangeShipment />
        </PrivilegeCover>
      </div>
    );
  }
}
