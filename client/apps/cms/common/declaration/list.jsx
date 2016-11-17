import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { message, Icon, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadDelgDecls } from 'common/reducers/cmsDeclare';
import { openEfModal } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import SearchBar from 'client/components/search-bar';
import RowUpdater from '../delegation/rowUpdater';
import DeclnoFillModal from './modals/declNoFill';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delgdeclList: state.cmsDeclare.delgdeclList,
    listFilter: state.cmsDeclare.listFilter,
  }),
  { loadDelgDecls, openEfModal }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})

export default class DelgDeclList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delgdeclList: PropTypes.object.isRequired,
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
    width: 160,
    fixed: 'left',
    render: (o, record) => {
      // 用id字段表示为children数据
      if (record.id) {
        if (o) {
          return o;
        } else {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleDeclNoFill} row={record}
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
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 160,
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
  }, {
    title: this.msg('billNo'),
    dataIndex: 'bill_seq_no',
    width: 160,
  }, {
    title: this.msg('agentCode'),
    width: 100,
    dataIndex: 'agent_code',
  }, {
    title: this.msg('agentName'),
    dataIndex: 'agent_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('clrStatus'),
    width: 150,
    dataIndex: 'note',
  }, {
    title: this.msg('processDate'),
    width: 120,
    render: (o, record) => (record.id ?
    record.process_date && moment(record.process_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: this.msg('customsCheck'),
    width: 80,
    dataIndex: 'customs_check',
    render: (o) => {
      if (o === 1) {
        return <Tag color="green">是</Tag>;
      } else {
        return <Tag>否</Tag>;
      }
    },
  }, {
    title: this.msg('opColumn'),
    fixed: 'right',
    width: 100,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDelgDecls(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        ietype: this.props.ietype,
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delgdeclList,
  })
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadDelgDecls({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.delgdeclList.pageSize,
      currentPage: currentPage || this.props.delgdeclList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleDeclNoFill = (row) => {
    this.props.openEfModal({
      entryHeadId: row.id,
      billSeqNo: row.bill_seq_no,
      delgNo: row.delg_no,
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleTableLoad(1, filters);
  }
  render() {
    const { delgdeclList } = this.props;
    this.dataSource.remotes = delgdeclList;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.props.ietype === 'import' ? this.msg('importDeclaration') : this.msg('exportDeclaration')}</span>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-body table-panel expandable">
              <Table columns={this.columns} dataSource={this.dataSource} loading={delgdeclList.loading} scroll={{ x: 1400 }} />
            </div>
            <DeclnoFillModal reload={this.handleTableLoad} />
          </div>
        </div>
      </QueueAnim>
    );
  }
}
