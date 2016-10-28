import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { closeCertModal, saveCertFees } from 'common/reducers/cmsExpense';
import ReactDataGrid from '@welogix/react-data-grid';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    showCertModal: state.cmsExpense.showCertModal,
    certExp: state.cmsExpense.certExp,
  }),
  { closeCertModal, saveCertFees }
)
export default class CertModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showCertModal: PropTypes.bool.isRequired,
    certExp: PropTypes.object.isRequired,
    saveCertFees: PropTypes.func.isRequired,
  }
  state = {
    rows: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.certExp !== this.props.certExp) {
      this.setState({ rows: nextProps.certExp.server_charges });
    }
  }
  rowGetter = (rowIdx) => {
    return this.state.rows[rowIdx];
  }
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    const chargeCount = parseInt(e.updated.charge_count, 10);
    const calFee = rows[e.rowIdx].unit_price * chargeCount;
    let taxFee = 0;
    if (rows[e.rowIdx].invoice_en) {
      taxFee = (calFee / (1 + rows[e.rowIdx].tax_rate / 100) * rows[e.rowIdx].tax_rate / 100).toFixed(3);
    }
    const totalFee = calFee + taxFee;
    Object.assign(rows[e.rowIdx], { cal_fee: calFee, charge_count: chargeCount, tax_fee: Number(taxFee), total_fee: Number(totalFee) });
    this.setState({ rows });
  }
  handleCancel = () => {
    this.props.closeCertModal();
  }
  handleSave = () => {
    const rows = this.state.rows;
    this.props.saveCertFees(this.props.certExp.disp_id, rows).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.closeCertModal();
      }
    });
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const { showCertModal } = this.props;
    const columns = [
      {
        name: msg('certFee'),
        key: 'fee_name',
        width: 90,
      }, {
        name: msg('certPrice'),
        key: 'unit_price',
        width: 70,
        editable: true,
      }, {
        name: msg('certCount'),
        key: 'charge_count',
        width: 70,
        editable: true,
      }, {
        name: msg('certCalfee'),
        key: 'cal_fee',
        width: 90,
      }, {
        name: msg('certTax'),
        key: 'tax_fee',
        width: 90,
      }, {
        name: msg('certTotal'),
        key: 'total_fee',
        width: 90,
      },
    ];
    return (
      <Modal visible={showCertModal} title="办证费用" onCancel={this.handleCancel} onOk={this.handleSave}>
        <ReactDataGrid
          enableCellSelect
          columns={columns}
          rowGetter={this.rowGetter}
          rowsCount={this.state.rows.length}
          minHeight={400}
          minWidth={500}
          onRowUpdated={this.handleRowUpdated}
        />
      </Modal>
  ); }
}
