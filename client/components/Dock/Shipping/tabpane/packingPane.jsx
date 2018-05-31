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
  packDetails: state.cwmOutbound.packDetails,
}), { loadPickDetails, loadPackDetails, loadShipDetails })
export default class InboundPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
    this.props.loadPackDetails(this.props.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.outboundNo !== this.props.outboundNo) {
      this.props.loadPackDetails(nextProps.outboundNo);
    }
  }
  msg = formatMsg(this.props.intl)
  packColumns = [{
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 200,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 150,
  }, {
    title: '装箱数量',
    dataIndex: 'chkpacked_qty',
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
    width: 150,
    render: o => o && <Tag>{o}</Tag>,
  }]
  render() {
    const { packDetails } = this.props;
    return (
      <div className="pane-content tab-pane">
        <DataTable size="middle" columns={this.packColumns} dataSource={packDetails} showToolbar={false} />
      </div>
    );
  }
}
