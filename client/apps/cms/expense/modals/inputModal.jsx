import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { closeInModal } from 'common/reducers/cmsExpense';
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
  { closeInModal }
)
export default class InputModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showInputModal: PropTypes.bool.isRequired,
    currencies: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
  }
  state = {
    rows: createRows(100),
  }
  rowGetter = rowIdx => this.state.rows[rowIdx]
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({ rows });
  }
  handleCancel = () => {
    this.props.closeInModal();
  }
  handleSave = () => {
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
        width: 100,
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
        width: 80,
        editable: true,
      },
    ];
    return (
      <Modal maskClosable={false} visible={showInputModal} title="录入代垫费用" onCancel={this.handleCancel} onOk={this.handleSave}>
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
    );
  }
}
