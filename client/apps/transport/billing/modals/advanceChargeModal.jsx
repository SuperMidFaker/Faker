import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { importAdvanceCharge, toggleAdvanceChargeModal } from 'common/reducers/transportBilling';
import ReactDataGrid from '@welogix/react-data-grid';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

function createRows(numberOfRows) {
  const _rows = [];
  for (let i = 0; i < numberOfRows; i++) {
    _rows.push({
      id: i,
      shipmt_no: '',
      amount: 0,
      remark: '',
    });
  }
  return _rows;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.transportBilling.advanceChargeModal.visible,
  }),
  { importAdvanceCharge, toggleAdvanceChargeModal }
)
export default class AdvanceChargeModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    data: PropTypes.array.isRequired,
    importAdvanceCharge: PropTypes.func.isRequired,
    toggleAdvanceChargeModal: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
  }
  state = {
    rows: createRows(50),
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  rowGetter = (rowIdx) => {
    return this.state.rows[rowIdx];
  }
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({ rows });
  }
  handleCancel = () => {
    this.props.toggleAdvanceChargeModal(false);
  }
  handleSave = () => {
    const { tenantId, loginId, loginName } = this.props;
    const rows = this.state.rows;
    const advances = rows.filter(row => row.shipmt_no !== '').map(item => ({ ...item, amount: Number(item.amount) }));
    this.props.importAdvanceCharge({ tenantId, loginId, loginName, advances }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.setState({ rows: createRows(50) });
        this.props.toggleAdvanceChargeModal(false);
        this.props.onOk();
      }
    });
  }
  render() {
    const columns = [
      {
        name: '运单号',
        key: 'shipmt_no',
        width: 150,
        editable: true,
      }, {
        name: '金额',
        key: 'amount',
        width: 100,
        editable: true,
      }, {
        name: '备注',
        key: 'remark',
        width: 210,
        editable: true,
      },
    ];
    return (
      <Modal visible={this.props.visible} title="录入代垫费用" onCancel={this.handleCancel} onOk={this.handleSave}>
        <ReactDataGrid
          enableCellSelect
          columns={columns}
          rowGetter={this.rowGetter}
          rowsCount={this.state.rows.length}
          minHeight={400}
          minWidth={480}
          onRowUpdated={this.handleRowUpdated}
        />
      </Modal>
  ); }
}
