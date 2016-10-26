import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { message} from 'antd';
import Table from 'client/components/remoteAntTable';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCertTable } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from './rowUpdater';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    certlist: state.cmsDelegation.certlist,
    listFilter: state.cmsDelegation.listFilter,
  }),
  { loadCertTable }
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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
    dataIndex: 'id',
    render: (o) => {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
          <span>
            <RowUpdater onHit={this.handleTableLoad} label={this.msg('certOp')} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleTableLoad} label={this.msg('upload')} />
          </span>
        </PrivilegeCover>
      );
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
      </div>
    );
  }
}
