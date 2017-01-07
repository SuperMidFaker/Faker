import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Table, Steps, Card, Icon, Dropdown, Menu, Row } from 'antd';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { renderConsignLoc } from '../../../common/consignLocation';
import { PRESET_TRANSMODES } from 'common/constants';
import ChangeShipment from '../change-shipment';
import { showChangeShipmentModal } from 'common/reducers/shipment';
import InfoItem from 'client/components/InfoItem';
import ActDate from '../../../common/actDate';
import messages from '../../message.i18n';
import './pane.less';

const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    shipmt: state.shipment.previewer.shipmt,
    goodsTypes: state.shipment.formRequire.goodsTypes,
    packagings: state.shipment.formRequire.packagings,
    containerPackagings: state.shipment.formRequire.containerPackagings,
    vehicleTypes: state.shipment.formRequire.vehicleTypes,
    vehicleLengths: state.shipment.formRequire.vehicleLengths,
    dispatch: state.shipment.previewer.dispatch,
  }),
  { showChangeShipmentModal }
)
export default class DetailPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shipmt: PropTypes.object.isRequired,
    goodsTypes: PropTypes.array.isRequired,
    packagings: PropTypes.array.isRequired,
    containerPackagings: PropTypes.array.isRequired,
    showChangeShipmentModal: PropTypes.func.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    dispatch: PropTypes.object.isRequired,
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
    const { shipmt, goodsTypes, packagings, containerPackagings, vehicleTypes, vehicleLengths, dispatch } = this.props;
    const apackagings = this.props.shipmt.transport_mode_code === 'CTN' ? containerPackagings : packagings.map(pk => ({
      key: pk.package_code,
      value: pk.package_name,
    }));
    const pckg = apackagings.find(item => item.key === shipmt.package);
    const goodsType = goodsTypes.find(item => item.value === shipmt.goods_type);
    const vehicleType = vehicleTypes.find(item => item.value === shipmt.vehicle_type_id);
    const vehicleLength = vehicleLengths.find(item => item.value === shipmt.vehicle_length_id);
    let clientInfo = '';
    let shipmtSchedule = (<div />);

    if (shipmt.status <= 5) {
      clientInfo = (
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
      shipmtSchedule = (
        <Dropdown overlay={(
          <Menu>
            <Menu.Item>
              <a onClick={this.handleChangeTransitConsigner}>修改发货信息</a>
            </Menu.Item>
            <Menu.Item>
              <a onClick={this.handleChangeTransitConsignee}>修改收货信息</a>
            </Menu.Item>
            <Menu.Item>
              <a onClick={this.handleChangeTransitTime}>修改时间信息</a>
            </Menu.Item>
          </Menu>)}
        >
          <a className="ant-dropdown-link">
            <Icon type="edit" />
          </a>
        </Dropdown>
      );
    }

    let pickupDate = moment(shipmt.pickup_est_date).format('YYYY-MM-DD');
    if (dispatch.pickup_act_date) {
      pickupDate = (<div>{moment(shipmt.pickup_est_date).format('YYYY-MM-DD')} <span style={{ marginLeft: 30, fontSize: '70%' }}><ActDate actDate={dispatch.pickup_act_date} estDate={shipmt.pickup_est_date} textAfter="已提货" /></span></div>);
    }
    let deliverDate = moment(shipmt.deliver_est_date).format('YYYY-MM-DD');
    if (dispatch.deliver_act_date) {
      deliverDate = (<div>{moment(shipmt.deliver_est_date).format('YYYY-MM-DD')} <span style={{ marginLeft: 30, fontSize: '70%' }}><ActDate actDate={dispatch.deliver_act_date} estDate={shipmt.deliver_est_date} textAfter="已交货" /></span></div>);
    }
    return (
      <div className="pane-content tab-pane">
        <Card title={this.msg('customerInfo')} bodyStyle={{ padding: 8 }}
          extra={clientInfo}
        >
          <Row>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('client')}
                field={shipmt.customer_name} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('refExternalNo')}
                field={shipmt.ref_external_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('acceptTime')}
                field={dispatch.acpt_time ? moment(dispatch.acpt_time).format('YYYY.MM.DD') : ''} fieldCol={{ span: 21 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('refWaybillNo')}
                field={shipmt.ref_waybill_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('refEntryNo')}
                field={shipmt.ref_entry_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('remark')}
                field={shipmt.remark} fieldCol={{ span: 21 }}
              />
            </Col>
          </Row>
        </Card>
        <Card title={`${this.msg('shipmtSchedule')} ${shipmt.transit_time || '当'}${this.msg('day')}`} bodyStyle={{ padding: 8 }}
          extra={shipmtSchedule}
        >
          <div className="trans_schedule">
            <div className="schedule">
              <Steps direction="vertical">
                <Step key={0} title={shipmt.consigner_name || (<div style={{ height: 26 }} />)} status="process"
                  icon={<div className="icon">始</div>}
                  description={
                    <div>
                      <InfoItem labelCol={{ span: 8 }} label={this.msg('pickupEstDate')}
                        field={pickupDate} fieldCol={{ span: 16 }}
                      />
                      <InfoItem labelCol={{ span: 8 }} label="发货地"
                        field={`${renderConsignLoc(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`} fieldCol={{ span: 16 }}
                      />
                      <InfoItem labelCol={{ span: 8 }} label="联系人/电话"
                        field={`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`} fieldCol={{ span: 16 }}
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
                      <InfoItem labelCol={{ span: 8 }} label={this.msg('deliveryEstDate')}
                        field={deliverDate} fieldCol={{ span: 16 }}
                      />
                      <InfoItem labelCol={{ span: 8 }} label="收货地"
                        field={`${renderConsignLoc(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`} fieldCol={{ span: 16 }}
                      />
                      <InfoItem labelCol={{ span: 8 }} label="联系人/电话"
                        field={`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`} fieldCol={{ span: 16 }}
                      />
                    </div>
                }
                />
              </Steps>
            </div>
          </div>
        </Card>
        <Card title={this.msg('transitModeInfo')} bodyStyle={{ padding: 8 }}
          extra={<a onClick={this.handleChangeTransitMode}><Icon type="edit" /></a>}
        >
          <Row>
            <Col span="12">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('transitModeInfo')}
                field={shipmt.transport_mode} fieldCol={{ span: 16 }}
              />
            </Col>
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('vehicleType')}
                field={vehicleType ? vehicleType.text : ''} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('vehicleLength')}
                field={vehicleLength ? vehicleLength.text : ''} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ctn &&
            <Col span="12">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('containerNo')}
                field={shipmt.container_no} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.exp &&
            <Col span="12">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('courierNo')}
                field={shipmt.courier_no} fieldCol={{ span: 16 }}
              />
            </Col>
            }
          </Row>
        </Card>
        <Card title={this.msg('goodsInfo')} bodyStyle={{ padding: 8 }}
          extra={<a onClick={this.handleChangeTransitGoodsInfo}><Icon type="edit" /></a>}
        >
          <Row>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('goodsType')}
                field={goodsType ? goodsType.text : shipmt.goods_type} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('goodsPackage')}
                field={pckg ? pckg.value : shipmt.package} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('insuranceValue')}
                field={shipmt.insure_value} fieldCol={{ span: 16 }}
              />
            </Col>

            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('totalCount')}
                field={shipmt.total_count || ''} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('totalWeight')}
                field={shipmt.total_weight !== null ? `${shipmt.total_weight} ${this.msg('kilogram')}` : ''} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 8 }} label={this.msg('totalVolume')}
                field={shipmt.total_volume !== null ? `${shipmt.total_volume} ${this.msg('cubicMeter')}` : ''} fieldCol={{ span: 16 }}
              />
            </Col>
          </Row>
          <Table size="small" columns={this.columns} pagination={false}
            dataSource={shipmt.goodslist}
          />
        </Card>
        <PrivilegeCover module="transport" feature="shipment" action="edit">
          <ChangeShipment />
        </PrivilegeCover>
      </div>
    );
  }
}
