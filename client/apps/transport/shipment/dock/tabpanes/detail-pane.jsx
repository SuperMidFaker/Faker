import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Table, Steps, Card, Icon, Dropdown, Menu, Row } from 'antd';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { renderConsignLoc } from '../../../common/consignLocation';
import { PRESET_TRANSMODES, TMS_SHIPMENT_STATUS_DESC } from 'common/constants';
import ChangeShipment from '../change-shipment';
import { showChangeShipmentModal } from 'common/reducers/shipment';
import { showChangeDeliverPrmDateModal } from 'common/reducers/trackingLandStatus';
import InfoItem from 'client/components/InfoItem';
import ActDate from '../../../common/actDate';
import messages from '../../message.i18n';
import './pane.less';

const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmt: state.shipment.previewer.shipmt,
    goodsTypes: state.shipment.formRequire.goodsTypes,
    packagings: state.shipment.formRequire.packagings,
    containerPackagings: state.shipment.formRequire.containerPackagings,
    vehicleTypes: state.shipment.formRequire.vehicleTypes,
    vehicleLengths: state.shipment.formRequire.vehicleLengths,
    dispatch: state.shipment.previewer.dispatch,
  }),
  { showChangeShipmentModal, showChangeDeliverPrmDateModal }
)
export default class DetailPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    shipmt: PropTypes.object.isRequired,
    goodsTypes: PropTypes.array.isRequired,
    packagings: PropTypes.array.isRequired,
    containerPackagings: PropTypes.array.isRequired,
    showChangeShipmentModal: PropTypes.func.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    dispatch: PropTypes.object.isRequired,
    showChangeDeliverPrmDateModal: PropTypes.func.isRequired,
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

  handleChangeTransitMode = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'transitModeChanged' });
  }
  handleChangeTransitTime = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'timeInfoChanged' });
  }
  handleChangeDeliverPrmDate = (e) => {
    e.stopPropagation();
    const { shipmt, dispatch } = this.props;
    this.props.showChangeDeliverPrmDateModal({ visible: true, shipmtNo: shipmt.shipmt_no, dispId: dispatch.id, deliverPrmDate: dispatch.deliver_prm_date });
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
  handleChangeCorrelInfo = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'correlInfoChanged' });
  }
  handleChangeClientInfo = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'clientInfoChanged' });
  }
  handleChangeTransitConsignee = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'consigneeInfoChanged' });
  }
  handleChangeTransitGoodsInfo = (e) => {
    e.stopPropagation();
    const { shipmt } = this.props;
    this.props.showChangeShipmentModal({ visible: true, shipmtNo: shipmt.shipmt_no, type: 'goodsInfoChanged' });
  }
  renderConsignPort(province, city, district) {
    if (city === '市辖区' || city === '县') {
      return `${province},${district}`;
    } else {
      return `${province},${city}`;
    }
  }
  render() {
    const { tenantId, shipmt, goodsTypes, packagings, vehicleTypes, vehicleLengths, dispatch } = this.props;
    const pckg = packagings.find(item => item.package_code === shipmt.package);
    const goodsType = goodsTypes.find(item => item.value === shipmt.goods_type);
    const vehicleType = vehicleTypes.find(item => item.value === shipmt.vehicle_type_id);
    const vehicleLength = vehicleLengths.find(item => item.value === shipmt.vehicle_length_id);
    let statusDesc = TMS_SHIPMENT_STATUS_DESC;
    if (dispatch.pod_type === 'none') statusDesc = TMS_SHIPMENT_STATUS_DESC.filter(item => item.status <= 5);

    let clientInfoExtra = '';
    let shipmtScheduleExtra = (<div />);
    let transitModeInfoExtra = '';
    let goodsInfoExtra = '';
    if (tenantId === shipmt.tenant_id && dispatch.status <= 5) {
      clientInfoExtra = (
        <Dropdown overlay={(
          <Menu>
            <Menu.Item>
              <a onClick={this.handleChangeClientInfo}>修改客户单号</a>
            </Menu.Item>
            <Menu.Item>
              <a onClick={this.handleChangeCorrelInfo}>修改其他单号</a>
            </Menu.Item>
          </Menu>)}
        >
          <a className="ant-dropdown-link">
            <Icon type="edit" />
          </a>
        </Dropdown>
      );
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
              <a onClick={this.handleChangeTransitTime}>修改计划时间信息</a>
            </Menu.Item>
            <Menu.Item>
              <a onClick={this.handleChangeDeliverPrmDate}>修改承诺送货时间</a>
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
      transitModeInfoExtra = (<a onClick={this.handleChangeTransitMode}><Icon type="edit" /></a>);
      goodsInfoExtra = (<a onClick={this.handleChangeTransitGoodsInfo}><Icon type="edit" /></a>);
    }

    let pickupDate = moment(shipmt.pickup_est_date).format('YYYY-MM-DD');
    if (dispatch.pickup_act_date) {
      pickupDate = (
        <div>
          {moment(shipmt.pickup_est_date).format('YYYY-MM-DD')}
          <span style={{ marginLeft: 30, fontSize: '70%' }}>
            <ActDate actDate={dispatch.pickup_act_date} estDate={shipmt.pickup_est_date} textAfter="已提货" />
          </span>
        </div>);
    }
    let deliverDate = moment(shipmt.deliver_est_date).format('YYYY-MM-DD');
    if (dispatch.deliver_act_date) {
      deliverDate = (<div>
        {moment(shipmt.deliver_est_date).format('YYYY-MM-DD')}
        <span style={{ marginLeft: 30, fontSize: '70%' }}>
          <ActDate actDate={dispatch.deliver_act_date} estDate={shipmt.deliver_est_date} textAfter="已送货" />
        </span>
      </div>);
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
                      <InfoItem label={this.msg('pickupEstDate')}
                        field={pickupDate}
                      />
                      <InfoItem label="发货地"
                        field={`${renderConsignLoc(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`}
                      />
                      <InfoItem label="联系人/电话"
                        field={`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`}
                      />
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
                      <InfoItem label={this.msg('deliveryEstDate')}
                        field={deliverDate}
                      />
                      <InfoItem label="收货地"
                        field={`${renderConsignLoc(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`}
                      />
                      <InfoItem label="联系人/电话"
                        field={`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`}
                      />
                    </div>
                }
                />
              </Steps>
            </div>
          </div>
          <div className="card-footer">
            <Steps progressDot current={dispatch.status}>
              {statusDesc.map((step) => {
                let date = '';
                if (step.status === 1) date = shipmt[step.date] ? moment(shipmt[step.date]).format('MM.DD HH.MM') : '';
                else date = dispatch[step.date] ? moment(dispatch[step.date]).format('MM.DD HH.MM') : '';
                return (<Step description={`${step.text} ${date}`} key={step.status} />);
              })}
            </Steps>
          </div>
        </Card>
        <Card title={this.msg('transitModeInfo')} bodyStyle={{ padding: 16 }}
          extra={transitModeInfoExtra}
        >
          <Row>
            <Col span="12">
              <InfoItem label={this.msg('transitModeInfo')}
                field={shipmt.transport_mode}
              />
            </Col>
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <InfoItem label={this.msg('vehicleType')}
                field={vehicleType ? vehicleType.text : ''}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <InfoItem label={this.msg('vehicleLength')}
                field={vehicleLength ? vehicleLength.text : ''} addonAfter="米"
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ctn &&
            <Col span="12">
              <InfoItem label={this.msg('containerNo')}
                field={shipmt.container_no}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.exp &&
            <Col span="12">
              <InfoItem label={this.msg('courierNo')}
                field={shipmt.courier_no}
              />
            </Col>
            }
          </Row>
        </Card>
        <Card title={this.msg('goodsInfo')} bodyStyle={{ padding: 16 }}
          extra={goodsInfoExtra}
        >
          <Row>
            <Col span="8">
              <InfoItem label={this.msg('goodsType')}
                field={goodsType ? goodsType.text : shipmt.goods_type} editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('goodsPackage')}
                field={pckg ? pckg.value : shipmt.package} editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('insuranceValue')}
                field={shipmt.insure_value} addonAfter="元" editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('totalCount')}
                field={shipmt.total_count} addonAfter="件" editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('totalWeight')}
                field={shipmt.total_weight} addonAfter={this.msg('kilogram')} editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('totalVolume')}
                field={shipmt.total_volume} addonAfter={this.msg('cubicMeter')} editable
              />
            </Col>
          </Row>
          <Table size="small" columns={this.columns} pagination={false}
            dataSource={shipmt.goodslist}
          />
        </Card>
        <Card title={this.msg('customerInfo')} bodyStyle={{ padding: 16 }} extra={clientInfoExtra}>
          <Row>
            <Col span="8">
              <InfoItem label={this.msg('refExternalNo')} addonBefore={<Icon type="tag-o" />}
                field={shipmt.ref_external_no} editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('refWaybillNo')} addonBefore={<Icon type="tag-o" />}
                field={shipmt.ref_waybill_no} editable
              />
            </Col>
            <Col span="8">
              <InfoItem label={this.msg('refEntryNo')} addonBefore={<Icon type="tag-o" />}
                field={shipmt.ref_entry_no} editable
              />
            </Col>
            <Col span="24">
              <InfoItem label={this.msg('remark')}
                field={shipmt.remark} editable
              />
            </Col>
          </Row>
        </Card>
        <PrivilegeCover module="transport" feature="shipment" action="edit">
          <ChangeShipment />
        </PrivilegeCover>
      </div>
    );
  }
}
