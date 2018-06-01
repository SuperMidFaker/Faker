import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import DataTable from 'client/components/DataTable';
import { loadOrderInvoices } from 'common/reducers/sofOrders';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  order: state.sofOrders.dock.order,
  invoices: state.sofOrders.invoices,
  currencies: state.saasParams.currencies,
}), { loadOrderInvoices })
export default class CommercialInvoicesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
  }
  componentDidMount() {
    this.props.loadOrderInvoices(this.props.order.shipmt_order_no);
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
    width: 200,
  }, {
    title: this.msg('invoiceDate'),
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY/MM/DD'),
    width: 150,
  }, {
    title: this.msg('poNo'),
    dataIndex: 'po_no',
    width: 200,
  }, {
    title: this.msg('totalAmount'),
    dataIndex: 'total_amount',
    width: 150,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 150,
    render: (o) => {
      if (o) {
        const currency = this.props.currencies.find(curr => curr.curr_code === o);
        if (currency) {
          return currency.curr_name;
        }
      }
      return '';
    },
  }, {
    title: this.msg('totalQty'),
    dataIndex: 'total_qty',
    width: 150,
  }, {
    title: this.msg('totalNetWt'),
    dataIndex: 'total_net_wt',
    width: 150,
  }]
  render() {
    return (
      <div className="pane-content tab-pane">
        <DataTable
          columns={this.columns}
          dataSource={this.props.invoices}
          rowKey="id"
          scroll={{ x: 800 }}
          showToolbar={false}
        />
      </div>
    );
  }
}
