import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getShipmentDispatch } from 'common/reducers/weixin';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import { renderConsignLoc } from '../../transport/common/consignLocation';
import { Cells, CellsTitle, Cell, CellBody, CellHeader, Input, Label } from 'react-weui';
import '../weui.less';

function fetchData({ state, dispatch, cookie, params }) {
  const p = {
    ...params,
    tenantId: state.account.tenantId,
  };
  return dispatch(getShipmentDispatch(cookie, p));
}

@connectFetch()(fetchData)
@connect(
  state => ({
    shipmentDispatchDetail: state.weixin.shipmentDispatchDetail,
  }),
)
export default class Detail extends React.Component {
  static propTypes = {
    shipmentDispatchDetail: PropTypes.object.isRequired,
  }
  componentDidMount() {
    window.$('title').text('运单详情');
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
    const { shipmt } = this.props.shipmentDispatchDetail;
    let transportMode = shipmt.transport_mode;
    if (shipmt.transport_mode_code === 'CTN') {
      transportMode += ` ${shipmt.container_no}`;
    }
    return (
      <div className="panel-body">
        <CellsTitle>运单信息</CellsTitle>
        <Cells access>
          {this.renderFormCell('运单号', shipmt.shipmt_no)}
          {this.renderFormCell('运输模式', transportMode)}
          {this.renderFormCell('提货日期', moment(shipmt.pickup_est_date).format('YYYY-MM-DD'))}
          {this.renderFormCell('交货日期', moment(shipmt.deliver_est_date).format('YYYY-MM-DD'))}
        </Cells>
        <CellsTitle>发货方</CellsTitle>
        <Cells access>
          {this.renderFormCell('名称', shipmt.consigner_name)}
          {this.renderFormCell('地址', `${renderConsignLoc(shipmt, 'consigner')}`)}
          {this.renderFormCell('详细地址', shipmt.consigner_addr)}
          {this.renderFormCell('联系人', shipmt.consigner_contact)}
          {this.renderFormCell('电话', shipmt.consigner_mobile)}
        </Cells>
        <CellsTitle>收货方</CellsTitle>
        <Cells access>
          {this.renderFormCell('名称', shipmt.consignee_name)}
          {this.renderFormCell('地址', `${renderConsignLoc(shipmt, 'consignee')}`)}
          {this.renderFormCell('详细地址', shipmt.consignee_addr)}
          {this.renderFormCell('联系人', shipmt.consignee_contact)}
          {this.renderFormCell('电话', shipmt.consignee_mobile)}
        </Cells>
        <CellsTitle>货物信息</CellsTitle>
        <Cells access>
          {this.renderFormCell('总数量', `${shipmt.total_count || ''} 件`)}
          {this.renderFormCell('总重量', `${shipmt.total_weight || ''} 公斤`)}
          {this.renderFormCell('总体积', `${shipmt.total_volume || ''} 立方米`)}
        </Cells>
      </div>
    );
  }
}
