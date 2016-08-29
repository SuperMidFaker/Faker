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
    delgBills: PropTypes.array.isRequired,
    delgNo: PropTypes.string.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    loadSubdelgsTable: PropTypes.func.isRequired,
    openEfModal: PropTypes.func.isRequired,
    reloadDelgs: PropTypes.func.isRequired,
  }
  state = {
    expandedRowKeys: [],
  }

  componentWillMount() {
    this.setState({ expandedRowKeys: this.props.delgBills.map(bl => bl.key) });
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgBills.length !== this.props.delgBills.length) {
      this.setState({ expandedRowKeys: nextProps.delgBills.map(bl => bl.key) });
    }
  }

  columns = [{
    title: '清单编号',
    dataIndex: 'bill_seq_no',
    width: 160,
    render: (o) => {
      return (
        <a href={`/clearance/${this.props.ietype}/declare/make/${o}`}>
          {o}
        </a>);
    },
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
    render: (o, record) => (record.id ? o : '-'),
  }, {
    title: '报关单号',
    width: 160,
    dataIndex: 'entry_id',
    render: (o, record) => {
      // 用id字段表示为children数据
      if (record.id) {
        if (o) {
          return o;
        } else {
          return (
            <RowUpdater onHit={this.handleDeclNoFill}
              label={<Icon type="edit" />} row={record}
            />
          );
        }
      } else {
        return '-';
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
    title: '通关状态',
    width: 160,
    dataIndex: 'note',
    render: (o, record) => (record.id ? o : '-'),
  }, {
    title: '更新时间',
    width: 80,
    render: (o, record) => (record.id ?
    record.process_date && moment(record.process_date).format('YYYY.MM.DD') : '-'),
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
  handleExpandedChange = (expandedRowKeys) => {
    this.setState({ expandedRowKeys });
  }
  render() {
    const { delgBills, reloadDelgs } = this.props;
    return (
      <div>
        <Table expandedRowKeys={this.state.expandedRowKeys} columns={this.columns}
          dataSource={delgBills} pagination={false} size="middle" scroll={{ y: 200 }}
          onExpandedRowsChange={this.handleExpandedChange}
        />
        <DeclnoFillModal reload={this.handleTableLoad} reloadDelgs={reloadDelgs} />
      </div>
  ); }
}
