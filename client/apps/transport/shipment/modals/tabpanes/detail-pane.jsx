import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Table, Collapse, Steps } from 'antd';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { renderConsignLoc } from '../../../common/consignLocation';
import { PRESET_TRANSMODES } from 'common/constants';
import ChangeShipment from '../change-shipment';
import { showChangeShipmentModal } from 'common/reducers/shipment';
import ActDate from '../../../common/actDate';
import messages from '../../message.i18n';
import './pane.less';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const Step = Steps.Step;

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}
function PaneFormItem(props) {
  const { label, labelCol, field, fieldCol } = props;
  const labelCls = `info-label ${getColCls(labelCol)}`;
  const fieldCls = `info-data ${getColCls(fieldCol)}`;
  return (
    <div className="info-item">
      <div className={labelCls}>{label}：</div>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}
PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  field: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fieldCol: PropTypes.object,
};
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
    let clientInfo = this.msg('customerInfo');
    let shipmtSchedule = `${this.msg('shipmtSchedule')} ${shipmt.transit_time || '当'}${this.msg('day')}`;
    let transitModeInfo = `${this.msg('transitModeInfo')} ${shipmt.transport_mode}`;
    let goodsInfo = `${this.msg('goodsInfo')}  ${this.msg('totalCount')}: ${shipmt.total_count || ''} / ${this.msg('totalWeight')}: ${shipmt.total_weight || ''}${this.msg('kilogram')} / ${this.msg('totalVolume')}: ${shipmt.total_volume || ''}${this.msg('cubicMeter')}`;
    if (shipmt.status <= 5) {
      clientInfo = (<div>{this.msg('customerInfo')}
        <div className="extra-actions">
          <a onClick={this.handleChangeClientInfo}>修改客户单号</a>
          <span className="ant-divider" />
          <a onClick={this.handleChangeCorrelInfo}>修改其他单号</a>
        </div>
      </div>);
      shipmtSchedule = (<div>{this.msg('shipmtSchedule')} {shipmt.transit_time || '当'}{this.msg('day')}
        <div className="extra-actions">
          <a onClick={this.handleChangeTransitConsigner}>修改发货信息</a>
          <span className="ant-divider" />
          <a onClick={this.handleChangeTransitConsignee}>修改收货信息</a>
          <span className="ant-divider" />
          <a onClick={this.handleChangeTransitTime}>修改时间信息</a>
        </div>
      </div>);
      transitModeInfo = (
        <div>{this.msg('transitModeInfo')} {shipmt.transport_mode}
          <div className="extra-actions"><a onClick={this.handleChangeTransitMode}>修改</a></div>
        </div>);
      goodsInfo = (
        <div>{this.msg('goodsInfo')} {this.msg('totalCount')}: {shipmt.total_count || ''} / {this.msg('totalWeight')}: {shipmt.total_weight || ''}{this.msg('kilogram')} / {this.msg('totalVolume')}: {shipmt.total_volume || ''}{this.msg('cubicMeter')}
          <div className="extra-actions"><a onClick={this.handleChangeTransitGoodsInfo}>修改</a></div>
        </div>);
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
        <Collapse defaultActiveKey={['customer', 'trans_schedule', 'trans_mode']}>
          <Panel header={clientInfo} key="customer">
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('client')}
                field={shipmt.customer_name} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('acceptTime')}
                field={dispatch.acpt_time ? moment(dispatch.acpt_time).format('YYYY.MM.DD') : ''} fieldCol={{ span: 21 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('remark')}
                field={shipmt.remark} fieldCol={{ span: 21 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refExternalNo')}
                field={shipmt.ref_external_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refWaybillNo')}
                field={shipmt.ref_waybill_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refEntryNo')}
                field={shipmt.ref_entry_no} fieldCol={{ span: 16 }}
              />
            </Col>
          </Panel>
          <Panel header={shipmtSchedule} key="trans_schedule">
            <div className="trans_schedule">
              <div className="schedule">
                <Steps direction="vertical">
                  <Step key={0} title={shipmt.consigner_name || ''} status="process"
                    icon={<div className="icon">始</div>}
                    description={
                      <div className="stepBody">
                        <PaneFormItem labelCol={{ span: 8 }} label={this.msg('pickupEstDate')}
                          field={pickupDate} fieldCol={{ span: 16 }}
                        />
                        <PaneFormItem labelCol={{ span: 8 }} label="发货地"
                          field={`${renderConsignLoc(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`} fieldCol={{ span: 16 }}
                        />
                        <PaneFormItem labelCol={{ span: 8 }} label="联系人/电话"
                          field={`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`} fieldCol={{ span: 16 }}
                        />
                      </div>
                  }
                  />
                </Steps>
              </div>
              <div className="schedule">
                <Steps direction="vertical">
                  <Step key={0} title={shipmt.consignee_name || ''} status="process"
                    icon={<div className="icon">终</div>}
                    description={
                      <div className="stepBody">
                        <PaneFormItem labelCol={{ span: 8 }} label={this.msg('deliveryEstDate')}
                          field={deliverDate} fieldCol={{ span: 16 }}
                        />
                        <PaneFormItem labelCol={{ span: 8 }} label="收货地"
                          field={`${renderConsignLoc(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`} fieldCol={{ span: 16 }}
                        />
                        <PaneFormItem labelCol={{ span: 8 }} label="联系人/电话"
                          field={`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`} fieldCol={{ span: 16 }}
                        />
                      </div>
                  }
                  />
                </Steps>
              </div>
            </div>
          </Panel>
          <Panel header={transitModeInfo} key="trans_mode">
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('vehicleType')}
                field={vehicleType ? vehicleType.text : ''} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('vehicleLength')}
                field={vehicleLength ? vehicleLength.text : ''} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ctn &&
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('containerNo')}
                field={shipmt.container_no} fieldCol={{ span: 16 }}
              />
            </Col>
            }
          </Panel>
          <Panel header={goodsInfo} key="cargo">
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('goodsType')}
                field={goodsType ? goodsType.text : shipmt.goods_type} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('goodsPackage')}
                field={pckg ? pckg.value : shipmt.package} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('insuranceValue')}
                field={shipmt.insure_value} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="24">
              <Table size="small" columns={this.columns} pagination={false}
                dataSource={shipmt.goodslist}
              />
            </Col>
          </Panel>
        </Collapse>
        <PrivilegeCover module="transport" feature="shipment" action="edit">
          <ChangeShipment />
        </PrivilegeCover>
      </div>
    );
  }
}
