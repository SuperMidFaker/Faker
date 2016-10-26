import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Radio, Button, Popconfirm, message, Modal, Tag } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/nav-link';
import { CMS_DELEGATION_STATUS, CMS_DELG_STATUS, PARTNERSHIP_TYPE_INFO, CMS_SUP_STATUS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import SearchBar from 'client/components/search-bar';
import BillSubTable from './billSubTable';
import BillModal from './modals/billModal';
import RowUpdater from './rowUpdater';
import DelgDispatch from './delgDispatch';
import CiqTable from './ciqTableList';
import CertTable from './certTableList';
import { loadAcceptanceTable, loadBillMakeModal, acceptDelg, delDelg, loadDeclareWay, matchQuote,
  showPreviewer, setDispStatus, loadDelgDisp, loadDisp, loadCiqTable, loadCertTable } from 'common/reducers/cmsDelegation';
import { loadPaneExp } from 'common/reducers/cmsExpense';
import PreviewPanel from '../modals/preview-panel';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
    delegateTracking: state.cmsDelegation.previewer.delegateTracking,
    delegation: state.cmsDelegation.previewer.delegation,
    matchParam: state.cmsDelegation.matchParam,
  }),
  { loadAcceptanceTable, loadBillMakeModal, acceptDelg,
    delDelg, showPreviewer, setDispStatus, loadDelgDisp, loadDisp,
    loadPaneExp, loadCiqTable, loadDeclareWay, matchQuote, loadCertTable }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class DelegationList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
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
    delegateTracking: PropTypes.object.isRequired,
    delegation: PropTypes.object.isRequired,
    loadPaneExp: PropTypes.func.isRequired,
    loadCiqTable: PropTypes.func.isRequired,
    loadDeclareWay: PropTypes.func.isRequired,
    matchQuote: PropTypes.func.isRequired,
    matchParam: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchInput: '',
    expandedKeys: [],
    service: 0,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleDelgListLoad();
    }
    if (nextProps.matchParam !== this.props.matchParam) {
      this.handleMatchQuote(nextProps.matchParam);
    }
    if (nextProps.preStatus !== this.props.preStatus) {
      if (nextProps.preStatus === 'accept') {
        const { loginId, loginName, delegateTracking } = this.props;
        this.props.acceptDelg(loginId, loginName, delegateTracking.id).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.handleDelgListLoad();
              this.props.showPreviewer({
                delgNo: delegateTracking.delg_no,
                tenantId: this.props.tenantId,
              }, 1);
            }
          }
        );
      }
      if (nextProps.preStatus === 'make') {
        const { delegation } = this.props;
        this.handleDelegationMake(delegation);
      }
      if (nextProps.preStatus === 'dispatch') {
        const { delegation } = this.props;
        this.handleDelegationAssign(delegation);
      }
      if (nextProps.preStatus === 'dispCancel') {
        const { delegation } = this.props;
        this.handleDelegationCancel(delegation);
      }
      if (nextProps.preStatus === 'view') {
        const { delegation } = this.props;
        this.handleDelegationView(delegation);
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    render: (o, record) => {
      return (
        <a onClick={() => this.handlePreview(o, record)}>
          {o}
        </a>);
    },
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
    title: this.msg('deliveryNo'),
    width: 180,
    dataIndex: 'bl_wb_no',
  }, {
    title: this.msg('packageNum'),
    width: 80,
    dataIndex: 'pieces',
  }, {
    title: this.msg('delgWeight'),
    width: 120,
    dataIndex: 'weight',
  }, {
    title: this.msg('broker'),
    width: 180,
    dataIndex: 'decl_name',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('status'),
    width: 130,
    dataIndex: 'status',
    render: (o, record) => {
      const CMS_STATUS = (record.type === 1) ? CMS_DELG_STATUS : CMS_SUP_STATUS;
      const decl = CMS_STATUS.filter(st => st.value === o)[0];
      if (record.status === 1) {
        return <Tag>{decl && decl.text}</Tag>;
      } else if (record.status === 2) {
        return <Tag color="blue">{decl && decl.text}</Tag>;
      } else if (record.status === 3) {
        if (record.sub_status === 1) {
          return <Tag color="orange">{this.msg('declaredPart')}</Tag>;
        } else { return <Tag color="yellow">{decl && decl.text}</Tag>; }
      } else if (record.status === 4) {
        if (record.sub_status === 0) {
          return <Tag color="green">{decl && decl.text}</Tag>;
        } else {
          return <Tag color="orange">{this.msg('releasedPart')}</Tag>;
        }
      } else {
        return <Tag>{decl && decl.text}</Tag>;
      }
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
      } else if (record.status === CMS_DELEGATION_STATUS.declaring && record.last_act_time) {
        return `${this.msg('processedEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else if (record.status === CMS_DELEGATION_STATUS.declared && record.last_act_time) {
        return `${this.msg('declaredEvent')}
        ${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      } else if (record.status === CMS_DELEGATION_STATUS.passed && record.last_act_time) {
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

  handlePreview = (o, record) => {
    this.props.showPreviewer({
      delgNo: o,
      tenantId: this.props.tenantId,
    }, record.status);
    this.props.loadPaneExp(o);
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
  handleCertListLoad = (currentPage, filter) => {
    const { tenantId, ietype, listFilter,
      delegationlist: { pageSize, current } } = this.props;
    this.props.loadCertTable({
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
  handleRadioChange = (ev) => {
    this.setState({ service: 0 });
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleDelgListLoad(1, filter);
  }
  handleRadioChangeType = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    if (ev.target.value === 'ciq') {
      this.setState({ service: 1 });
      const filter = { ...this.props.listFilter, status: ev.target.value };
      this.handleCiqListLoad(1, filter);
    } else if (ev.target.value === 'cert') {
      this.setState({ service: 2 });
      const filter = { ...this.props.listFilter, status: ev.target.value };
      this.handleCertListLoad(1, filter);
    }
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
    const { loginId, loginName } = this.props;
    this.props.acceptDelg(loginId, loginName, row.id).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleDelgListLoad();
          this.showAcceptInfo(row);
        }
      }
    );
  }
  handleDelegationAssign = (row, type) => {
    if (row.ciq_name && type === 'ciq' && row.ciq_name !== null) {
      this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsClearanceBroker,
      type);
    } else if (row.cert_name && type === 'cert' && row.cert_name !== null) {
      this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsClearanceBroker,
      type);
    } else {
      this.props.loadDelgDisp(
        row.delg_no,
        this.props.tenantId,
        PARTNERSHIP_TYPE_INFO.customsClearanceBroker,
        type
      );
    }
    this.props.setDispStatus({ delgDispShow: true });
  }
  handleDelegationCancel = (row, type) => {
    this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsClearanceBroker,
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
  handleSubdelgsList = (record) => {
    return (
      <BillSubTable delgNo={record.delg_no} ietype={this.props.ietype}
        reloadDelgs={this.handleDelgListLoad} delgStatus={record.status}
      />
    );
  }
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleDelgListLoad(1, filters);
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
    const { delegationlist, listFilter } = this.props;
    this.dataSource.remotes = delegationlist;
    const columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 100,
      render: (o, record) => {
        if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.type === 1) {
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
        } else if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.type === 2) {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <span>
                <RowUpdater onHit={() => this.handleDelegationCancel(record, 'delg')} label={this.msg('delgRecall')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'ciq')} label={this.msg('ciq')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'cert')} label={this.msg('cert')} row={record} />
              </span>
            </PrivilegeCover>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.type === 1 && (record.sub_status === 3 || record.sub_status === null)) {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
              <span>
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'delg')} label={this.msg('delgDistribute')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={this.handleMQdeclWay} label={this.msg('matchQuote')} row={record} />
              </span>
            </PrivilegeCover>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.type === 1 && record.sub_status === 4) {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
              <span>
                <RowUpdater onHit={this.handleDelegationMake} label={this.msg('declareMake')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'ciq')} label={this.msg('ciq')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'cert')} label={this.msg('cert')} row={record} />
              </span>
            </PrivilegeCover>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.declaring && record.type === 1) {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
              <span>
                <RowUpdater onHit={this.handleDelegationMake} label={this.msg('declareMake')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'ciq')} label={this.msg('ciq')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'cert')} label={this.msg('cert')} row={record} />
              </span>
            </PrivilegeCover>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.declared && record.type === 1 && record.sub_status === 1) {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
              <span>
                <RowUpdater onHit={this.handleDelegationMake} label={this.msg('declareMake')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'ciq')} label={this.msg('ciq')} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={() => this.handleDelegationAssign(record, 'cert')} label={this.msg('cert')} row={record} />
              </span>
            </PrivilegeCover>
          );
        } else {
          return (
            <span>
              <RowUpdater onHit={this.handleDelegationView} label={this.msg('declareView')} row={record} />
              <span className="ant-divider" />
              <RowUpdater onHit={() => this.handleDelegationAssign(record, 'cert')} label={this.msg('cert')} row={record} />
            </span>
          );
        }
      },
    });
    // todo expandedRow fixed
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.props.ietype === 'import' ? this.msg('importDeclaration') : this.msg('exportDeclaration')}</span>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange}>
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="accept">{this.msg('accepting')}</RadioButton>
            <RadioButton value="undeclared">{this.msg('processing')}</RadioButton>
            <RadioButton value="declared">{this.msg('declaring')}</RadioButton>
            <RadioButton value="finished">{this.msg('releasing')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChangeType}>
            <RadioButton value="ciq">{this.msg('ciq')}</RadioButton>
            <RadioButton value="cert">{this.msg('cert')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          {this.state.service === 0 && <div className="page-body">
            <div className="panel-header">
              <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
                <Button type="primary" onClick={this.handleCreateBtnClick} icon="plus-circle-o">
                  {this.msg('delgNew')}
                </Button>
              </PrivilegeCover>
            </div>
            <div className="panel-body table-panel expandable">
              <Table columns={columns} dataSource={this.dataSource} loading={delegationlist.loading}
                expandedRowKeys={this.state.expandedKeys}
                expandedRowRender={delegationlist.data.length > 0 && this.handleSubdelgsList}
                scroll={{ x: 1560 }} onExpandedRowsChange={this.handleExpandedChange}
              />
            </div>
          </div>}
          {this.state.service === 1 && <CiqTable ietype={this.props.ietype} />}
          {this.state.service === 2 && <CertTable ietype={this.props.ietype} />}
        </div>
        <BillModal ietype={this.props.ietype} />
        <DelgDispatch show={this.props.delgDispShow} onClose={this.closeDispDock} />
        <PreviewPanel ietype={this.props.ietype} />
      </QueueAnim>
    );
  }
}
