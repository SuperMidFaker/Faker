import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Modal, Transfer } from 'antd';
import { setClientForm, removeOrderInvoice, loadUnshippedInvoices, getOrderDetails } from 'common/reducers/sofOrders';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
import Summary from 'client/components/Summary';
import messages from '../message.i18n';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmParams,
    currencies: state.cmsManifest.params.currencies,
    formData: state.sofOrders.formData,
  }),
  {
    setClientForm, removeOrderInvoice, loadUnshippedInvoices, getOrderDetails,
  }
)
export default class InvoicePane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    dataSource: [],
    origDataSource: [],
    origInvoices: [],
    targetKeys: [],
    selectedKeys: [],
    visible: false,
  }
  componentWillMount() {
    this.props.loadUnshippedInvoices(this.props.formData.customer_partner_id).then((result) => {
      if (!result.error) {
        this.setState({
          origInvoices: result.data,
          dataSource: this.props.formData.invoices,
          origDataSource: this.props.formData.invoices,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.invoices !== this.props.formData.invoices) {
      this.setState({
        dataSource: nextProps.formData.invoices,
      });
    }
    if (nextProps.formData.customer_partner_id !== this.props.formData.customer_partner_id) {
      this.props.loadUnshippedInvoices(nextProps.formData.customer_partner_id).then((result) => {
        if (!result.error) {
          this.setState({
            origInvoices: result.data,
            dataSource: this.props.formData.invoices,
            origDataSource: this.props.formData.invoices,
          });
        }
      });
    }
  }
  handleInvoiceAdd = (data) => {
    this.setState({
      dataSource: data,
    });
  }
  handleToggleInvoiceModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleRemove = (row) => {
    const { invoices, orderDetails } = this.props.formData;
    const { origDataSource } = this.state;
    if (row.shipmt_order_no) {
      this.props.removeOrderInvoice(row.id, row.invoice_no, row.shipmt_order_no).then((result) => {
        if (!result.error) {
          const newInvoices = invoices.filter(inv => inv.invoice_no !== row.invoice_no);
          const newOrderDetails = orderDetails.filter(od => od.invoice_no !== row.invoice_no);
          const newOrigDataSource = origDataSource.filter(od => od.invoice_no !== row.invoice_no);
          this.props.setClientForm(-1, { invoices: newInvoices, orderDetails: newOrderDetails });
          this.props.loadUnshippedInvoices(this.props.formData.customer_partner_id).then((re) => {
            if (!re.error) {
              this.setState({
                origInvoices: re.data,
                origDataSource: newOrigDataSource,
              });
            }
          });
        }
      });
    } else {
      const { targetKeys } = this.state;
      const newTargetKeys = targetKeys.filter(key => key !== row.invoice_no);
      const newInvoices = invoices.filter(inv => inv.invoice_no !== row.invoice_no);
      const newOrderDetails = orderDetails.filter(od => od.invoice_no !== row.invoice_no);
      this.props.setClientForm(-1, { invoices: newInvoices, orderDetails: newOrderDetails });
      this.setState({
        targetKeys: newTargetKeys,
      });
    }
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleOk = () => {
    const { targetKeys, origInvoices, origDataSource } = this.state;
    const data = origDataSource.concat(origInvoices.filter(inv =>
      targetKeys.find(key => key === inv.invoice_no)));

    this.setState({
      dataSource: data,
    });
    this.props.getOrderDetails(targetKeys.join(','));
    this.props.setClientForm(-1, { invoices: data });
    this.handleCancel();
  }
  handleChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
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
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    fixed: 'right',
    render: (o, record) => <RowAction confirm={this.msg('确认移除？')} onConfirm={this.handleRemove} icon="minus-circle-o" tooltip="移出" row={record} />,
  }];
  render() {
    const {
      origInvoices, targetKeys, selectedKeys, visible, dataSource,
    } = this.state;
    const statWt = dataSource.reduce((acc, det) => ({
      total_amount: acc.total_amount + det.total_amount,
      total_net_wt: acc.total_net_wt + det.total_net_wt,
    }), { total_amount: 0, total_net_wt: 0 });
    const totCol = (
      <Summary>
        <Summary.Item label="总数量" addonAfter="KG">{statWt.total_amount.toFixed(5)}</Summary.Item>
        <Summary.Item label="总净重" addonAfter="KG">{statWt.total_net_wt.toFixed(5)}</Summary.Item>
      </Summary>
    );
    return (
      <DataPane
        columns={this.invoiceColumns}
        dataSource={this.state.dataSource}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleToggleInvoiceModal}>添加</Button>
          <DataPane.Extra>
            {totCol}
          </DataPane.Extra>
        </DataPane.Toolbar>
        {/* <InvoiceModal handleOk={this.handleInvoiceAdd} /> */}
        <Modal title="选择商业发票" width={695} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
          <Transfer
            dataSource={origInvoices}
            showSearch
            titles={['可选', '已选']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            render={item => item.invoice_no}
            rowKey={item => item.invoice_no}
            listStyle={{
              width: 300,
              height: 400,
            }}
          />
        </Modal>
      </DataPane>
    );
  }
}
