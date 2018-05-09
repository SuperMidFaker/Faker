import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import { removeOrderInvoice, loadOrderInvoices, toggleInvoiceModal } from 'common/reducers/sofOrders';
import { loadInvoiceCategories } from 'common/reducers/sofInvoice';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import Summary from 'client/components/Summary';
import InvoiceModal from '../modal/invoiceModal';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmParams,
    currencies: state.cmsManifest.params.currencies,
    formData: state.sofOrders.formData,
    invoices: state.sofOrders.invoices,
    reload: state.sofOrders.orderInvoicesReload,
  }),
  {
    removeOrderInvoice,
    loadOrderInvoices,
    loadInvoiceCategories,
    toggleInvoiceModal,
  }
)
export default class InvoicePane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
    this.props.loadOrderInvoices(this.props.formData.shipmt_order_no);
    this.props.loadInvoiceCategories();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadOrderInvoices(this.props.formData.shipmt_order_no);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleToggleInvoiceModal = () => {
    this.props.toggleInvoiceModal(true);
  }
  handleRemove = (row) => {
    this.props.removeOrderInvoice(row.id, row.invoice_no, row.shipmt_order_no);
  }
  invoiceColumns = [{
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
  }, {
    title: this.msg('invoiceDate'),
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY/MM/DD'),
  }, {
    title: this.msg('poNo'),
    dataIndex: 'po_no',
  }, {
    title: this.msg('totalAmount'),
    dataIndex: 'total_amount',
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.find(curr => Number(curr.curr_code) === Number(o));
      if (currency) {
        return <span>{currency.curr_name}</span>;
      }
      return o;
    },
  }, {
    title: this.msg('totalQty'),
    dataIndex: 'total_qty',
  }, {
    title: this.msg('totalNetWt'),
    dataIndex: 'total_net_wt',
  }, {
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 45,
    fixed: 'right',
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleRemove} icon="minus-circle-o" tooltip={this.gmsg('delete')} row={record} />,
  }];
  render() {
    const statWt = this.props.invoices.reduce((acc, det) => ({
      total_amount: acc.total_amount + det.total_amount,
      total_net_wt: acc.total_net_wt + det.total_net_wt,
    }), { total_amount: 0, total_net_wt: 0 });
    const totCol = (
      <Summary>
        <Summary.Item label={this.msg('totalQty')} addonAfter="KG">{statWt.total_amount.toFixed(5)}</Summary.Item>
        <Summary.Item label={this.msg('totalNetWt')} addonAfter="KG">{statWt.total_net_wt.toFixed(5)}</Summary.Item>
      </Summary>
    );
    return (
      <DataPane
        columns={this.invoiceColumns}
        dataSource={this.props.invoices}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleToggleInvoiceModal}>{this.gmsg('add')}</Button>
          <DataPane.Extra>
            {totCol}
          </DataPane.Extra>
        </DataPane.Toolbar>
        <InvoiceModal />
      </DataPane>
    );
  }
}
