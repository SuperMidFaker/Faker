import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, message } from 'antd';
import moment from 'moment';
import { DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { loadSubdelgsTable, openEfModal } from 'common/reducers/cmsDelegation';
import RowUpdater from './rowUpdater';
import DeclnoFillModal from './declNoFill';

@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    delgBills: state.cmsDelegation.delgBillsMap[props.delgNo],
  }),
  { loadSubdelgsTable, openEfModal }
)
export default class SubdelgTable extends Component {
  static propTypes = {
    delgBills: PropTypes.object.isRequired,
    delgNo: PropTypes.string.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    loadSubdelgsTable: PropTypes.func.isRequired,
    openEfModal: PropTypes.func.isRequired,
    reloadDelgs: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.handleTableLoad();
  }

  columns = [{
    title: '清单编号',
    dataIndex: 'bill_seq_no',
    width: 160,
  }, {
    title: '报关方式',
    dataIndex: 'decl_way_code',
    width: 100,
    render: (o) => {
      const decls = this.props.ietype === 'import' ?
        DECL_I_TYPE : DECL_E_TYPE;
      const decl = decls.filter(dit => dit.key === o)[0];
      return decl && decl.value;
    },
  }, {
    title: '备案编号',
    width: 140,
    dataIndex: 'manual_no',
  }, {
    title: '统一编号',
    width: 160,
    dataIndex: 'pre_entry_seq_no',
  }, {
    title: '报关单号',
    width: 160,
    dataIndex: 'entry_id',
    render: (o, record) => {
      if (record.key !== record.bill_seq_no) {
        if (o) {
          return o;
        } else {
          return (
            <RowUpdater onHit={this.handleDeclNoFill}
              label={<Icon type="edit" />} row={record}
            />
          );
        }
      }
    },
  }, {
    title: '件数',
    width: 60,
    dataIndex: 'pack_count',
  }, {
    title: '毛重',
    width: 80,
    dataIndex: 'gross_wt',
  }, {
    title: '回执状态',
    width: 160,
    dataIndex: 'status',
  }, {
    title: '回执时间',
    width: 80,
    render: (o, record) => record.process_time && moment(record.process_time).format('YYYY.MM.DD'),
  }]

  handleTableLoad = () => {
    this.props.loadSubdelgsTable({
      delg_no: this.props.delgNo,
      pageSize: this.props.delgBills.pageSize,
      current: this.props.delgBills.current,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleDeclNoFill = (row) => {
    this.props.openEfModal({
      entryHeadId: row.key,
      billSeqNo: row.bill_seq_no,
      delgNo: this.props.delgNo,
    });
  }
  render() {
    const { delgBills, reloadDelgs } = this.props;
    return (
      <div>
        <Table columns={this.columns} dataSource={delgBills} pagination={false} size="small" scroll={{ y: 170 }} />
        <DeclnoFillModal reload={this.handleTableLoad} reloadDelgs={reloadDelgs} />
      </div>
  ); }
}
