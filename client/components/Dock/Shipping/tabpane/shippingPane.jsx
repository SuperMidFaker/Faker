import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { loadPickDetails, loadPackDetails, loadShipDetails } from 'common/reducers/cwmOutbound';
import { } from 'common/constants';
import DataTable from 'client/components/DataTable';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(state => ({
  order: state.sofOrders.dock.order,
  shipDetails: state.cwmOutbound.shipDetails,
}), { loadPickDetails, loadPackDetails, loadShipDetails })
export default class InboundPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
    this.props.loadShipDetails(this.props.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.outboundNo !== this.props.outboundNo) {
      this.props.loadShipDetails(nextProps.outboundNo);
    }
  }
  msg = formatMsg(this.props.intl)
  shipColumns = [{
    title: '装车/配送单号',
    dataIndex: 'waybill',
    width: 150,
  }, {
    title: 'DropID',
    dataIndex: 'drop_id',
    width: 150,
  }, {
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '发货数量',
    dataIndex: 'shipped_qty',
    width: 100,
  }]
  render() {
    const { shipDetails } = this.props;
    return (
      <div className="pane-content tab-pane">
        <DataTable size="middle" columns={this.shipColumns} dataSource={shipDetails} showToolbar={false} />
      </div>
    );
  }
}
