import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Dropdown, Menu, Icon, Layout, Radio, Tag, message, Popconfirm, Badge } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadDelgDecls, deleteDecl, setFilterReviewed, showSendDeclModal, openClearFillModal } from 'common/reducers/cmsDeclare';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { openEfModal } from 'common/reducers/cmsDelegation';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import NavLink from 'client/components/nav-link';
import RowUpdater from 'client/components/rowUpdater';
import DeclnoFillModal from './modals/declNoFill';
import ClearFillModal from './modals/customsClearFill';
import { format } from 'client/common/i18n/helpers';
import DeclStatusPopover from './declStatusPopover';
import messages from './message.i18n';
import { DECL_STATUS, CMS_DECL_STATUS } from 'common/constants';
import SendModal from './modals/sendModal';
import DelegationDockPanel from '../dockhub/delegationDockPanel';

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
    customs: state.cmsDeclare.customs.map(cus => ({
      value: cus.customs_code,
      text: cus.customs_name,
    })),
  }),
  { loadDelgDecls, openEfModal, deleteDecl, setFilterReviewed,
    showSendDeclModal, showPreviewer, openClearFillModal }
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
    showSendDeclModal: PropTypes.func.isRequired,
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
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 110,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('declNo'),
    dataIndex: 'entry_id',
    width: 200,
    fixed: 'left',
    render: (o, record) => {
      const preentrySpan = (
        <span>
          <Tag>预</Tag>
          <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>
            {record.pre_entry_seq_no}
          </NavLink>
        </span>);
      switch (record.status) {
        case 0:
        case 1:
          return preentrySpan;
        case 2:
          return (o) ?
            <span>
              <DeclStatusPopover entryId={o}>
                <Tag color={record.passed === 1 ? 'green' : 'blue'}>海关</Tag>
              </DeclStatusPopover>
              <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}> {o}</NavLink>
            </span> :
            <span>
              <Tag>预</Tag> <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>{record.pre_entry_seq_no}</NavLink>
            </span>;
        case 3:
          return (
            <span>
              <DeclStatusPopover entryId={o}><Tag color={record.passed === 1 ? 'green' : 'blue'}>海关</Tag></DeclStatusPopover>
              <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}> {o}</NavLink>
            </span>);
        default:
          return <span />;
      }
    },
  }, {
    title: '收发货人',
    dataIndex: 'trade_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '报关单位',
    dataIndex: 'customs_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '进出口岸',
    dataIndex: 'i_e_port',
    width: 80,
    render: (o) => {
      const cust = this.props.customs.filter(ct => ct.value === o)[0];
      let port = '';
      if (cust) {
        port = cust.text;
      }
      return <TrimSpan text={port} maxLen={14} />;
    },
  }, {
    title: '类型',
    dataIndex: 'sheet_type',
    width: 100,
    render: (o) => {
      if (o === 'CDF') {
        return <Tag color="blue-inverse">报关单</Tag>;
      } else if (o === 'FTZ') {
        return <Tag color="blue">备案清单</Tag>;
      } else {
        return <span />;
      }
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    render: (o) => {
      const decl = CMS_DECL_STATUS.filter(st => st.value === o)[0];
      if (decl) {
        return <Badge status={decl.badge} text={decl && decl.text} />;
      } else {
        return null;
      }
    },
  }, {
    title: '进出口日期',
    dataIndex: 'i_e_date',
    width: 100,
    render: (o, record) => (record.id ?
      record.i_e_date && moment(record.i_e_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 100,
    render: createdt => (createdt ? moment(createdt).format('MM.DD HH:mm') : '-'),
  }, {
    title: '发送时间',
    dataIndex: 'epsend_date',
    width: 100,
    render: senddate => (senddate ? moment(senddate).format('MM.DD HH:mm') : '-'),
  }, {
    title: '发送人',
    dataIndex: 'epsend_login_name',
    width: 100,
  }, {
    title: '回填日期',
    dataIndex: 'backfill_date',
    width: 100,
    render: backdt => (backdt ? moment(backdt).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('opColumn'),
    width: 140,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CMS_DECL_STATUS[0].value) {
        return (
          <span>
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleReview} label={<span><Icon type="check-circle-o" /> {this.msg('review')}</span>} row={record} />
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete(record.id, record.delg_no, record.bill_seq_no)}>
                <a role="button"><Icon type="delete" /></a>
              </Popconfirm>
            </PrivilegeCover>
          </span>
        );
      } else if (record.status === CMS_DECL_STATUS[1].value) {
        return (
          <span>
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleShowSendDeclModal} label={<span><Icon type="mail" /> {this.msg('sendPackets')}</span>} row={record} />
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleRecall} label={<span><Icon type="left-circle-o" /> {this.msg('recall')}</span>} row={record} />
            </PrivilegeCover>
          </span>
        );
      } else {
        const updaters = [];
        if (!record.entry_id) {
          updaters.push(
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit" key="entry_no">
              <RowUpdater onHit={this.handleDeclNoFill} row={record}
                label={<span><Icon type="edit" /> 海关编号</span>}
              />
            </PrivilegeCover>);
        }
        if (!record.passed) {
          updaters.push(
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit" key="clear">
              <RowUpdater onHit={this.handleCustomsClearFill} row={record}
                label={<span><Icon type="edit" />标记放行</span>}
              />
            </PrivilegeCover>);
        }
        if (updaters.length === 2) {
          updaters.splice(1, 0, <span className="ant-divider" key="divider1" />);
        }
        return (
          <span>
            {updaters}
            {record.ep_send_filename && record.status === CMS_DECL_STATUS[2].value && (
              <Dropdown overlay={(
                <Menu>
                  <Menu.Item key="edit">
                    <a role="button" onClick={() => this.handleShowXml(record.ep_send_filename)}><Icon type="eye-o" /> EDI报文</a>
                  </Menu.Item>
                </Menu>)}
              >
                <a><Icon type="down" /></a>
              </Dropdown>
            )}
          </span>
        );
      }
    },
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
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'customsDecl');
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
    this.setState({ selectedRowKeys: [] });
    this.handleTableLoad(1, filter);
  }
  handleDelete = (declId, delgNo, billNo) => {
    this.props.deleteDecl(declId, delgNo, billNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleReview = (row) => {
    this.props.setFilterReviewed(row.id, DECL_STATUS.reviewed).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleRecall = (row) => {
    this.props.setFilterReviewed(row.id, DECL_STATUS.proposed).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleShowSendDeclModal = (record) => {
    this.props.showSendDeclModal({
      visible: true, preEntrySeqNo: record.pre_entry_seq_no,
      delgNo: record.delg_no, agentCustCo: record.agent_custco });
  }
  handleShowXml = (filename) => {
    window.open(`${API_ROOTS.default}v1/cms/declare/send.xml?filename=${filename}`);
  }
  handleCustomsClearFill = (row) => {
    this.props.openClearFillModal(row.entry_id, row.pre_entry_seq_no, row.delg_no);
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
              <Icon type="file" /> {this.msg('customsDeclaration')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="proposed">{this.msg('filterProposed')}</RadioButton>
            <RadioButton value="reviewed">{this.msg('filterReviewed')}</RadioButton>
            <RadioButton value="declared">{this.msg('filterDeclared')}</RadioButton>
            <RadioButton value="finalized">{this.msg('filterFinalized')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools" />
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
                loading={delgdeclList.loading} scroll={{ x: 1650 }}
              />
            </div>
            <DeclnoFillModal reload={this.handleTableLoad} />
            <ClearFillModal reload={this.handleTableLoad} />
            <SendModal ietype={this.props.ietype} reload={this.handleTableLoad} />
          </div>
        </Content>
        <DelegationDockPanel ietype={this.props.ietype} />
      </QueueAnim>
    );
  }
}
