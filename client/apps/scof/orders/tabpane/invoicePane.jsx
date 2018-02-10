import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import { setClientForm, toggleInvoiceModal } from 'common/reducers/sofOrders';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import DataPane from 'client/components/DataPane';
import { format } from 'client/common/i18n/helpers';
import InvoiceModal from '../modal/invoiceModal';
import messages from '../message.i18n';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmParams,
    currencies: state.cmsManifest.params.currencies,
    formData: state.sofOrders.formData,
  }),
  { setClientForm, toggleInvoiceModal, loadCmsParams }
)
export default class InvoicePane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    dataSource: [],
  }
  componentWillMount() {
    this.props.loadCmsParams();
    this.setState({
      dataSource: this.props.formData.invoices,
    });
  }
  handleInvoiceAdd = (data) => {
    this.setState({
      dataSource: data,
    });
  }
  handleToggleInvoiceModal = () => {
    this.props.toggleInvoiceModal(true);
  }
  msg = key => formatMsg(this.props.intl, key)
  invoiceColumns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '发票日期',
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY/MM/DD'),
  }, {
    title: '订单号',
    dataIndex: 'po_no',
  }, {
    title: '总价',
    dataIndex: 'total_amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.find(curr => Number(curr.curr_code) === Number(o));
      if (currency) {
        return <span>{currency.curr_name}</span>;
      }
      return o;
    },
  }, {
    title: '总净重',
    dataIndex: 'total_net_wt',
  }];
  render() {
    return (
      <DataPane
        columns={this.invoiceColumns}
        dataSource={this.state.dataSource}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleToggleInvoiceModal}>添加</Button>
        </DataPane.Toolbar>
        <InvoiceModal handleOk={this.handleInvoiceAdd} />
      </DataPane>
    );
  }
}
