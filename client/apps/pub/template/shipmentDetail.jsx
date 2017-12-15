/* eslint no-undef: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Table } from 'antd';
import { loadPubShipmtDetail } from 'common/reducers/shipment';
import connectFetch from 'client/common/decorators/connect-fetch';
import * as Location from 'client/util/location';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadVehicleParams } from 'common/reducers/transportResources';

const formatMsg = format(messages);

function fetchData({ dispatch, params, state }) {
  return Promise.all([dispatch(loadPubShipmtDetail(params.shipmtNo, params.key)),
    dispatch(loadVehicleParams(state.account.tenantId))]);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
    vehicleParams: state.transportResources.vehicleParams,
  }),
  { }
)
@injectIntl
export default class ShipmentDetail extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    vehicleParams: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { shipmt } = this.props.shipmtDetail;
    const { vehicleParams } = this.props;
    const date = new Date();
    const weekDay = date.getDay();
    let week = '';
    if (weekDay === 0) week = '日';
    else if (weekDay === 1) week = '一';
    else if (weekDay === 2) week = '二';
    else if (weekDay === 3) week = '三';
    else if (weekDay === 4) week = '四';
    else if (weekDay === 5) week = '五';
    else if (weekDay === 6) week = '六';
    const dateStr = moment(date).format('YYYY年M月D日 星期').concat(week);
    const titleColor = '#FFD700';
    const contentTab = 10;
    const originPointAddr = `${Location.renderConsignLocation(shipmt, 'consigner')}${shipmt.consigner_addr ? shipmt.consigner_addr : ''}`;
    const destPointAddr = `${Location.renderConsignLocation(shipmt, 'consignee')}${shipmt.consignee_addr ? shipmt.consignee_addr : ''}`;
    const transportTableColumns = [{
      title: '地点类型',
      dataIndex: 'addressType',
    }, {
      title: '仓库',
      dataIndex: 'storage',
    }, {
      title: '地点',
      dataIndex: 'address',
    }, {
      title: '预计日期',
      dataIndex: 'est_date',
    }, {
      title: '实际日期',
      dataIndex: 'act_date',
    }, {
      title: '联系人/电话',
      dataIndex: 'contact',
    }];

    const addressData = [{
      key: '1',
      addressType: '提货点',
      storage: '',
      address: originPointAddr,
      est_date: shipmt.pickup_est_date ? moment(shipmt.pickup_est_date).format('YYYY-MM-DD') : '',
      act_date: shipmt.pickup_act_date ? moment(shipmt.pickup_act_date).format('YYYY-MM-DD') : '',
      contact: `${shipmt.consigner_contact ? shipmt.consigner_contact : ''} / ${shipmt.consigner_mobile ? shipmt.consigner_mobile : ''}`,
    }, {
      key: '2',
      addressType: '送货点',
      storage: '',
      address: destPointAddr,
      est_date: shipmt.deliver_est_date ? moment(shipmt.deliver_est_date).format('YYYY-MM-DD') : '',
      act_date: shipmt.deliver_est_date ? moment(shipmt.deliver_est_date).format('YYYY-MM-DD') : '',
      contact: `${shipmt.consignee_contact ? shipmt.consignee_contact : ''} / ${shipmt.consignee_mobile ? shipmt.consignee_mobile : ''}`,
    }];
    const goodslistColumns = [{
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
    }];
    const vehicleType = vehicleParams.types.find(item => item.value === shipmt.vehicle_type);
    const vehicleLength = vehicleParams.lengths.find(item => item.value === shipmt.vehicle_length);
    return (
      <div className="panel-body" style={{
 backgroundColor: '#fff', width: 800, height: 1080, padding: 50,
}}
      >
        <Row >
          <div style={{ float: 'right', fontSize: 16 }}>
            {dateStr}
          </div>
        </Row>
        <Row style={{ }}>
          <div style={{ fontSize: 18 }}>
            运单-{shipmt.shipmt_no}
          </div>
        </Row>
        <hr style={{ border: 'solid 1px', marginTop: 10 }} />
        <Row style={{ marginTop: 10, fontSize: 15, color: titleColor }}>
          - 客户信息
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          客户名称: {shipmt.customer_name}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          客户单号: {shipmt.ref_external_no}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          关联提运单号: {shipmt.ref_waybill_no}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          关联报关单号: {shipmt.ref_entry_no}
        </Row>
        <Row style={{ marginTop: 15, fontSize: 15, color: titleColor }}>
          - 运输计划 {shipmt.transit_time} 天
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          <Table columns={transportTableColumns} dataSource={addressData} bordered pagination={false} />
        </Row>
        <Row style={{ marginTop: 15, fontSize: 15, color: titleColor }}>
          - 运输模式 {shipmt.transport_mode}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          备注: {shipmt.remark}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          <Col span={12}>
            车型: {vehicleType ? vehicleType.text : '' }
          </Col>
          <Col span={12}>
            车长: {vehicleLength ? vehicleLength.text : '' } 米
          </Col>
        </Row>
        <Row style={{ marginTop: 15, fontSize: 15, color: titleColor }}>
          - {`${this.msg('goodsInfo')}  ${this.msg('totalCount')}: ${shipmt.total_count || ''} / ${this.msg('totalWeight')}: ${shipmt.total_weight || ''}${this.msg('kilogram')} / ${this.msg('totalVolume')}: ${shipmt.total_volume || ''}${this.msg('cubicMeter')}`}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          货物类型: {shipmt.goods_type}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          <Col span={12}>
            包装: {shipmt.package}
          </Col>
          <Col span={12}>
            保险货值: {shipmt.insure_value}
          </Col>
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 15 }}>
          <Table columns={goodslistColumns} dataSource={shipmt.goodslist} bordered pagination={false} />
        </Row>

      </div>
    );
  }
}
