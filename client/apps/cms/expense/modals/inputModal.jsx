import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { closeInModal, saveCushInput } from 'common/reducers/cmsExpense';
import ReactDataGrid from '@welogix/react-data-grid';
import { Editors } from '@welogix/react-data-grid/addons';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const DropDownEditor = Editors.DropDownEditor;
const formatMsg = format(messages);

function createRows(numberOfRows) {
  const _rows = [];
  for (let i = 0; i < numberOfRows; i++) {
    _rows.push({
      id: i,
      delg_no: '',
      fee_code: '',
      fee_val: null,
      cur_sty: '',
      remark: '',
    });
  }
  return _rows;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    showInputModal: state.cmsExpense.showInputModal,
    currencies: state.cmsExpense.currencies,
  }),
  { closeInModal, saveCushInput }
)
export default class InputModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showInputModal: PropTypes.bool.isRequired,
    currencies: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
  }
  state = {
    rows: createRows(10),
  }
  rowGetter = (rowIdx) => {
    return this.state.rows[rowIdx];
  }
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({ rows });
  }
  handleCancel = () => {
    this.props.closeInModal();
  }
  handleSave = () => {
    const rows = this.state.rows;
    const params = rows.filter(row => row.delg_no !== '');
    this.props.saveCushInput(this.props.tenantId, params).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.closeInModal();
      }
    });
  }

  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const { showInputModal, data, currencies } = this.props;
    const delgNoSelect = [];
    data.forEach((da) => {
      delgNoSelect.push(da.delg_no);
    });
    const delgNoEditor = <DropDownEditor options={delgNoSelect} />;
    const currSelect = [];
    if (currencies.length > 0) {
      currencies.forEach((cr) => {
        currSelect.push(cr.curr_name);
      });
    }
    const currEditor = <DropDownEditor options={currSelect} />;
    const columns = [
      {
        name: msg('delgNo'),
        key: 'delg_no',
        width: 120,
        editor: delgNoEditor,
      }, {
        name: msg('feeName'),
        key: 'fee_code',
        width: 100,
        editable: true,
      }, {
        name: msg('feeVal'),
        key: 'fee_val',
        width: 100,
        editable: true,
      }, {
        name: msg('currency'),
        key: 'currency',
        width: 100,
        editor: currEditor,
      }, {
        name: msg('remark'),
        key: 'remark',
        width: 100,
        editable: true,
      },
    ];
    return (
      <Modal visible={showInputModal} title="录入代垫费用" onCancel={this.handleCancel} onOk={this.handleSave}>
        <ReactDataGrid
          enableCellSelect
          columns={columns}
          rowGetter={this.rowGetter}
          rowsCount={this.state.rows.length}
          minHeight={400}
          onRowUpdated={this.handleRowUpdated}
        />
      </Modal>
  ); }
}
