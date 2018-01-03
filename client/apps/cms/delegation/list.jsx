import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Avatar, Badge, Breadcrumb, Button, DatePicker, Layout, Input, Icon, Popconfirm, Radio, Select, Tag, message, Menu, Dropdown } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/NavLink';
import UserAvatar from 'client/components/UserAvatar';
import {
  CMS_DELEGATION_STATUS, CMS_DELEGATION_MANIFEST, DELG_SOURCE, DECL_TYPE,
  TRANS_MODE, CMS_DECL_WAY_TYPE, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import OperatorPopover from 'client/common/operatorsPopover';
import RowAction from 'client/components/RowAction';
import { Logixon, MdIcon, Fontello } from 'client/components/FontIcon';
import { loadDelegationList, acceptDelg, delDelg, setDispStatus, loadCiqTable, delgAssignRecall,
  ensureManifestMeta, showDispModal, loadFormRequire } from 'common/reducers/cmsDelegation';
import { showPreviewer, loadBasicInfo, loadCustPanel, loadDeclCiqPanel } from 'common/reducers/cmsDelegationDock';
import { loadPartnersByTypes } from 'common/reducers/partner';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import messages from './message.i18n';
import OrderDockPanel from '../../scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from '../../transport/shipment/dock/shipmentDockPanel';
import ReceiveDockPanel from '../../cwm/receiving/dock/receivingDockPanel';
import ShippingDockPanel from '../../cwm/shipping/dock/shippingDockPanel';

const formatMsg = format(messages);
const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar,
    loginName: state.account.username,
    delegationlist: state.cmsDelegation.delegationlist,
    listFilter: state.cmsDelegation.listFilter,
    reload: state.cmsDelegation.delegationsReload,
    preStatus: state.cmsDelegationDock.preStatus,
    previewer: state.cmsDelegationDock.previewer,
    delegation: state.cmsDelegationDock.previewer.delegation,
    tabKey: state.cmsDelegationDock.tabKey,
    clients: state.partner.partners,
    customs: state.cmsDelegation.formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_name}`,
    })),
    operators: state.crmCustomers.operators,
  }),
  {
    loadDelegationList,
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
    loadDeclCiqPanel,
    loadFormRequire,
  }
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
    loadDelegationList: PropTypes.func.isRequired,
    ensureManifestMeta: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    delDelg: PropTypes.func.isRequired,
    reload: PropTypes.bool.isRequired,
    preStatus: PropTypes.string.isRequired,
    tabKey: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    filterName: null,
  }
  componentDidMount() {
    const filters = this.initializeFilters();
    if (window.location.search.indexOf('dashboard') < 0) {
      filters.acptDate = [];
    }
    this.props.loadPartnersByTypes(
      this.props.tenantId,
      [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS],
      PARTNER_BUSINESSE_TYPES.clearance
    );
    const { listFilter } = this.props;
    this.handleDelgListLoad(this.props.delegationlist.current, {
      ...listFilter, ...filters, filterNo: '', clientView: listFilter.clientView,
    });
    this.props.loadFormRequire();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleDelgListLoad();
    }
    if (nextProps.preStatus !== this.props.preStatus) {
      if (nextProps.preStatus === 'delgDispCancel') {
        const { delegation } = this.props;
        this.handleDelegationRecall(delegation);
      }
    }
  }
  initializeFilters = () => {
    let filters = {};
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
    title: <Logixon type="dan" />,
    dataIndex: 'order_rel_no',
    width: 36,
    fixed: 'left',
    render: (o, record) => {
      if (record.status === 0) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status === 1) {
        return <Fontello type="circle" color="green" />;
      }
      return <Fontello type="circle" color="gray" />;
    },
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 160,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={ev => this.showDelegationDock(o, record, ev)}>
        {o}
      </a>),
  }, {
    title: this.msg('client'),
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
        }
        return <Badge status="processing" text="申报中" />;
      } else if (record.status === CMS_DELEGATION_STATUS.released) {
        if (record.sub_status === 1) {
          return <Badge status="success" text={this.msg('releasedPart')} />;
        }
        return <Badge status="success" text="已放行" />;
      }
      return <span />;
    },
  }, {
    title: this.msg('declareWay'),
    width: 100,
    dataIndex: 'decl_way_code',
    render: (o) => {
      // const DECL_TYPE = record.i_e_type === 0 ? DECL_I_TYPE : DECL_E_TYPE;
      const type = DECL_TYPE.filter(dl => dl.key === o)[0];
      if (type) {
        if (o === CMS_DECL_WAY_TYPE.IMPT || o === CMS_DECL_WAY_TYPE.IBND) {
          return (<Tag color="blue">{type.value}</Tag>);
        } else if (o === CMS_DECL_WAY_TYPE.EXPT || o === CMS_DECL_WAY_TYPE.EBND) {
          return (<Tag color="green">{type.value}</Tag>);
        } else if (o === CMS_DECL_WAY_TYPE.IMTR || o === CMS_DECL_WAY_TYPE.IBTR) {
          return (<Tag color="geekblue">{type.value}</Tag>);
        } else if (o === CMS_DECL_WAY_TYPE.EXTR || o === CMS_DECL_WAY_TYPE.EBTR) {
          return (<Tag color="lime">{type.value}</Tag>);
        }
      }
      return <span />;
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
    width: 120,
    dataIndex: 'recv_login_id',
    render: lid => <UserAvatar size="small" loginId={lid} showName />,
  }, {
    title: this.msg('lastActTime'),
    dataIndex: 'last_act_time',
    render: (o, record) => (record.last_act_time ? moment(record.last_act_time).format('MM.DD HH:mm') : '-'),
  }]
  handleCreate = () => {
    this.context.router.push('/clearance/delegation/create');
  }

  handleDelgListLoad = (currentPage, filter) => {
    const { listFilter, delegationlist: { pageSize, current } } = this.props;
    this.props.loadDelegationList({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleStatusFilter = (ev) => {
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
  handleManifestDetail = (record) => {
    if (record.status > CMS_DELEGATION_STATUS.accepted) {
      if (record.manifested === CMS_DELEGATION_MANIFEST.created) {
        this.handleManifestMake(record);
      } else {
        this.handleManifestView(record);
      }
    }
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
    this.props.acceptDelg(operator.lid, operator.name, [row.id], row.delg_no).then((result) => {
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
  handleDelegationRecall = (row) => {
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
  handleDelegationDelete = (delgNo) => {
    this.props.delDelg(delgNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDelgListLoad();
      }
    });
  }
  handleSearchChange = (ev) => {
    this.setState({ filterName: ev.target.value });
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
  handleExecutorChange = (value) => {
    const filter = { ...this.props.listFilter, viewStatus: value };
    this.handleDelgListLoad(1, filter);
    this.saveFilters({ viewStatus: value });
  }
  handleDateRangeChange = (value, dateString) => {
    const filters = { ...this.props.listFilter, acptDate: dateString };
    this.handleDelgListLoad(1, filters);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleDelgListLoad(1, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  showDelegationDock = (delgNo, record, ev) => {
    ev.stopPropagation();
    this.props.showPreviewer(delgNo, 'shipment');
  }
  render() {
    const {
      delegationlist, listFilter, tenantId, avatar, loginName,
    } = this.props;
    const filterName = this.state.filterName === null ? listFilter.filterNo : this.state.filterName;
    const dataSource = new DataTable.DataSource({
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
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        const filter = {
          ...this.props.listFilter,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        params.filter = JSON.stringify(filter);
        return params;
      },
      remotes: this.props.delegationlist,
    });
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
      [clientPid] = listFilter.clientView.partnerIds;
    }
    const clients = [{
      name: '全部委托单位',
      partner_id: -1,
    }].concat(this.props.clients);
    const toolbarActions = (<span>
      <Search
        style={{ width: 250 }}
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
        onChange={this.handleSearchChange}
        value={filterName}
      />
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        value={clientPid}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}>
          {data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
        </Option>))}
      </Select>
      <Select
        value={listFilter.viewStatus}
        style={{ width: 160 }}
        showSearch={false}
        onChange={this.handleExecutorChange}
      >
        <Option value="all"><Avatar size="small" icon="team" /> 全部制单人员</Option>
        <Option value="my">{avatar ? <Avatar size="small" src={avatar} /> : <Avatar size="small" icon="user" />} {loginName}</Option>
      </Select>
      <RangePicker
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);

    dataSource.remotes = delegationlist;
    let columns = [];
    columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      dataIndex: 'OPS_COL',
      width: 150,
      fixed: 'right',
      render: (o, record) => {
        const clearType = record.i_e_type === 0 ? 'import' : 'export';
        if (record.status === CMS_DELEGATION_STATUS.unaccepted) { // 1.当前租户未接单
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
                  <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelegationDelete(record.delg_no)}>
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
              {editOverlay && <PrivilegeCover module="clearance" feature={clearType} action="edit">
                <Dropdown overlay={editOverlay}>
                  <a role="presentation"><Icon type="down" /></a>
                </Dropdown>
              </PrivilegeCover>}
            </span>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.accepted) { // 2.当前租户已接单
          let extraOp = null;
          if (record.customs_tenant_id === tenantId) { // 2.1 报关单位为当前租户(未作分配)
            extraOp = (
              <RowAction
                onClick={() => this.handleDelegationAssign(record)}
                row={record}
                label={<Icon type="share-alt" />}
                tooltip={this.msg('delgDispatch')}
              />);
          } else if (record.customs_tenant_id === -1 || // 2.2 报关单位为线下企业(已作分配)
              record.sub_status === CMS_DELEGATION_STATUS.unaccepted) { // 2.3 报关供应商尚未接单(已作分配)
            extraOp = (
              <RowAction
                confirm="你确定撤回分配吗?"
                onConfirm={this.handleDelegationRecall}
                row={record}
                label={<Icon type="rollback" />}
                tooltip={this.msg('delgRecall')}
              />);
          }
          return (
            <span>
              <RowAction primary onClick={this.handleManifestCreate} label={<span><Icon type="file-add" /> {this.msg('createManifest')}</span>} row={record} />
              {extraOp}
            </span>);
        } else if (record.status === CMS_DELEGATION_STATUS.processing) { // 3.
          let dispatchOverlay = null;
          if (record.customs_tenant_id === tenantId) { // 3.1 报关单位为当前租户(未作分配)
            dispatchOverlay = (
              <Menu>
                <Menu.Item>
                  <a onClick={() => this.handleDelegationAssign(record)}><Icon type="share-alt" /> {this.msg('delgDispatch')}</a>
                </Menu.Item>
              </Menu>);
          } else if (record.customs_tenant_id === -1 || // 3.2 报关单位为线下企业(已作分配)
              record.sub_status === CMS_DELEGATION_STATUS.unaccepted) { // 3.3 报关供应商尚未接单(已作分配)
            dispatchOverlay = (
              <Menu>
                <Menu.Item>
                  <Popconfirm title="你确定撤回分配吗?" onConfirm={() => this.handleDelegationRecall(record)}>
                    <a role="presentation"><Icon type="rollback" /> {this.msg('delgRecall')}</a>
                  </Popconfirm>
                </Menu.Item>
              </Menu>);
          }
          let manifestOp = null;
          switch (record.manifested) {
            case CMS_DELEGATION_MANIFEST.created: // 制单中
              manifestOp = <RowAction onClick={this.handleManifestMake} label={<span><Icon type="form" /> {this.msg('editManifest')}</span>} row={record} />;
              break;
            case CMS_DELEGATION_MANIFEST.manifested: // 制单完成(已生成报关清单)
              manifestOp = <RowAction onClick={this.handleManifestView} label={<span><Icon type="eye-o" /> {this.msg('viewManifest')}</span>} row={record} />;
              break;
            default:
              break;
          }
          return (
            <span>
              <PrivilegeCover module="clearance" feature={clearType} action="create">
                {manifestOp}
              </PrivilegeCover>
              {dispatchOverlay && <RowAction overlay={dispatchOverlay} />}
            </span>);
        } else if (record.status === CMS_DELEGATION_STATUS.declaring || // 4. 申报
                      record.status === CMS_DELEGATION_STATUS.released) { // 5. 放行
          return (
            <PrivilegeCover module="clearance" feature={clearType} action="create">
              <RowAction onClick={this.handleManifestView} label={<span><Icon type="eye-o" /> {this.msg('viewManifest')}</span>} row={record} />
            </PrivilegeCover>);
        }
        return <span />;
      },
    });

    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('delgManifest')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.ietype} onChange={this.handleIEFilter}>
              <RadioButton value="all">{this.msg('all')}</RadioButton>
              <RadioButton value="import">{this.msg('filterImport')}</RadioButton>
              <RadioButton value="export">{this.msg('filterExport')}</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={listFilter.status} onChange={this.handleStatusFilter}>
              <RadioButton value="all">{this.msg('all')}</RadioButton>
              <RadioButton value="accepting">{this.msg('accepting')}</RadioButton>
              <RadioButton value="undeclared">{this.msg('processing')}</RadioButton>
              <RadioButton value="declared">{this.msg('declaring')}</RadioButton>
              <RadioButton value="finished">{this.msg('releasing')}</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" onClick={this.handleCreate} icon="plus">
              {this.msg('createDelegation')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            columns={columns}
            dataSource={dataSource}
            rowKey="delg_no"
            loading={delegationlist.loading}
            onRow={record => ({
              onClick: () => {},
              onDoubleClick: () => { this.handleManifestDetail(record); },
              onContextMenu: () => {},
              onMouseEnter: () => {},
              onMouseLeave: () => {},
            })}
          />
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
