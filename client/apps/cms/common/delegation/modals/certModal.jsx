import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { closeCertModal, saveCertFees } from 'common/reducers/cmsExpense';
import ReactDataGrid from '@welogix/react-data-grid';
import { Editors } from '@welogix/react-data-grid/addons';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const DropDownEditor = Editors.DropDownEditor;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    showCertModal: state.cmsExpense.showCertModal,
    certExp: state.cmsExpense.certExp,
    brokers: state.cmsDelegation.brokers,
    relatedDisps: state.cmsDelegation.relatedDisps,
  }),
  { closeCertModal, saveCertFees }
)
export default class CertModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showCertModal: PropTypes.bool.isRequired,
    certExp: PropTypes.object.isRequired,
    brokers: PropTypes.array.isRequired,
    relatedDisps: PropTypes.array.isRequired,
    saveCertFees: PropTypes.func.isRequired,
  }
  state = {
    rows: [],
    feesSelect: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.certExp !== this.props.certExp) {
      const certFees = nextProps.certExp.fees.filter(fe =>
        (fe.category === 'certs_expenses') && (fe.enabled === true)
      );
      this.setState({ rows: certFees });
    }
  }
  rowGetter = (rowIdx) => {
    return this.state.rows[rowIdx];
  }
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    if (e.updated.charge_count) {
      const chargeCount = parseInt(e.updated.charge_count, 10);
      const calFee = rows[e.rowIdx].unit_price * chargeCount;
      let taxFee = 0;
      if (rows[e.rowIdx].invoice_en) {
        taxFee = (calFee / (1 + rows[e.rowIdx].tax_rate / 100) * rows[e.rowIdx].tax_rate / 100).toFixed(3);
      }
      const totalFee = Number(calFee) + Number(taxFee);
      Object.assign(rows[e.rowIdx], { cal_fee: calFee, charge_count: chargeCount, tax_fee: Number(taxFee), total_fee: Number(totalFee) });
    } else {
      Object.assign(rows[e.rowIdx], e.updated);
    }
    this.setState({ rows });
  }
  handleCancel = () => {
    this.props.closeCertModal();
  }
  handleSave = () => {
    const rows = this.state.rows;
    this.props.saveCertFees(this.props.relatedDisps, rows).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.closeCertModal();
      }
    });
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const { showCertModal, brokers } = this.props;
    const brokerSelect = [];
    brokers.forEach((bk) => {
      brokerSelect.push(bk.name);
    });
    const brokerEditor = <DropDownEditor options={brokerSelect} />;
    const columns = [
      {
        name: msg('办证服务商'),
        key: 'broker',
        width: 120,
        editor: brokerEditor,
      }, {
        name: msg('certFee'),
        key: 'fee_name',
        width: 120,
      }, {
        name: msg('certPrice'),
        key: 'unit_price',
        width: 90,
      }, {
        name: msg('certCount'),
        key: 'charge_count',
        width: 90,
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
        width: 100,
      }, {
        name: msg('备注'),
        key: 'remark',
        width: 100,
        editable: true,
      },
    ];
    return (
      <Modal visible={showCertModal} title="办证费用" onCancel={this.handleCancel} onOk={this.handleSave} width={820}>
        <ReactDataGrid
          enableCellSelect
          columns={columns}
          rowGetter={this.rowGetter}
          rowsCount={this.state.rows.length}
          minHeight={400}
          minWidth={800}
          onRowUpdated={this.handleRowUpdated}
        />
      </Modal>
  ); }
}
