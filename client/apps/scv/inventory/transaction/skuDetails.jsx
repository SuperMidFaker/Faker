import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Table } from 'antd';
import { loadSkuTransactions } from 'common/reducers/scvInventoryTransaction';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.scvInventoryTransaction.detailloading,
  }),
  { loadSkuTransactions }
)
export default class SkuTransactionList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    sku_no: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    filter: PropTypes.object.isRequired,
  }
  state = {
    stocklist: [],
  }
  componentWillMount() {
    this.props.loadSkuTransactions({
      tenantId: this.props.tenantId,
      sku_no: this.props.sku_no,
      filter: JSON.stringify(this.props.filter),
    }).then((result) => {
      if (!result.error) {
        this.setState({ stocklist: result.data });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('warehouse'),
    dataIndex: 'wh_name',
    width: 100,
  }, {
    title: this.msg('inboundTime'),
    dataIndex: 'inbound_timestamp',
    width: 100,
    render: time => time && moment.unix(time).format('YYYY.MM.DD'),
  }, {
    title: this.msg('quantity'),
    dataIndex: 'inbound_qty',
    width: 100,
    render: qty => <span className="mdc-text-green">{qty}</span>,
  }, {
    title: this.msg('ponumber'),
    dataIndex: 'po_no',
    width: 100,
  }, {
    title: this.msg('outboundTime'),
    dataIndex: 'outbound_timestamp',
    width: 100,
    render: time => time && moment.unix(time).format('YYYY.MM.DD'),
  }, {
    title: this.msg('quantity'),
    dataIndex: 'outbound_qty',
    width: 100,
    render: qty => <span className="mdc-text-red">{qty}</span>,
  }, {
    title: this.msg('sonumber'),
    dataIndex: 'so_no',
    width: 100,
  }]
  render() {
    const { loading } = this.props;
    return (
      <Table columns={this.columns} pagination={false} dataSource={this.state.stocklist}
        loading={loading} rowKey="id" scroll={{ y: 200 }}
      />
    );
  }
}
