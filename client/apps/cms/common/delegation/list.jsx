import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Breadcrumb, Button, Layout, Icon, Popconfirm, Radio, Select, Tag, Tooltip, message, Menu, Dropdown } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/nav-link';
import { CMS_DELEGATION_STATUS, CMS_DELG_STATUS, CMS_SUP_STATUS, DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import SearchBar from 'client/components/search-bar';
import RowUpdater from './rowUpdater';
import { loadAcceptanceTable, loadBillForMake, acceptDelg, delDelg,
  setDispStatus, loadCiqTable, delgAssignRecall,
  openAcceptModal, showDispModal } from 'common/reducers/cmsDelegation';
import { showPreviewer, loadBasicInfo, loadCustPanel, loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import DelegationInfoHubPanel from '../modals/DelegationInfoHubPanel';
import CiqList from './ciqList';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delegationlist: state.cmsDelegation.delegationlist,
    listFilter: state.cmsDelegation.listFilter,
    saved: state.cmsDelegation.assign.saved,
    billMake: state.cmsDelegation.billMake,
    delgDispShow: state.cmsDelegation.assign.delgDispShow,
    preStatus: state.cmsDelgInfoHub.preStatus,
    previewer: state.cmsDelgInfoHub.previewer,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
    listView: state.cmsDelegation.listView,
    tabKey: state.cmsDelgInfoHub.tabKey,
    customs: state.cmsDelegation.formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_name}`,
    })),
  }),
  { loadAcceptanceTable, loadBillForMake, acceptDelg,
    delDelg, showPreviewer, setDispStatus, delgAssignRecall,
    loadCiqTable, openAcceptModal, showDispModal, loadBasicInfo,
    loadCustPanel, loadDeclCiqPanel }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class DelegationList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    listView: PropTypes.oneOf(['delegation', 'ciq']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delegationlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadAcceptanceTable: PropTypes.func.isRequired,
    loadBillForMake: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    delDelg: PropTypes.func.isRequired,
    billMake: PropTypes.object.isRequired,
    delgDispShow: PropTypes.bool.isRequired,
    saved: PropTypes.bool.isRequired,
    preStatus: PropTypes.string.isRequired,
    previewer: PropTypes.object.isRequired,
    delegation: PropTypes.object.isRequired,
    loadCiqTable: PropTypes.func.isRequired,
    tabKey: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
    expandedKeys: [],
  }
  componentDidMount() {
    const filters = this.initializeFilters();
    this.handleDelgListLoad(1, { ...this.props.listFilter, ...filters });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleDelgListLoad();
    }
    if (nextProps.preStatus !== this.props.preStatus) {
      if (nextProps.preStatus === 'accepted') {
        this.handleDelgListLoad();
      }
      if (nextProps.preStatus === 'make') {
        const { delegation } = this.props;
        this.handleDelegationMake(delegation);
      }
      if (nextProps.preStatus === 'delgDispCancel') {
        const { delegation } = this.props;
        this.handleDelgAssignRecall(delegation);
      }
      if (nextProps.preStatus === 'view') {
        const { delegation } = this.props;
        this.handleDelegationView(delegation);
      }
    }
  }
  initializeFilters = () => {
    let filters = { viewStatus: 'all' };
    if (window.localStorage) {
      filters = JSON.parse(window.localStorage.cmsDelegationListFilters || '{"viewStatus":"all"}');
    }
    return filters;
  }
  saveFilters = (filters) => {
    if (window.localStorage) {
      window.localStorage.cmsDelegationListFilters =
      JSON.stringify({ ...JSON.parse(window.localStorage.cmsDelegationListFilters || '{"viewStatus":"my"}'), viewStatus: filters.viewStatus });
    }
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
    title: this.msg('delgClient'),
    width: 200,
    dataIndex: 'send_name',
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('waybillLadingNo'),
    width: 240,
    dataIndex: 'bl_wb_no',
  }, {
    title: this.msg('invoiceNo'),
    width: 140,
    dataIndex: 'invoice_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('orderNo'),
    width: 140,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('declareCustoms'),
    width: 120,
    dataIndex: 'decl_port',
    render: (o) => {
      const cust = this.props.customs.filter(ct => ct.value === o)[0];
      let port = '';
      if (cust) {
        port = cust.text;
      }
      return <TrimSpan text={port} maxLen={14} />;
    },
  }, {
    title: this.msg('declareWay'),
    width: 80,
    dataIndex: 'decl_way_code',
    render: (o) => {
      const DECL_TYPE = this.props.ietype === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
      const type = DECL_TYPE.filter(dl => dl.key === o)[0];
      // 0000口岸进口 0001口岸出口 0100保税区进口 0101保税区出口
      if (o === '0000' || o === '0001' || o === '0100' || o === '0101') {
        return (<Tag color="blue-inverse">{type.value}</Tag>);
      // 0102保税区进境 0103保税区出境
      } else if (o === '0102' || o === '0103') {
        return (<Tag color="blue">{type.value}</Tag>);
      }
    },
  }, {
    title: this.msg('transMode'),
    width: 140,
    dataIndex: 'trans_mode',
    render: (o) => {
      const mode = TRANS_MODE.filter(ts => ts.value === o)[0];
      // 9为暂时兼容开放接口
      if (o === 'DOM' || o === '9') {
        return (<span><i className="zmdi zmdi-border-outer" /> {mode.text}</span>);
      } else if (o === '2') {
        return (<span><i className="zmdi zmdi-boat" /> {mode.text}</span>);
      } else if (o === '5') {
        return (<span><i className="zmdi zmdi-airplane" /> {mode.text}</span>);
      } else if (o === '3') {
        return (<span><i className="zmdi zmdi-subway" /> {mode.text}</span>);
      } else if (o === '4') {
        return (<span><i className="zmdi zmdi-truck" /> {mode.text}</span>);
      }
    },
  }, {
    title: this.msg('broker'),
    width: 180,
    dataIndex: 'customs_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('declStatus'),
    width: 130,
    dataIndex: 'status',
    render: (o, record) => {
      const CMS_STATUS = (record.customs_tenant_id === this.props.tenantId) ? CMS_DELG_STATUS : CMS_SUP_STATUS;
      let status = record.status;
      if (record.customs_tenant_id !== this.props.tenantId) {
        if (record.status === 1 && record.sub_status === 0) {
          status = 0;
        } else if (record.status === 1 && record.sub_status === 1) {
          status = 1;
        }
      }
      const decl = CMS_STATUS.filter(st => st.value === status)[0];
      if (status === 1) {
        return <Badge status="default" text={decl && decl.text} />;
      } else if (status === 2) {
        return <Badge status="warning" text={decl && decl.text} />;
      } else if (status === 3) {
        if (record.sub_status === 1) {
          return <Badge status="processing" text={this.msg('declaredPart')} />;
        } else { return <Badge status="processing" text={decl && decl.text} />; }
      } else if (status === 4) {
        if (record.sub_status === 1) {
          return <Badge status="success" text={this.msg('releasedPart')} />;
        } else {
          return <Badge status="success" text={decl && decl.text} />;
        }
      } else {
        return <Badge status="default" text={decl && decl.text} />;
      }
    },
  }, {
    title: this.msg('ciqType'),
    width: 100,
    dataIndex: 'ciq_inspect',
    render: (o) => {
      if (o === 'NL') {
        return <Tag color="cyan">包装报检</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="orange">法定检验</Tag>;
      }
      return <span />;
    },
  }, {
    title: this.msg('lastActTime'),
    width: 150,
    dataIndex: 'last_act_time',
    render: (o, record) => {
      if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.last_act_time) {
        return `${this.msg('createdEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.last_act_time) {
        return `${this.msg('acceptedEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else if (record.status === CMS_DELEGATION_STATUS.processing && record.last_act_time) {
        return `${this.msg('processedEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else if (record.status === CMS_DELEGATION_STATUS.declaring && record.last_act_time) {
        return `${this.msg('declaredEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else if (record.status === CMS_DELEGATION_STATUS.released && record.last_act_time) {
        return `${this.msg('releasedEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else {
        return '--';
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadAcceptanceTable(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        ietype: this.props.ietype,
        tenantId: this.props.tenantId,
        loginId: this.props.loginId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delegationlist,
  })

  handlePreview = (delgNo, record) => {
    let tabKey = 'customsDecl';
    if (record.status < 1) {
      tabKey = 'basic';
    }
    this.props.showPreviewer(delgNo, tabKey);
  }
  handleCreateBtnClick = () => {
    this.context.router.push(`/clearance/${this.props.ietype}/create`);
  }
  handleDelgListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, ietype, loginId,
      delegationlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadAcceptanceTable({
      ietype,
      tenantId,
      loginId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleCiqListLoad = (currentPage, filter) => {
    const { tenantId, ietype, listFilter, loginId,
      delegationlist: { pageSize, current } } = this.props;
    this.props.loadCiqTable({
      ietype,
      filter: JSON.stringify(filter || listFilter),
      tenantId,
      loginId,
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleDelegationFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleDelgListLoad(1, filter);
  }
  handleCiqFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleCiqListLoad(1, filter);
  }
  handleDelegationMake = (row) => {
    this.props.loadBillForMake(row.delg_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const link = `/clearance/${this.props.ietype}/manifest/`;
        this.context.router.push(`${link}${this.props.billMake.bill_seq_no}`);
      }
    });
  }
  handleDelegationView = (row) => {
    this.props.loadBillForMake(row.delg_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const link = `/clearance/${this.props.ietype}/manifest/view/`;
        this.context.router.push(`${link}${this.props.billMake.bill_seq_no}`);
      }
    });
  }
  handleDelegationAccept = (row) => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [row.id],
      type: 'delg',
      delg_no: row.delg_no,
      opt: 'accept',
    });
  }
  handleDelegationAssign = (row) => {
    this.props.showDispModal(row.delg_no, this.props.tenantId);
  }
  handleDelgAssignRecall = (row) => {
    this.props.delgAssignRecall(row.delg_no, this.props.tenantId).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleDelgListLoad();
        if (this.props.previewer.visible) {
          this.props.loadBasicInfo(this.props.tenantId, row.delg_no, this.props.tabKey);
          if (this.props.tabKey === 'customsDecl') {
            this.props.loadCustPanel({
              delgNo: row.delg_no, tenantId: this.props.tenantId,
            });
          } else if (this.props.tabKey === 'ciqDecl') {
            this.props.loadDeclCiqPanel(row.delg_no, this.props.tenantId);
          }
        }
      }
    });
  }
  handleDelgDel = (delgNo) => {
    this.props.delDelg(delgNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleDelgListLoad();
      }
    });
  }
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  handleViewChange = (value) => {
    const filter = { ...this.props.listFilter, viewStatus: value };
    if (this.props.listView === 'ciq') {
      this.handleCiqListLoad(1, filter);
    } else if (this.props.listView === 'delegation') {
      this.handleDelgListLoad(1, filter);
    }
    this.saveFilters({ viewStatus: value });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    if (this.props.listView === 'delegation') {
      this.handleDelgListLoad(1, filters);
    } else if (this.props.listView === 'ciq') {
      this.handleCiqListLoad(1, filters);
    }
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
  render() {
    const { delegationlist, listFilter, listView, tenantId } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let columns = [];
    if (listView === 'delegation') {
      this.dataSource.remotes = delegationlist;
      columns = [...this.columns];
      columns.push({
        title: this.msg('opColumn'),
        width: 130,
        fixed: 'right',
        render: (o, record) => {
          if (record.customs_tenant_id === tenantId) {
            if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.source === 1) {
              return (
                <span>
                  <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
                    <RowUpdater onHit={this.handleDelegationAccept} label={this.msg('accepting')} row={record} />
                  </PrivilegeCover>
                  <span className="ant-divider" />
                  <RowUpdater onHit={() => this.handleDelegationAssign(record)} label={this.msg('delgDistribute')} row={record} />
                  <span className="ant-divider" />
                  <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
                    <Dropdown overlay={(
                      <Menu onClick={this.handleMenuClick}>
                        <Menu.Item key="edit">
                          <NavLink to={`/clearance/${this.props.ietype}/edit/${record.delg_no}`}>
                            <Icon type="edit" /> {this.msg('modify')}
                          </NavLink>
                        </Menu.Item>
                        <Menu.Item key="delete">
                          <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelgDel(record.delg_no)}>
                            <a> <Icon type="delete" /> {this.msg('delete')}</a>
                          </Popconfirm>
                        </Menu.Item>
                      </Menu>)}
                    >
                      <a><Icon type="down" /></a>
                    </Dropdown>
                  </PrivilegeCover>
                </span>
              );
            } else if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.source !== 1) {
              return (
                <span>
                  <RowUpdater onHit={this.handleDelegationAccept} label={this.msg('accepting')} row={record} />
                  <span className="ant-divider" />
                  <RowUpdater onHit={() => this.handleDelegationAssign(record)} label={this.msg('delgDistribute')} row={record} />
                </span>
              );
            } else if (record.status === CMS_DELEGATION_STATUS.accepted) {
              return (
                <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
                  <RowUpdater onHit={this.handleDelegationMake} label={this.msg('createManifest')} row={record} />
                </PrivilegeCover>
              );
            }
          } else if (record.customs_tenant_id === -1) {
            if (record.status === CMS_DELEGATION_STATUS.accepted && record.sub_status === CMS_DELEGATION_STATUS.accepted) {
              return (
                <span>
                  <RowUpdater onHit={this.handleDelegationMake} label={this.msg('createManifest')} row={record} />
                  <span className="ant-divider" />
                  <Popconfirm title="你确定撤回分配吗?" onConfirm={() => this.handleDelgAssignRecall(record)} >
                    <a role="button">{this.msg('delgRecall')}</a>
                  </Popconfirm>
                </span>
              );
            }
          } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.sub_status === CMS_DELEGATION_STATUS.unaccepted) {
            return (
              <Popconfirm title="你确定撤回分配吗?" onConfirm={() => this.handleDelgAssignRecall(record)} >
                <a role="button">{this.msg('delgRecall')}</a>
              </Popconfirm>
            );
          }
        },
      });
    }
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('delegationManagement')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleDelegationFilter} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="accept">{this.msg('accepting')}</RadioButton>
            <RadioButton value="undeclared">{this.msg('processing')}</RadioButton>
            <RadioButton value="declared">{this.msg('declaring')}</RadioButton>
            <RadioButton value="finished">{this.msg('releasing')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleCiqFilter} size="large">
            <RadioButton value="ciqPending">{this.msg('ciq')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
              <Button type="primary" size="large" onClick={this.handleCreateBtnClick} icon="plus">
                {this.msg('createDelegation')}
              </Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className="toolbar-right">
                <Select size="large" value={listFilter.viewStatus} style={{ width: 160 }} showSearch={false}
                  onChange={this.handleViewChange}
                >
                  <OptGroup label="常用视图">
                    <Option value="all">全部委托</Option>
                    <Option value="my">我负责的委托</Option>
                  </OptGroup>
                </Select>
                <Tooltip title="清关业务委托设置">
                  <Button size="large" icon="setting" />
                </Tooltip>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              {
                listView === 'delegation' &&
                <Table rowSelection={rowSelection} columns={columns} dataSource={this.dataSource} loading={delegationlist.loading}
                  rowKey="delg_no" scroll={{ x: 1850 }}
                />
              }
              {
                listView === 'ciq' &&
                <CiqList ietype={this.props.ietype} showPreviewer={this.handlePreview} />
              }
            </div>
          </div>
        </Content>
        <DelegationInfoHubPanel ietype={this.props.ietype} />
      </QueueAnim>
    );
  }
}
