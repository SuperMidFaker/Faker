import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Tag } from 'antd';
import { loadPickDetails, loadPackDetails, loadShipDetails } from 'common/reducers/cwmOutbound';
import DataTable from 'client/components/DataTable';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(state => ({
  order: state.sofOrders.dock.order,
  pickDetails: state.cwmOutbound.pickDetails,
  packDetails: state.cwmOutbound.packDetails,
  shipDetails: state.cwmOutbound.shipDetails,
}), { loadPickDetails, loadPackDetails, loadShipDetails })
export default class PickingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
    this.props.loadPickDetails(this.props.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.outboundNo !== this.props.outboundNo) {
      this.props.loadPickDetails(nextProps.outboundNo);
    }
  }
  msg = formatMsg(this.props.intl)
  pickColumns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 200,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: o => o && <Tag>{o}</Tag>,
  }, {
    title: '分配数量',
    dataIndex: 'alloc_qty',
    width: 100,
  }, {
    title: '拣货数量',
    dataIndex: 'picked_qty',
    width: 100,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    render: o => o && <Tag>{o}</Tag>,
  }]
  render() {
    const { pickDetails } = this.props;
    return (
      <div className="pane-content tab-pane">
        <DataTable size="middle" columns={this.pickColumns} dataSource={pickDetails} showToolbar={false} />
      </div>
    );
  }
}
