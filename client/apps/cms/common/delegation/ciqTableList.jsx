import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { message, Icon } from 'antd';
import Table from 'client/components/remoteAntTable';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCiqTable, openCiqModal } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import { CMS_CIQ_STATUS } from 'common/constants';
import RowUpdater from './rowUpdater';
import CiqnoFillModal from './modals/ciqNoFill';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    ciqlist: state.cmsDelegation.ciqlist,
    listFilter: state.cmsDelegation.listFilter,
  }),
  { loadCiqTable, openCiqModal }
)
export default class CiqTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    ciqlist: PropTypes.object.isRequired,
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
    title: this.msg('inspbroker'),
    width: 140,
    dataIndex: 'recv_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('customsId'),
    width: 140,
    dataIndex: 'customs_no',
    render: (o, record) => {
      if (o) {
        return o;
      } else {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <RowUpdater onHit={this.handleCiqNoFill} row={record}
              label={<Icon type="edit" />}
            />
          </PrivilegeCover>
        );
      }
    },
  }, {
    title: this.msg('status'),
    width: 130,
    dataIndex: 'ciq_status',
    render(o) {
      return CMS_CIQ_STATUS[o];
    },
  }, {
    title: this.msg('ciqTime'),
    width: 150,
    dataIndex: 'ciq_time',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
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
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.ciqlist,
  })
  handleCiqNoFill = (row) => {
    this.props.openCiqModal({
      delgNo: row.delg_no,
    });
  }
  handleTableLoad = () => {
    this.props.loadCiqTable({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: this.props.ciqlist.pageSize,
      currentPage: this.props.ciqlist.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  render() {
    const { ciqlist } = this.props;
    this.dataSource.remotes = ciqlist;
    const columns = [...this.columns];
    return (
      <div className="page-body">
        <div className="panel-body table-panel expandable">
          <Table columns={columns} dataSource={this.dataSource} />
        </div>
        <CiqnoFillModal reload={this.handleTableLoad} />
      </div>
    );
  }
}
