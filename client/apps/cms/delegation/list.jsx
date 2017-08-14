import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Breadcrumb, Button, DatePicker, Layout, Icon, Popconfirm, Radio, Select, Tag, message, Menu, Dropdown } from 'antd';
import Table from 'client/components/remoteAntTable';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/nav-link';
import {
  CMS_DELEGATION_STATUS, CMS_DELEGATION_MANIFEST, DELG_SOURCE, DECL_I_TYPE, DECL_E_TYPE,
  TRANS_MODE, CMS_DECL_WAY_TYPE, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import { loadDelegationList, acceptDelg, delDelg, setDispStatus, loadCiqTable, delgAssignRecall,
  ensureManifestMeta, showDispModal } from 'common/reducers/cmsDelegation';
import { showPreviewer, loadBasicInfo, loadCustPanel, loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import { loadPartnersByTypes } from 'common/reducers/partner';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import OrderDockPanel from '../../scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from '../../transport/shipment/dock/shipmentDockPanel';
import OperatorPopover from 'client/common/operatorsPopover';
import ReceiveDockPanel from '../../cwm/receiving/dock/receivingDockPanel';
import ShippingDockPanel from '../../cwm/shipping/dock/shippingDockPanel';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const RangePicker = DatePicker.RangePicker;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delegationlist: state.cmsDelegation.delegationlist,
    listFilter: state.cmsDelegation.listFilter,
    reload: state.cmsDelegation.delegationsReload,
    preStatus: state.cmsDelgInfoHub.preStatus,
    previewer: state.cmsDelgInfoHub.previewer,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
    tabKey: state.cmsDelgInfoHub.tabKey,
    clients: state.partner.partners,
    customs: state.cmsDelegation.formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_name}`,
    })),
    operators: state.crmCustomers.operators,
  }),
  { loadDelegationList,
    acceptDelg,
    delDelg,
    showPreviewer,
    setDispStatus,
    delgAssignRecall,
    ensureManifestMeta,
    loadCiqTable,
    showDispModal,
    loadPartnersByTypes,
    loadBasicInfo,
    loadCustPanel,
    loadDeclCiqPanel }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class DelegationList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delegationlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadDelegationList: PropTypes.func.isRequired,
    ensureManifestMeta: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    delDelg: PropTypes.func.isRequired,
    reload: PropTypes.bool.isRequired,
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
    popoverVisible: false,
    rightSiderCollapsed: true,
  }
  componentDidMount() {
    const filters = this.initializeFilters();
    if (window.location.search.indexOf('dashboard') < 0) {
      filters.acptDate = [];
    }
    this.props.loadPartnersByTypes(this.props.tenantId, [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], PARTNER_BUSINESSE_TYPES.clearance);
    this.handleDelgListLoad(this.props.delegationlist.current, { ...this.props.listFilter, ...filters, filterNo: '' });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleDelgListLoad();
    }
    if (nextProps.preStatus !== this.props.preStatus) {
      if (nextProps.preStatus === 'delgDispCancel') {
        const { delegation } = this.props;
        this.handleDelgAssignRecall(delegation);
      }
    }
  }
  initializeFilters = () => {
    let filters = { status: 'all', viewStatus: 'all', clientView: { tenantIds: [], partnerIds: [] } };
    if (window.localStorage) {
      filters = JSON.parse(window.localStorage.cmsDelegationListFilters || '{"viewStatus":"all"}');
    }
    return filters;
  }
  saveFilters = (filters) => {
    if (window.localStorage) {
      window.localStorage.cmsDelegationListFilters =
      JSON.stringify({ ...JSON.parse(window.localStorage.cmsDelegationListFilters || '{"viewStatus":"all"}'), ...filters });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('customer'),
    width: 180,
    dataIndex: 'send_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('waybillLadingNo'),
    width: 200,
    dataIndex: 'bl_wb_no',
    render: o => <TrimSpan text={o} maxLen={25} />,
  }, {
    title: this.msg('orderNo'),
    width: 180,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('transMode'),
    width: 100,
    dataIndex: 'trans_mode',
    render: (o) => {
      const mode = TRANS_MODE.filter(ts => ts.value === o)[0];
      return mode ? <span><MdIcon type={mode.icon} /> {mode.text}</span> : <span />;
    },
/*  }, {
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
    },*/
  }, {
    title: this.msg('status'),
    width: 100,
    dataIndex: 'status',
    render: (o, record) => {
      if (record.status === CMS_DELEGATION_STATUS.unaccepted) {
        return <Badge status="default" text="待接单" />;
      } else if (record.status === CMS_DELEGATION_STATUS.accepted
        || record.status === CMS_DELEGATION_STATUS.processing) {
        if (record.manifested === CMS_DELEGATION_MANIFEST.uncreated) {
          return <span><Badge status="warning" text="未制单" /> <Icon type="exclamation-circle-o" /></span>;
        } else if (record.manifested === CMS_DELEGATION_MANIFEST.created) {
          return <span><Badge status="warning" text="制单中" /> <Icon type="clock-circle-o" /></span>;
        } else if (record.manifested === CMS_DELEGATION_MANIFEST.manifested) {
          return <span><Badge status="warning" text="制单完成" /> <Icon type="check-circle-o" /></span>;
        }
      } else if (record.status === CMS_DELEGATION_STATUS.declaring) {
        if (record.sub_status === 1) {
          return <Badge status="processing" text={this.msg('declaredPart')} />;
        } else {
          return <Badge status="processing" text="申报中" />;
        }
      } else if (record.status === CMS_DELEGATION_STATUS.released) {
        if (record.sub_status === 1) {
          return <Badge status="success" text={this.msg('releasedPart')} />;
        } else {
          return <Badge status="success" text="已放行" />;
        }
      }
    },
  }, {
    title: this.msg('declareWay'),
    width: 100,
    dataIndex: 'decl_way_code',
    render: (o, record) => {
      const DECL_TYPE = record.i_e_type === 0 ? DECL_I_TYPE : DECL_E_TYPE;
      const type = DECL_TYPE.filter(dl => dl.key === o)[0];
      if (type) {
        // 0000口岸进口 0001口岸出口 0100保税区进口 0101保税区出口
        if (o === CMS_DECL_WAY_TYPE.IMPT || o === CMS_DECL_WAY_TYPE.IBND) {
          return (<Tag color="blue">{type.value}</Tag>);
          // 0102保税区进境 0103保税区出境
        } else if (o === CMS_DECL_WAY_TYPE.EXPT || o === CMS_DECL_WAY_TYPE.EBND) {
          return (<Tag color="green">{type.value}</Tag>);
        }
      } else {
        return <span />;
      }
    },
  }, {
    title: this.msg('customsBroker'),
    width: 180,
    dataIndex: 'customs_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('ciqType'),
    width: 100,
    dataIndex: 'ciq_inspect',
    render: (o) => {
      if (o === 'NL') {
        return <Tag color="cyan">包装检疫</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="orange">法定检验</Tag>;
      }
      return <span />;
    },
  }, {
    title: this.msg('ciqBroker'),
    width: 180,
    dataIndex: 'ciq_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('operatedBy'),
    width: 80,
    dataIndex: 'recv_login_name',
  }, {
    title: this.msg('lastActTime'),
    dataIndex: 'last_act_time',
    render: (o, record) => record.last_act_time ? moment(record.last_act_time).format('MM.DD HH:mm') : '-',
    /* {
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
    },*/
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDelegationList(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
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
  toggleRightSider = () => {
    this.setState({
      rightSiderCollapsed: !this.state.rightSiderCollapsed,
    });
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/clearance/delegation/create');
  }
  handlePreview = (delgNo, record) => {
    let tabKey = 'customsDecl';
    if (record.status < 1) {
      tabKey = 'basic';
    }
    this.props.showPreviewer(delgNo, tabKey);
  }
  handleDelgListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, loginId,
      delegationlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadDelegationList({
      tenantId,
      loginId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
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
        message.error(result.error.message, 10);
      }
    });
  }
  handleDelegationFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.setState({ selectedRowKeys: [] });
    this.handleDelgListLoad(1, filter);
    this.saveFilters({ status: ev.target.value });
  }
  handleIEFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.ietype) {
      return;
    }
    const filter = { ...this.props.listFilter, ietype: ev.target.value };
    this.handleDelgListLoad(1, filter);
    this.saveFilters({ ietype: ev.target.value });
  }
  handleCiqFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.setState({ selectedRowKeys: [] });
    this.handleCiqListLoad(1, filter);
  }
  handleManifestCreate = (row) => {
    const { loginId, loginName } = this.props;
    this.props.ensureManifestMeta({ delg_no: row.delg_no, loginId, loginName }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const { i_e_type: ietype, bill_seq_no: seqno } = result.data;
        const clearType = ietype === 0 ? 'import' : 'export';
        const link = `/clearance/${clearType}/manifest/`;
        this.context.router.push(`${link}${seqno}`);
      }
    });
  }
  handleManifestMake = (row) => {
    const clearType = row.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/${clearType}/manifest/${row.delg_no}`;
    this.context.router.push(link);
  }
  handleManifestView = (row) => {
    const clearType = row.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/${clearType}/manifest/view/${row.delg_no}`;
    this.context.router.push(link);
  }
  handleDelegationAccept = (row, lid) => {
    if (!lid) {
      message.info('制单人不能为空');
      return;
    }
    const operator = this.props.operators.filter(dop => dop.lid === lid)[0];
    this.props.acceptDelg(
      operator.lid, operator.name, [row.id], row.delg_no
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDelgListLoad();
      }
    });
  }
  handleDelegationAssign = (row) => {
    this.props.showDispModal(row.delg_no, this.props.tenantId);
  }
  handleDelgAssignRecall = (row) => {
    this.props.delgAssignRecall(row.delg_no, this.props.tenantId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
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
        message.error(result.error.message, 10);
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
    this.handleDelgListLoad(1, filter);
    this.saveFilters({ viewStatus: value });
  }
  handleClientSelectChange = (value) => {
    const clientView = { tenantIds: [], partnerIds: [] };
    if (value !== -1) {
      const client = this.props.clients.find(clt => clt.partner_id === value);
      if (client.partner_id !== null) {
        clientView.partnerIds.push(client.partner_id);
      } else {
        clientView.tenantIds.push(client.tid);
      }
    }
    const filter = { ...this.props.listFilter, clientView };
    this.handleDelgListLoad(1, filter);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleDelgListLoad(1, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDateRangeChange = (value, dateString) => {
    const filters = { ...this.props.listFilter, acptDate: dateString };
    this.handleDelgListLoad(1, filters);
  }
  render() {
    const { delegationlist, listFilter, tenantId } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let dateVal = [];
    if (listFilter.acptDate.length > 0 && listFilter.acptDate[0] !== '') {
      dateVal = [moment(listFilter.acptDate[0]), moment(listFilter.acptDate[1])];
    }
    let clientPid = -1;
    if (listFilter.clientView.partnerIds.length > 0) {
      clientPid = listFilter.clientView.partnerIds[0];
    }
    let columns = [];

    this.dataSource.remotes = delegationlist;
    columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 150,
      fixed: 'right',
      render: (o, record) => {
        const clearType = record.i_e_type === 0 ? 'import' : 'export';
        if (record.status === CMS_DELEGATION_STATUS.unaccepted) {         // 1.当前租户未接单
          let editOverlay = null;
          if (record.source === DELG_SOURCE.consigned) {
              // 直接委托未接单可编辑
            editOverlay = (
              <Menu>
                <Menu.Item key="edit">
                  <NavLink to={`/clearance/${clearType}/edit/${record.delg_no}`}>
                    <Icon type="edit" /> {this.msg('modify')}
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="delete">
                  <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelgDel(record.delg_no)}>
                    <a> <Icon type="delete" /> {this.msg('delete')}</a>
                  </Popconfirm>
                </Menu.Item>
              </Menu>);
          }
          return (
            <span>
              <PrivilegeCover module="clearance" feature={clearType} action="edit">
                <OperatorPopover partenrId={record.partnerId} record={record} handleAccept={this.handleDelegationAccept} module="clearance" />
              </PrivilegeCover>
              {editOverlay && <span className="ant-divider" />}
              {editOverlay && <PrivilegeCover module="clearance" feature={clearType} action="edit">
                <Dropdown overlay={editOverlay}>
                  <a role="presentation"><Icon type="down" /></a>
                </Dropdown>
                </PrivilegeCover>}
            </span>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.accepted) {    // 2.当前租户已接单
          let extraOp = null;
          if (record.customs_tenant_id === tenantId) {                    // 2.1 报关单位为当前租户(未作分配)
            extraOp = (
              <RowUpdater onHit={() => this.handleDelegationAssign(record)} row={record}
                label={<Icon type="share-alt" />} tooltip={this.msg('delgDispatch')}
              />);
          } else if (record.customs_tenant_id === -1 ||                   // 2.2 报关单位为线下企业(已作分配)
              record.sub_status === CMS_DELEGATION_STATUS.unaccepted) {     // 2.3 报关供应商尚未接单(已作分配)
            extraOp = (
              <Popconfirm title="你确定撤回分配吗?" onConfirm={() => this.handleDelgAssignRecall(record)} >
                <a role="presentation"><Icon type="rollback" /> {this.msg('delgRecall')}</a>
              </Popconfirm>);
          }
          return (
            <span>
              <RowUpdater onHit={this.handleManifestCreate} label={<span><Icon type="file-add" /> {this.msg('createManifest')}</span>} row={record} />
              {extraOp && <span className="ant-divider" />}
              {extraOp}
            </span>);
        } else if (record.status === CMS_DELEGATION_STATUS.processing) {  // 3.
          let dispatchOverlay = null;
          if (record.customs_tenant_id === tenantId) {                    // 3.1 报关单位为当前租户(未作分配)
            dispatchOverlay = (
              <Menu>
                <Menu.Item>
                  <a onClick={() => this.handleDelegationAssign(record)}><Icon type="share-alt" /> {this.msg('delgDispatch')}</a>
                </Menu.Item>
              </Menu>);
          } else if (record.customs_tenant_id === -1 ||                   // 3.2 报关单位为线下企业(已作分配)
              record.sub_status === CMS_DELEGATION_STATUS.unaccepted) {     // 3.3 报关供应商尚未接单(已作分配)
            dispatchOverlay = (
              <Menu>
                <Menu.Item>
                  <Popconfirm title="你确定撤回分配吗?" onConfirm={() => this.handleDelgAssignRecall(record)}>
                    <a role="presentation"><Icon type="rollback" /> {this.msg('delgRecall')}</a>
                  </Popconfirm>
                </Menu.Item>
              </Menu>);
          }
          let manifestOp = null;
          switch (record.manifested) {
            case CMS_DELEGATION_MANIFEST.created:           // 制单中
              manifestOp = <RowUpdater onHit={this.handleManifestMake} label={<span><Icon type="file-text" /> {this.msg('editManifest')}</span>} row={record} />;
              break;
            case CMS_DELEGATION_MANIFEST.manifested:        // 制单完成(已生成报关清单)
              manifestOp = <RowUpdater onHit={this.handleManifestView} label={<span><Icon type="eye-o" /> {this.msg('viewManifest')}</span>} row={record} />;
              break;
            default:
              break;
          }
          return (
            <span>
              <PrivilegeCover module="clearance" feature={clearType} action="create">
                {manifestOp}
              </PrivilegeCover>
              {dispatchOverlay && <span className="ant-divider" />}
              {dispatchOverlay && <Dropdown overlay={dispatchOverlay}>
                <a role="presentation"><Icon type="down" /></a>
                </Dropdown>}
            </span>);
        } else if (record.status === CMS_DELEGATION_STATUS.declaring ||   // 4. 申报
                      record.status === CMS_DELEGATION_STATUS.released) {   // 5. 放行
          return (
            <PrivilegeCover module="clearance" feature={clearType} action="create">
              <RowUpdater onHit={this.handleManifestView} label={<span><Icon type="eye-o" /> {this.msg('viewManifest')}</span>} row={record} />
            </PrivilegeCover>);
        }
      },
    });

    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    return (
      <Layout>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('delegationManagement')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.ietype} onChange={this.handleIEFilter} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="import">{this.msg('import')}</RadioButton>
            <RadioButton value="export">{this.msg('export')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleDelegationFilter} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="accepting">{this.msg('accepting')}</RadioButton>
            <RadioButton value="undeclared">{this.msg('processing')}</RadioButton>
            <RadioButton value="declared">{this.msg('declaring')}</RadioButton>
            <RadioButton value="finished">{this.msg('releasing')}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <Button type="primary" size="large" onClick={this.handleCreateBtnClick} icon="plus">
              {this.msg('createDelegation')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large"
                onInputSearch={this.handleSearch} value={listFilter.filterNo}
              />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleClientSelectChange} value={clientPid}
                dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
                  search={`${data.partner_code}${data.name}`}
                >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                  )}
              </Select>
              <span />
              <Select size="large" value={listFilter.viewStatus} style={{ width: 160 }} showSearch={false}
                onChange={this.handleViewChange}
              >
                <OptGroup label="常用视图">
                  <Option value="all">全部委托</Option>
                  <Option value="my">我负责的委托</Option>
                </OptGroup>
              </Select>
              <span />
              <RangePicker size="large" value={dateVal}
                ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
                onChange={this.handleDateRangeChange}
              />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                <div className="pull-right">
                  <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
                </div>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout table-fixed-layout">
              <Table rowSelection={rowSelection} columns={columns} dataSource={this.dataSource} loading={delegationlist.loading}
                rowKey="delg_no" scroll={{ x: 1900 }}
              />
            </div>
          </div>
        </Content>
        <DelegationDockPanel />
        <OrderDockPanel />
        <ShipmentDockPanel />
        <ReceiveDockPanel />
        <ShippingDockPanel />
      </Layout>
    );
  }
}
