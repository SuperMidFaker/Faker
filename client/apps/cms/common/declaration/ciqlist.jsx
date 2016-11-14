import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { message, Icon, Switch } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCiqDecls, saveCheckedState } from 'common/reducers/cmsDeclare';
import { openCiqModal } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import SearchBar from 'client/components/search-bar';
import RowUpdater from '../delegation/rowUpdater';
import CiqnoFillModal from './modals/ciqNoFill';

const formatMsg = format(messages);

function ColumnSwitch(props) {
  const { record, field, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  let check = false;
  if (record[field] === 1) {
    check = true;
  }
  return <Switch size="small" checked={check} value={record[field] || 0} onChange={handleChange} />;
}
ColumnSwitch.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    ciqdeclList: state.cmsDeclare.ciqdeclList,
    listFilter: state.cmsDeclare.listFilter,
  }),
  { loadCiqDecls, openCiqModal, saveCheckedState }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})

export default class CiqDeclList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    ciqdeclList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchInput: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('entryId'),
    dataIndex: 'entry_id',
    width: 150,
  }, {
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 150,
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
  }, {
    title: this.msg('billNo'),
    dataIndex: 'bill_seq_no',
    width: 150,
  }, {
    title: this.msg('customsId'),
    width: 180,
    dataIndex: 'customs_id',
    render: (o, record) => {
      if (record.id) {
        if (o) {
          return o;
        } else {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleCiqNoFill} row={record}
                label={<Icon type="edit" />}
              />
            </PrivilegeCover>
          );
        }
      } else {
        return '-';
      }
    },
  }, {
    title: this.msg('agentCode'),
    width: 100,
    dataIndex: 'agent_code',
  }, {
    title: this.msg('agentName'),
    width: 180,
    dataIndex: 'agent_name',
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('clrStatus'),
    width: 100,
    dataIndex: 'note',
  }, {
    title: this.msg('processDate'),
    width: 100,
    render: (o, record) => (record.id ?
      record.process_date && moment(record.process_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: this.msg('qualityCheck'),
    dataIndex: 'quality_check',
    width: 80,
    render: (o, record) =>
      <ColumnSwitch field="quality_check" record={record} onChange={this.handleEditChange} />,
  }, {
    title: this.msg('动检包装查验'),
    dataIndex: 'anipk_check',
    width: 80,
    render: (o, record) =>
      <ColumnSwitch field="anipk_check" record={record} onChange={this.handleEditChange} />,
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: (o, record) => {
      if (record.entry_id) {
        return (
          <span>
            <RowUpdater onHit={this.handleCiqFinish} label={this.msg('ciqFinish')} row={record} />
          </span>
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadCiqDecls(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters) => {
      const params = {
        ietype: this.props.ietype,
        filter: JSON.stringify(filters),
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.ciqdeclList,
  })
  handleEditChange = (record, field, value) => {
    record[field] = value ? 1 : 0; // eslint-disable-line no-param-reassign
    this.props.saveCheckedState(record);
    this.forceUpdate();
  }
  handleCiqFinish = () => {

  }
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadCiqDecls({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.ciqdeclList.pageSize,
      currentPage: currentPage || this.props.ciqdeclList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleCiqNoFill = (row) => {
    this.props.openCiqModal({
      entryHeadId: row.id,
      delgNo: row.delg_no,
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleTableLoad(1, filters);
  }
  render() {
    const { ciqdeclList } = this.props;
    this.dataSource.remotes = ciqdeclList;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.props.ietype === 'import' ? this.msg('importCiq') : this.msg('exportCiq')}</span>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-body table-panel expandable">
              <Table columns={this.columns} dataSource={this.dataSource} loading={ciqdeclList.loading} />
            </div>
            <CiqnoFillModal reload={this.handleTableLoad} />
          </div>
        </div>
      </QueueAnim>
    );
  }
}
