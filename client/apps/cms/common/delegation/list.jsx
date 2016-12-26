import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Breadcrumb, Button, Icon, Modal, Popconfirm, Radio, Select, Tag, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/nav-link';
import { CMS_DELEGATION_STATUS, CMS_DELG_STATUS, PARTNER_BUSINESSES, CMS_SUP_STATUS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import SearchBar from 'client/components/search-bar';
import BillSubTable from './billSubTable';
import BillModal from './modals/billModal';
import RowUpdater from './rowUpdater';
import DelgDispatch from './delgDispatch';
import { loadAcceptanceTable, loadBillMakeModal, acceptDelg, delDelg, loadDeclareWay, matchQuote,
  showPreviewer, setDispStatus, loadDelgDisp, loadDisp, loadCiqTable, loadCertBrokers, loadRelatedDisp,
  setCiqFinish, openAcceptModal } from 'common/reducers/cmsDelegation';
import { loadCertFees, openCertModal } from 'common/reducers/cmsExpense';
import DelegationInfoHubPanel from '../modals/DelegationInfoHubPanel';
import CertModal from './modals/certModal';
import AcceptModal from './modals/acceptModal';
import CiqList from './ciqList';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
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
    saved: state.cmsDelegation.saved,
    billMakeModal: state.cmsDelegation.billMakeModal,
    delgDispShow: state.cmsDelegation.delgDispShow,
    preStatus: state.cmsDelegation.preStatus,
    delgDispatch: state.cmsDelegation.previewer.delgDispatch,
    delegation: state.cmsDelegation.previewer.delegation,
    matchParam: state.cmsDelegation.matchParam,
    matchStatus: state.cmsDelegation.matchStatus,
    listView: state.cmsDelegation.listView,
  }),
  { loadAcceptanceTable, loadBillMakeModal, acceptDelg,
    delDelg, showPreviewer, setDispStatus, loadDelgDisp, loadDisp,
    loadCiqTable, loadDeclareWay, matchQuote,
    loadCertFees, openCertModal, loadCertBrokers, loadRelatedDisp,
    setCiqFinish, openAcceptModal }
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
    loadBillMakeModal: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    delDelg: PropTypes.func.isRequired,
    billMakeModal: PropTypes.object.isRequired,
    delgDispShow: PropTypes.bool.isRequired,
    loadDelgDisp: PropTypes.func.isRequired,
    loadDisp: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
    preStatus: PropTypes.string.isRequired,
    delgDispatch: PropTypes.object.isRequired,
    delegation: PropTypes.object.isRequired,
    loadCiqTable: PropTypes.func.isRequired,
    loadDeclareWay: PropTypes.func.isRequired,
    matchQuote: PropTypes.func.isRequired,
    matchParam: PropTypes.object.isRequired,
    matchStatus: PropTypes.object.isRequired,
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
    this.props.loadCertBrokers(this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleDelgListLoad();
    }
    if (nextProps.matchStatus !== this.props.matchStatus) {
      if (nextProps.matchStatus.status === 'noquote') {
        message.info(formatMsg(this.props.intl, 'info'), 3);
      }
    }
    if (nextProps.preStatus !== this.props.preStatus) {
      if (nextProps.preStatus === 'accepted') {
        this.handleDelgListLoad();
        this.showAcceptInfo(this.acceptingRow);
      }
      if (nextProps.preStatus === 'make') {
        const { delegation } = this.props;
        this.handleDelegationMake(delegation);
      }
      if (nextProps.preStatus === 'assignAll') {
        const { delegation } = this.props;
        this.handleDelegationAssign(delegation, 'all');
      }
      if (nextProps.preStatus === 'dispatch') {
        const { delegation } = this.props;
        this.handleDelegationAssign(delegation, 'delg');
      }
      if (nextProps.preStatus === 'ciqdispatch') {
        const { delegation } = this.props;
        this.handleDelegationAssign(delegation, 'ciq');
      }
      if (nextProps.preStatus === 'delgDispCancel') {
        const { delegation } = this.props;
        this.handleDelegationCancel(delegation, 'delg');
      }
      if (nextProps.preStatus === 'allDispCancel') {
        const { delegation } = this.props;
        this.handleDelegationCancel(delegation, 'all');
      }
      if (nextProps.preStatus === 'ciqDispCancel') {
        const { delegation } = this.props;
        this.handleDelegationCancel(delegation, 'ciq');
      }
      if (nextProps.preStatus === 'view') {
        const { delegation } = this.props;
        this.handleDelegationView(delegation);
      }
      if (nextProps.preStatus === 'ciqfinish') {
        const { delegation } = this.props;
        this.handleCiqFinish(delegation.delg_no);
      }
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
    dataIndex: 'customer_name',
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('orderNo'),
    width: 140,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('invoiceNo'),
    width: 140,
    dataIndex: 'invoice_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('waybillLadingNo'),
    dataIndex: 'bl_wb_no',
  }, {
    title: this.msg('packageNum'),
    width: 60,
    dataIndex: 'pieces',
  }, {
    title: this.msg('delgWeight'),
    width: 80,
    dataIndex: 'weight',
  }, {
    title: this.msg('broker'),
    width: 180,
    dataIndex: 'decl_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('declStatus'),
    width: 130,
    dataIndex: 'status',
    render: (o, record) => {
      const CMS_STATUS = (record.recv_tenant_id === this.props.tenantId) ? CMS_DELG_STATUS : CMS_SUP_STATUS;
      const decl = CMS_STATUS.filter(st => st.value === o)[0];
      if (record.status === 1) {
        return <Badge status="default" text={decl && decl.text} />;
      } else if (record.status === 2) {
        return <Badge status="warning" text={decl && decl.text} />;
      } else if (record.status === 3) {
        if (record.sub_status === 1) {
          return <Badge status="processing" text={this.msg('declaredPart')} />;
        } else { return <Badge status="processing" text={decl && decl.text} />; }
      } else if (record.status === 4) {
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
        return <Tag color="#ccc">一般报检</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="#fa0">法定检验</Tag>;
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
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delegationlist,
  })

  handlePreview = (delgNo) => {
    this.props.showPreviewer(this.props.tenantId, delgNo);
  }
  handleCiqFinish = (delgNo) => {
    this.props.setCiqFinish(delgNo).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
  }
  handleCreateBtnClick = () => {
    this.context.router.push(`/clearance/${this.props.ietype}/create`);
  }
  handleDelgListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, ietype,
      delegationlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadAcceptanceTable({
      ietype,
      tenantId,
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
    const { tenantId, ietype, listFilter,
      delegationlist: { pageSize, current } } = this.props;
    this.props.loadCiqTable({
      ietype,
      filter: JSON.stringify(filter || listFilter),
      tenantId,
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
  handleMQdeclWay = (row) => {
    this.props.loadDeclareWay(row).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleMatchQuote = (matchParam) => {
    this.props.matchQuote(matchParam).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handleDelgListLoad();
      }
    });
  }
  handleDelegationMake = (row) => {
    this.props.loadBillMakeModal({
      delg_no: row.delg_no,
    }, 'make').then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleDelegationView = (row) => {
    this.props.loadBillMakeModal({
      delg_no: row.delg_no,
    }, 'view').then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  showAcceptInfo = (row) => {
    let closed = false;
    const Info = Modal.info({
      title: this.msg('successfulOperation'),
      okText: this.msg('startMaking'),
      content: this.msg('makeConfirm'),
      onOk: () => {
        this.handleDelegationMake(row);
        closed = true;
      },
    });
    setTimeout(() => !closed && Info.destroy(), 2000);
  }
  handleDelegationAccept = (row) => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [row.id],
      type: 'delg',
    });
    this.acceptingRow = row;
  }
  handleDelegationAssign = (row, type) => {
    let typecode = PARTNER_BUSINESSES.CCB;
    if (type === 'ciq') {
      typecode = PARTNER_BUSINESSES.CIB;
    } else if (type === 'all') {
      typecode = [PARTNER_BUSINESSES.CCB, PARTNER_BUSINESSES.CIB, PARTNER_BUSINESSES.ICB].join(',');
    }
    this.props.loadDelgDisp(row.delg_no, this.props.tenantId, typecode, type);
    this.props.setDispStatus({ delgDispShow: true });
  }
  handleDelegationCancel = (row, type) => {
    let typecode = PARTNER_BUSINESSES.CCB;
    if (type === 'ciq') {
      typecode = PARTNER_BUSINESSES.CIB;
    } else if (type === 'all') {
      typecode = [PARTNER_BUSINESSES.CCB, PARTNER_BUSINESSES.CIB, PARTNER_BUSINESSES.ICB].join(',');
    }
    this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      typecode,
      type);
    this.props.setDispStatus({ delgDispShow: true });
  }
  closeDispDock = () => {
    this.props.setDispStatus({ delgDispShow: false });
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
  handleSubdelgsList = record => (
    <BillSubTable delgNo={record.delg_no} ietype={this.props.ietype}
      reloadDelgs={this.handleDelgListLoad} delgStatus={record.status}
    />
  )
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
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
  handleCertModalLoad = (row) => {
    this.props.loadRelatedDisp(this.props.tenantId, row.delg_no);
    const params = {};
    params.id = row.id;
    params.delg_no = row.delg_no;
    if (row.recv_tenant_id === this.props.tenantId) {
      params.recv_tenant_id = row.recv_tenant_id;
    } else {
      params.recv_tenant_id = row.send_tenant_id;
    }
    this.props.loadCertFees(params);
    this.props.openCertModal();
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
          if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.recv_tenant_id === tenantId && record.source === 1) {
            return (
              <span>
                <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
                  <RowUpdater onHit={this.handleDelegationAccept} label={this.msg('accepting')} row={record} />
                </PrivilegeCover>
                <span className="ant-divider" />
                <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
                  <NavLink to={`/clearance/${this.props.ietype}/edit/${record.delg_no}`}>
                    {this.msg('modify')}
                  </NavLink>
                </PrivilegeCover>
                <span className="ant-divider" />
                <PrivilegeCover module="clearance" feature={this.props.ietype} action="delete">
                  <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelgDel(record.delg_no)}>
                    <a role="button">{this.msg('delete')}</a>
                  </Popconfirm>
                </PrivilegeCover>
              </span>
            );
          } else if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.recv_tenant_id === tenantId && record.source !== 1) {
            return (
              <RowUpdater onHit={this.handleDelegationAccept} label={this.msg('accepting')} row={record} />
            );
          } else if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.send_tenant_id === tenantId && record.recv_tenant_id !== -1) {
            return (
              <RowUpdater onHit={() => this.handleDelegationCancel(record, 'delg')} label={this.msg('delgRecall')} row={record} />
            );
          } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.send_tenant_id === tenantId && record.recv_tenant_id === -1) {
            return (
              <span>
                <RowUpdater onHit={this.handleDelegationMake} label={this.msg('editManifest')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationCancel(record, 'delg')} label={this.msg('delgRecall')} row={record} />
              </span>
            );
          } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.recv_tenant_id === tenantId) {
            return (
              <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
                <span>
                  <RowUpdater onHit={this.handleDelegationMake} label={this.msg('createManifest')} row={record} />
                  <span className="ant-divider" />
                  <RowUpdater onHit={() => this.handleDelegationAssign(record, 'delg')} label={this.msg('delgDistribute')} row={record} />
                </span>
              </PrivilegeCover>
            );
          } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.send_tenant_id === tenantId) {
            return <span />;
          } else if (record.status === CMS_DELEGATION_STATUS.processing && record.recv_tenant_id === tenantId) {
            return (
              <RowUpdater onHit={this.handleDelegationMake} label={this.msg('editManifest')} row={record} />
            );
          } else if (record.status === CMS_DELEGATION_STATUS.declaring && record.recv_tenant_id === tenantId && record.sub_status === 1) {
            return (
              <RowUpdater onHit={this.handleDelegationMake} label={this.msg('editManifest')} row={record} />
            );
          } else if (record.status === CMS_DELEGATION_STATUS.declaring) {
            return (
              <RowUpdater onHit={this.handleDelegationView} label={this.msg('trackDecl')} row={record} />
            );
          } else if (record.status === CMS_DELEGATION_STATUS.released && record.send_tenant_id === tenantId) {
            return (
              <RowUpdater onHit={this.handleDelegationView} label={this.msg('completeDelg')} row={record} />
            );
          } else {
            return (
              <RowUpdater onHit={this.handleDelegationView} label={this.msg('viewManifest')} row={record} />
            );
          }
        },
      }
      /*
      , {
        title: this.msg('办证'),
        width: 80,
        render: (o, record) => {
          if (record.status > 0) {
            return (
              <RowUpdater onHit={this.handleCertModalLoad} label={this.msg('certOp')} row={record} />
            );
          }
        },
      }*/
      );
    }
    // todo expandedRow fixed
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('delegationManagement')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleDelegationFilter}>
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="accept">{this.msg('accepting')}</RadioButton>
            <RadioButton value="undeclared">{this.msg('processing')}</RadioButton>
            <RadioButton value="declared">{this.msg('declaring')}</RadioButton>
            <RadioButton value="finished">{this.msg('releasing')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleCiqFilter}>
            <RadioButton value="ciqPending">{this.msg('ciq')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
                <Button type="primary" onClick={this.handleCreateBtnClick} icon="plus">
                  {this.msg('delgNew')}
                </Button>
              </PrivilegeCover>
              <div className="toolbar-right">
                <Select defaultValue="my"
                  style={{ width: 160 }}
                  showSearch={false}
                >
                  <OptGroup label="常用视图">
                    <Option value="all">全部委托</Option>
                    <Option value="my">我负责的委托</Option>
                  </OptGroup>
                </Select>
                <Button><Icon type="setting" /></Button>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel expandable">
              {
                listView === 'delegation' &&
                <Table rowSelection={rowSelection} columns={columns} dataSource={this.dataSource} loading={delegationlist.loading}
                  rowKey="delg_no" scroll={{ x: 1650 }}
                />
              }
              {
                listView === 'ciq' &&
                <CiqList ietype={this.props.ietype} showPreviewer={this.handlePreview} />
              }
            </div>
          </div>
        </div>
        <BillModal ietype={this.props.ietype} />
        <DelgDispatch show={this.props.delgDispShow} onClose={this.closeDispDock} />
        <DelegationInfoHubPanel ietype={this.props.ietype} />
        <CertModal />
        <AcceptModal />
      </QueueAnim>
    );
  }
}
