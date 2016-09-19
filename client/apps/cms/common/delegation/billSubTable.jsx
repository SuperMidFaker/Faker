import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, message } from 'antd';
import moment from 'moment';
import { DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { loadSubdelgsTable, openEfModal } from 'common/reducers/cmsDelegation';
import RowUpdater from './rowUpdater';
import DeclnoFillModal from './modals/declNoFill';
import NavLink from 'client/components/nav-link';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

@injectIntl
@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    delgBills: state.cmsDelegation.delgBillsMap[props.delgNo],
  }),
  { loadSubdelgsTable, openEfModal }
)
export default class SubdelgTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('billNo'),
    dataIndex: 'bill_seq_no',
    width: 160,
    render: (o, record) => {
      let linkTo = `/clearance/${this.props.ietype}/docs/make/`;
      if (record.bill_status > 4) {
        linkTo = `/clearance/${this.props.ietype}/docs/view/`;
      }
      return (
        <NavLink to={`${linkTo}${o}`}>
          {o}
        </NavLink>);
    },
  }, {
    title: this.msg('declareWay'),
    dataIndex: 'decl_way_code',
    width: 100,
    render: (o) => {
      const decls = this.props.ietype === 'import' ?
        DECL_I_TYPE : DECL_E_TYPE;
      const decl = decls.filter(dit => dit.key === o)[0];
      return decl && decl.value;
    },
  }, {
    title: this.msg('manualNo'),
    width: 140,
    dataIndex: 'manual_no',
  }, {
    title: this.msg('preEntryNo'),
    width: 160,
    dataIndex: 'pre_entry_seq_no',
    render: (o, record) => (record.id ? o : '-'),
  }, {
    title: this.msg('entryId'),
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
    title: this.msg('packageNum'),
    width: 60,
    dataIndex: 'pack_count',
  }, {
    title: this.msg('delgGrossWt'),
    width: 80,
    dataIndex: 'gross_wt',
  }, {
    title: this.msg('clrStatus'),
    width: 160,
    dataIndex: 'note',
    render: (o, record) => (record.id ? o : '-'),
  }, {
    title: this.msg('processDate'),
    width: 80,
    render: (o, record) => (record.id ?
    record.process_date && moment(record.process_date).format('YYYY.MM.DD') : '-'),
  }]

  handleTableLoad = () => {
    this.props.loadSubdelgsTable({
      delg_no: this.props.delgNo,
      pageSize: this.props.delgBills.pageSize,
      current: this.props.delgBills.current,
    }).then((result) => {
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
          onExpandedRowsChange={this.handleExpandedChange} loading={delgBills.loading}
        />
        <DeclnoFillModal reload={this.handleTableLoad} reloadDelgs={reloadDelgs} />
      </div>
  ); }
}
