import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Transfer } from 'antd';
import { toggleInvoiceModal, loadUnshippedInvoices, setClientForm, getOrderDetails } from 'common/reducers/sofOrders';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.sofOrders.invoiceModal.visible,
    formData: state.sofOrders.formData,
    orderDetails: state.sofOrders.formData.orderDetails,
  }),
  {
    loadUnshippedInvoices, toggleInvoiceModal, setClientForm, getOrderDetails,
  }
)
export default class InvoiceModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleOk: PropTypes.func.isRequired,
  }
  state = {
    origInvoices: [],
    targetKeys: [],
    selectedKeys: [],
  }
  componentWillMount() {
    const { formData } = this.props;
    this.props.loadUnshippedInvoices(formData.customer_partner_id).then((result) => {
      if (!result.error) {
        this.setState({
          origInvoices: result.data,
          targetKeys: formData.invoices.map(invoice => invoice.invoice_no),
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.customer_partner_id !== this.props.formData.customer_partner_id) {
      this.props.loadUnshippedInvoices(nextProps.formData.customer_partner_id).then((result) => {
        if (!result.error) {
          this.setState({
            origInvoices: result.data,
          });
        }
      });
    }
  }
  handleCancel = () => {
    this.props.toggleInvoiceModal(false);
  }
  handleOk = () => {
    const { targetKeys, origInvoices, orderDetails } = this.state;
    const data = origInvoices.filter(inv => targetKeys.find(key => key === inv.invoice_no));
    this.props.handleOk(data);
    this.props.getOrderDetails(targetKeys.join(','));
    this.props.setClientForm(-1, { invoices: data, orderDetails });
    this.handleCancel();
  }
  handleChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { visible } = this.props;
    const { origInvoices, targetKeys, selectedKeys } = this.state;
    return (
      <Modal title="发票" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Transfer
          dataSource={origInvoices}
          titles={['Source', 'Target']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={this.handleChange}
          onSelectChange={this.handleSelectChange}
          render={item => item.invoice_no}
          rowKey={item => item.invoice_no}
        />
      </Modal>
    );
  }
}
