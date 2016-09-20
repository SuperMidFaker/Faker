import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Radio, Button, Popconfirm, message, Modal, Tag } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import TrimSpan from 'client/components/trimSpan';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import { CMS_DELEGATION_STATUS, CMS_DELG_STATUS, PARTNERSHIP_TYPE_INFO, CMS_SUP_STATUS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import SearchBar from 'client/components/search-bar';
import BillSubTable from './billSubTable';
import BillModal from './modals/billModal';
import RowUpdater from './rowUpdater';
import DelgDispatch from './delgDispatch';
import { loadAcceptanceTable, loadBillMakeModal, acceptDelg, delDelg,
  showPreviewer, setDispStatus, loadDelgDisp, loadDisp } from 'common/reducers/cmsDelegation';
import PreviewPanel from '../modals/preview-panel';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
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
  }),
  { loadAcceptanceTable, loadBillMakeModal, acceptDelg,
    delDelg, showPreviewer, setDispStatus, loadDelgDisp, loadDisp }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    moduleName: 'clearance',
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class DelegationList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    aspect: PropTypes.number.isRequired,
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchInput: '',
    expandedKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleDelgListLoad();
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
        <a onClick={() => this.props.showPreviewer({
          delgNo: o,
          tenantId: this.props.tenantId,
        }, record.status)}>
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
    /*
    title: '外部编号',
    width: 150,
    render: (o, record) => (
      this.props.aspect === TENANT_ASPECT.BO ? record.ref_delg_external_no
      : record.ref_recv_external_no
    ),
  }, {
    */
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
    /*
    title: '货物性质',
    dataIndex: 'goods_type',
    render: (o) => {
      const decl = GOODSTYPES.filter(gd => gd.value === o)[0];
      return decl && decl.text;
    },
  }, {
    */
    title: this.msg('broker'),
    width: 180,
    dataIndex: 'recv_name',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('status'),
    width: 130,
    dataIndex: 'status',
    render: (o, record) => {
      const CMS_STATUS = (record.source === 1) ? CMS_DELG_STATUS : CMS_SUP_STATUS;
      const decl = CMS_STATUS.filter(st => st.value === o)[0];
      if (record.status === 1) {
        return <Tag>{decl && decl.text}</Tag>;
      } else if (record.status === 2) {
        return <Tag color="blue">{decl && decl.text}</Tag>;
      } else if (record.status === 3) {
        if (record.sub_status === 0) {
          return <Tag color="yellow">{decl && decl.text}</Tag>;
        } else { return <Tag color="orange">{this.msg('declaredPart')}</Tag>; }
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
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleDelgListLoad(1, filter);
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
    this.props.acceptDelg(loginId, loginName, row.dispId).then(
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
  handleDelegationAssign = (row) => {
    this.props.loadDelgDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsClearanceBroker
    );
    this.props.setDispStatus({ delgDispShow: true });
  }
  handleDelegationCancel = (row) => {
    this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsClearanceBroker);
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
        reloadDelgs={this.handleDelgListLoad}
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
        if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.source === 1) {
          return (
            <span>
              <RowUpdater onHit={this.handleDelegationAccept} label={this.msg('accepting')} row={record} />
              <span className="ant-divider" />
              <NavLink to={`/clearance/${this.props.ietype}/edit/${record.delg_no}`}>
              {this.msg('modify')}
              </NavLink>
              <span className="ant-divider" />
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelgDel(record.delg_no)}>
                <a role="button">{this.msg('delete')}</a>
              </Popconfirm>
            </span>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.unaccepted && record.source === 2) {
          return (
            <span>
              <RowUpdater onHit={this.handleDelegationCancel} label={this.msg('delgRecall')} row={record} />
            </span>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.accepted && record.source === 1) {
          return (
            <span>
              <RowUpdater onHit={this.handleDelegationAssign} label={this.msg('delgDistribute')} row={record} />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleDelegationMake} label={this.msg('declareMake')} row={record} />
            </span>
          );
        } else if (record.status === CMS_DELEGATION_STATUS.declaring && record.source === 1 && record.sub_status > 0) {
          return (
            <RowUpdater onHit={this.handleDelegationMake} label={this.msg('declareMake')} row={record} />
          );
        } else if (record.status === CMS_DELEGATION_STATUS.declared && record.source === 1 && record.sub_status > 0) {
          return (
            <RowUpdater onHit={this.handleDelegationMake} label={this.msg('declareMake')} row={record} />
          );
        } else {
          return (
            <RowUpdater onHit={this.handleDelegationView} label={this.msg('declareView')} row={record} />
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
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={this.handleCreateBtnClick}
                icon="plus-circle-o"
              >
              {this.msg('delgNew')}
              </Button>
            </div>
            <div className="panel-body table-panel expandable">
              <Table columns={columns} dataSource={this.dataSource} loading={delegationlist.loading}
                expandedRowKeys={this.state.expandedKeys}
                expandedRowRender={delegationlist.data.length > 0 && this.handleSubdelgsList}
                scroll={{ x: 1380 }} onExpandedRowsChange={this.handleExpandedChange}
              />
            </div>
          </div>
          <BillModal ietype={this.props.ietype} />
          <DelgDispatch show={this.props.delgDispShow} onClose={this.closeDispDock} />
          <PreviewPanel />
        </div>
      </QueueAnim>
    );
  }
}
