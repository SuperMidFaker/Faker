import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCertTable, acceptCiqCert, loadCMQParams, matchCertQuote } from 'common/reducers/cmsDelegation';
import { loadCertFees, openCertModal } from 'common/reducers/cmsExpense';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from './rowUpdater';
import CertModal from './modals/certModal';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    certlist: state.cmsDelegation.certlist,
    listFilter: state.cmsDelegation.listFilter,
    loadCertFees: state.cmsExpense.loadCertFees,
    openCertModal: state.cmsExpense.openCertModal,
    certMQParams: state.cmsDelegation.certMQParams,
  }),
  { loadCertTable, loadCertFees, openCertModal, acceptCiqCert, loadCMQParams, matchCertQuote }
)
export default class CertTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    certlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadCertTable: PropTypes.func.isRequired,
    loadCertFees: PropTypes.func.isRequired,
    openCertModal: PropTypes.func.isRequired,
    acceptCiqCert: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.certMQParams !== this.props.certMQParams) {
      this.handleMatchQuote(nextProps.certMQParams);
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
    title: this.msg('certbroker'),
    width: 140,
    dataIndex: 'recv_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('opColumn'),
    width: 140,
    render: (record) => {
      if (record.status === 0) {
        return (
          <RowUpdater onHit={this.handleAccept} label={this.msg('accepting')} row={record} />
        );
      } else if (record.status === 1) {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <span>
              <RowUpdater onHit={this.handleCertModalLoad} label={this.msg('certOp')} row={record} />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleUpLoad} label={this.msg('upload')} />
            </span>
          </PrivilegeCover>
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadCertTable(params),
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
    remotes: this.props.certlist,
  })
  handleCertModalLoad = (row) => {
    this.props.loadCertFees(row.id);
    this.props.openCertModal();
  }
  handleUpLoad = () => {
  }
  handleMQParam = (delgNo) => {
    this.props.loadCMQParams(this.props.tenantId, delgNo, 3).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
  }
  handleMatchQuote = (params) => {
    this.props.matchCertQuote(params).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleTableLoad();
        }
      });
  }
  handleAccept = (row) => {
    const { loginId, loginName } = this.props;
    this.props.acceptCiqCert(loginId, loginName, row.delg_no, row.recv_server_type).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleTableLoad();
          this.handleMQParam(row.delg_no);
        }
      }
    );
  }
  handleTableLoad = () => {
    this.props.loadCertTable({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: this.props.certlist.pageSize,
      currentPage: this.props.certlist.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  render() {
    const { certlist } = this.props;
    this.dataSource.remotes = certlist;
    const columns = [...this.columns];
    return (
      <div className="page-body">
        <div className="panel-body table-panel expandable">
          <Table columns={columns} dataSource={this.dataSource} />
        </div>
        <CertModal />
      </div>
    );
  }
}