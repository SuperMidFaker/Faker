import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getShipmentDispatch } from 'common/reducers/weixin';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import WeUI from 'react-weui';
import '../weui.less';

const {Cells, CellsTitle, Cell, CellBody, CellHeader, Input, Label } = WeUI;

function fetchData({ state, dispatch, cookie, params }) {
  const p = {
    ...params,
    tenantId: state.account.tenantId
  };
  return dispatch(getShipmentDispatch(cookie, p));
}

@connectFetch()(fetchData)
@connect(
  state => ({
    shipmentDispatchDetail: state.weixin.shipmentDispatchDetail
  }),
)
export default class Detail extends React.Component {
  static propTypes = {
    shipmentDispatchDetail: PropTypes.object.isRequired,
  }
  componentDidMount() {
    $('title').text('运单详情');
  }
  renderFormCell(label = '', text) {
    return (
      <Cell>
        <CellHeader>
            <Label>{label}</Label>
        </CellHeader>
        <CellBody>
            <Input type="text" defaultValue={text} disabled />
        </CellBody>
      </Cell>
    );
  }
  render() {
    const {shipmt} = this.props.shipmentDispatchDetail;
    const total = shipmt.goodslist.reduce((item1, item2) => {
      return {
        amount: item1.amount + item2.amount,
        weight: item1.weight + item2.weight,
        volume: item1.volume + item2.volume
      };
    }, {amount: 0, weight: 0, volume: 0});
    return (
      <div className="panel-body">
        <CellsTitle>运单信息</CellsTitle>
        <Cells access>
          {this.renderFormCell('运单号', shipmt.shipmt_no)}
          {this.renderFormCell('运输模式', shipmt.transport_mode)}
          {this.renderFormCell('箱号', shipmt.container_no)}
          {this.renderFormCell('提货日期', moment(shipmt.pickup_est_date).format('YYYY-MM-DD'))}
          {this.renderFormCell('交货日期', moment(shipmt.deliver_est_date).format('YYYY-MM-DD'))}
        </Cells>
        <CellsTitle>发货方</CellsTitle>
        <Cells access>
          {this.renderFormCell('名称', shipmt.consigner_name)}
          {this.renderFormCell('地址', shipmt.consigner_province + shipmt.consigner_city +
            shipmt.consigner_district)}
          {this.renderFormCell('详细地址', shipmt.consigner_addr)}
          {this.renderFormCell('联系人', shipmt.consigner_contact)}
          {this.renderFormCell('电话', shipmt.consigner_mobile)}
        </Cells>
        <CellsTitle>收货方</CellsTitle>
        <Cells access>
          {this.renderFormCell('名称', shipmt.consignee_name)}
          {this.renderFormCell('地址', shipmt.consignee_province + shipmt.consignee_city +
            shipmt.consignee_district)}
          {this.renderFormCell('详细地址', shipmt.consignee_addr)}
          {this.renderFormCell('联系人', shipmt.consignee_contact)}
          {this.renderFormCell('电话', shipmt.consignee_mobile)}
        </Cells>
        <CellsTitle>货物信息</CellsTitle>
        <Cells access>
          {this.renderFormCell('总数量', `${total.amount} 件`)}
          {this.renderFormCell('总重量', `${total.weight} 公斤`)}
          {this.renderFormCell('总体积', `${total.volume} 立方米`)}
        </Cells>
      </div>
    );
  }
}
