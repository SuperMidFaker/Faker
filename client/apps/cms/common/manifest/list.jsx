import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Icon, Layout, Radio, Tag, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadDelgDecls } from 'common/reducers/cmsDeclare';
import { openEfModal } from 'common/reducers/cmsDelegation';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import NavLink from 'client/components/nav-link';
import RowUpdater from '../delegation/rowUpdater';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
export default class ManifestList extends Component {
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
    selectedRowKeys: [],
    searchInput: '',
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    fixed: 'left',
    width: 170,
    render: (o, record) => <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${o}`}>{o}</NavLink>,
  }, {
    title: this.msg('entryId'),
    dataIndex: 'entry_id',
    width: 180,
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
                label={<span><Icon type="edit" /> 录入海关编号</span>}
              />
            </PrivilegeCover>
          );
        }
      } else {
        return '-';
      }
    },
  }, {
    title: '委托方',
    dataIndex: 'send_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('agent'),
    dataIndex: 'customs_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
  }, {
    title: this.msg('clrStatus'),
    dataIndex: 'note',
  }, {
    title: this.msg('customsCheck'),
    dataIndex: 'customs_inspect',
    render: (o) => {
      if (o === 1) {
        return <Tag color="#F04134">是</Tag>;
      } else if (o === 2) {
        return <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
      } else {
        return <Tag>否</Tag>;
      }
    },
  }, {
    title: this.msg('processDate'),
    render: (o, record) => (record.id ?
    record.process_date && moment(record.process_date).format('MM.DD HH:mm') : '-'),
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
  mergeFilters(curFilters, value) {
    const newFilters = {};
    Object.keys(curFilters).forEach((key) => {
      if (key !== 'filterNo') {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters.filterNo = value;
    }
    return newFilters;
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleTableLoad(1, filter);
  }
  render() {
    const { delgdeclList, listFilter } = this.props;
    this.dataSource.remotes = delgdeclList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importOperation') : this.msg('exportOperation')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('manifest')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="wip">{this.msg('filterWIP')}</RadioButton>
            <RadioButton value="generated">{this.msg('filterGenerated')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
              <Button size="large" onClick={this.handleCreateBtnClick} icon="plus">
                {this.msg('submitForReview')}
              </Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel expandable">
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="pre_entry_seq_no" dataSource={this.dataSource}
                loading={delgdeclList.loading} scroll={{ x: 1000 }}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
