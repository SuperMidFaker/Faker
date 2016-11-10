import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { message, Tag, } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { PARTNERSHIP_TYPE_INFO, CMS_CIQ_STATUS, CIQ_SUP_STATUS } from 'common/constants';
import { loadCiqTable, openCiqModal, acceptCiqCert, loadCertBrokers,
  loadRelatedDisp, setDispStatus, loadDisp, loadDelgDisp, setCiqFinish } from 'common/reducers/cmsDelegation';
import { loadCertFees, openCertModal } from 'common/reducers/cmsExpense';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from './rowUpdater';
import DelgDispatch from './delgDispatch';
import SearchBar from 'client/components/search-bar';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    ciqlist: state.cmsDelegation.ciqlist,
    listFilter: state.cmsDelegation.listFilter,
    saved: state.cmsDelegation.saved,
  }),
  { loadCiqTable, openCiqModal, acceptCiqCert, loadCertFees, openCertModal,
    loadCertBrokers, loadRelatedDisp, setDispStatus, loadDisp, loadDelgDisp, setCiqFinish }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class CiqList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    ciqlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    saved: PropTypes.bool.isRequired,
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
      this.handleTableLoad();
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
  }, {
    title: this.msg('delgClient'),
    width: 200,
    dataIndex: 'send_name',
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('inspbroker'),
    width: 140,
    dataIndex: 'recv_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('status'),
    width: 130,
    dataIndex: 'status',
    render: (o, record) => {
      const CMS_STATUS = (record.type === 1) ? CMS_CIQ_STATUS : CIQ_SUP_STATUS;
      const decl = CMS_STATUS.filter(st => st.value === o)[0];
      if (record.status === 1) {
        return <Tag>{decl && decl.text}</Tag>;
      } else if (record.status === 2) {
        return <Tag color="green">{decl && decl.text}</Tag>;
      } else {
        return <Tag>{decl && decl.text}</Tag>;
      }
    },
  }, {
    title: this.msg('lastActTime'),
    width: 150,
    dataIndex: 'last_act_time',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: this.msg('opColumn'),
    width: 140,
    render: (record) => {
      if (record.status === 0 && record.type === 1) {
        return (
          <RowUpdater onHit={this.handleAccept} label={this.msg('accepting')} row={record} />
        );
      } else if (record.status === 1 && record.type === 1) {
        return (
          <span>
            <RowUpdater onHit={() => this.handleDelegationAssign(record, 'ciq')} label={this.msg('delgDistribute')} row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleCiqFinish} label={this.msg('ciqFinish')} row={record} />
          </span>
        );
      } else if (record.status === 0 && record.type === 2) {
        return (
          <RowUpdater onHit={() => this.handleDelegationCancel(record, 'ciq')} label={this.msg('delgRecall')} row={record} />
        );
      } else {
        return (
          <RowUpdater label={this.msg('declareView')} />
        );
      }
    },
  }, {
    title: this.msg('办证'),
    width: 80,
    render: (o, record) => {
      if (record.status > 0) {
        return (
          <RowUpdater onHit={this.handleCertModalLoad} label={this.msg('certOp')} row={record} />
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadCiqTable(params),
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
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.ciqlist,
  })
  handleAccept = (row) => {
    const { loginId, loginName, tenantId } = this.props;
    this.props.acceptCiqCert(loginId, loginName, row.delg_no, row.recv_server_type, tenantId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleTableLoad();
        }
      }
    );
  }
  handleCiqFinish = (row) => {
    this.props.setCiqFinish(row.delg_no);
  }
  handleDelegationAssign = (row, type) => {
    this.props.loadDelgDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsInspectBroker,
      type);
    this.props.setDispStatus({ delgDispShow: true });
  }
  handleDelegationCancel = (row, type) => {
    this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNERSHIP_TYPE_INFO.customsInspectBroker,
      type);
    this.props.setDispStatus({ delgDispShow: true });
  }
  closeDispDock = () => {
    this.props.setDispStatus({ delgDispShow: false });
  }
  handleCertModalLoad = (row) => {
    this.props.loadCertBrokers(this.props.tenantId);
    this.props.loadRelatedDisp(this.props.tenantId, row.delg_no);
    this.props.loadCertFees(row);
    this.props.openCertModal();
  }
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadCiqTable({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.ciqlist.pageSize,
      currentPage: currentPage || this.props.ciqlist.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleTableLoad(1, filters);
  }
  render() {
    const { ciqlist } = this.props;
    this.dataSource.remotes = ciqlist;
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
              <Table columns={this.columns} dataSource={this.dataSource} loading={ciqlist.loading}
              />
            </div>
          </div>
        </div>
        <DelgDispatch show={this.props.delgDispShow} onClose={this.closeDispDock} />
      </QueueAnim>
    );
  }
}
