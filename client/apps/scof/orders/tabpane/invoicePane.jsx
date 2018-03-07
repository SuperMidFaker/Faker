import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Modal, Transfer } from 'antd';
import { removeOrderInvoice, loadUnshippedInvoices, loadOrderInvoices, addOrderInvoices, loadOrderDetails } from 'common/reducers/sofOrders';
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
    invoices: state.sofOrders.invoices,
  }),
  {
    removeOrderInvoice,
    loadUnshippedInvoices,
    loadOrderInvoices,
    addOrderInvoices,
    loadOrderDetails,
  }
)
export default class InvoicePane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    dataSource: [],
    targetKeys: [],
    selectedKeys: [],
    visible: false,
  }
  componentWillMount() {
    this.props.loadOrderInvoices(this.props.formData.shipmt_order_no);
    this.handleLoadUnshippedInvoices(this.props.formData.customer_partner_id);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.customer_partner_id !== this.props.formData.customer_partner_id) {
      this.handleLoadUnshippedInvoices(nextProps.formData.customer_partner_id);
    }
  }
  handleToggleInvoiceModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleLoadUnshippedInvoices = (partnerId) => {
    this.props.loadUnshippedInvoices(partnerId).then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
          targetKeys: [],
          selectedKeys: [],
        });
      }
    });
  }
  handleRemove = (row) => {
    this.props.removeOrderInvoice(row.id, row.invoice_no, row.shipmt_order_no).then((result) => {
      if (!result.error) {
        this.props.loadOrderInvoices(this.props.formData.shipmt_order_no);
        this.handleLoadUnshippedInvoices(this.props.formData.customer_partner_id);
      }
    });
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleOk = () => {
    const { targetKeys } = this.state;
    this.props.addOrderInvoices(targetKeys, this.props.formData.shipmt_order_no).then((result) => {
      if (!result.error) {
        this.props.loadOrderInvoices(this.props.formData.shipmt_order_no);
        this.handleLoadUnshippedInvoices(this.props.formData.customer_partner_id);
      }
    });
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
      targetKeys, selectedKeys, visible,
    } = this.state;
    const statWt = this.props.invoices.reduce((acc, det) => ({
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
        dataSource={this.props.invoices}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleToggleInvoiceModal}>添加</Button>
          <DataPane.Extra>
            {totCol}
          </DataPane.Extra>
        </DataPane.Toolbar>
        <Modal title="选择商业发票" width={695} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
          <Transfer
            dataSource={this.state.dataSource}
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
