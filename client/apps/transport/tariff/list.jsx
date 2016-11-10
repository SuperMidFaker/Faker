import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import { ConfirmDel } from './forms/commodity';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadTable, delTariff, updateTariffStatus } from 'common/reducers/transportTariff';
import { TARIFF_KINDS } from 'common/constants';
import SearchBar from 'client/components/search-bar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';

const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch }) {
  return dispatch(loadTable({
    tenantId: state.account.tenantId,
    filters: JSON.stringify(state.transportTariff.filters),
    pageSize: state.transportTariff.tarifflist.pageSize,
    currentPage: state.transportTariff.tarifflist.current,
    sortField: state.transportTariff.sortField,
    sortOrder: state.transportTariff.sortOrder,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tarifflist: state.transportTariff.tarifflist,
    filters: state.transportTariff.filters,
    loading: state.transportTariff.loading,
  }),
  { loadTable, delTariff, updateTariffStatus })
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'tariff' })
export default class TariffList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    tarifflist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired,
    delTariff: PropTypes.func.isRequired,
    updateTariffStatus: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        filters: this.props.filters,
      };
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.tarifflist,
  })

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('tariffName'),
    dataIndex: 'name',
    width: 160,
    render: (o, record) => {
      if (record.status === 0) {
        return <span className="mdc-text-grey">{o}</span>;
      } else {
        return o;
      }
    },
  }, {
    title: this.msg('partnerName'),
    width: 180,
    render: (o, record) => {
      if (record.sendTenantId === this.props.tenantId) {
        return record.recvName || '';
      } else if (record.recvTenantId === this.props.tenantId) {
        return record.sendName || '';
      } else {
        return '';
      }
    },
  }, {
    title: this.msg('tariffType'),
    width: 80,
    render: (o, record) => {
      let kindIdx = null;
      if (record.sendTenantId === this.props.tenantId) {
        if (record.recvName) {
          kindIdx = 1;
        } else {
          kindIdx = 3;
        }
      } else if (record.recvTenantId === this.props.tenantId) {
        if (record.sendName) {
          kindIdx = 0;
        } else {
          kindIdx = 2;
        }
      }
      if (kindIdx !== null) {
        return TARIFF_KINDS[kindIdx].text;
      } else {
        return '';
      }
    },
  }, {
    title: this.msg('effectiveDate'),
    dataIndex: 'effectiveDate',
    width: 100,
    render: (o, record) => moment(record.effectiveDate).format('YYYY.MM.DD'),
  }, {
    title: this.msg('expiryDate'),
    dataIndex: 'expiryDate',
    width: 100,
    render: (o, record) => {
      const tommorrow = moment().add(1, 'days').toDate().setHours(0, 0, 0, 0);
      if (new Date(record.expiryDate).getTime() < tommorrow) {
        return (
          <span className="mdc-text-red">{moment(record.expiryDate).format('YYYY.MM.DD')}</span>
        );
      } else {
        return moment(record.expiryDate).format('YYYY.MM.DD');
      }
    },
  }, {
    title: this.msg('tariffStatus'),
    dataIndex: 'status',
    width: 80,
    render: (o, record) => {
      const tommorrow = moment().add(1, 'days').toDate().setHours(0, 0, 0, 0);
      return new Date(record.expiryDate).getTime() < tommorrow ? '无效' : '有效';
    },
  }, {
    title: this.msg('tariffRevisions'),
    dataIndex: 'revisions',
    width: 80,
  }, {
    title: this.msg('revisionDate'),
    dataIndex: 'revisionDate',
    width: 120,
    render: (o, record) => record.revisionDate &&
      moment(record.revisionDate).format('YYYY.MM.DD'),
  }, {
    title: this.msg('tariffReviser'),
    dataIndex: 'reviser',
    width: 100,
  }, {
    title: formatContainerMsg(this.props.intl, 'opColumn'),
    width: 100,
    render: (o, record) => {
      if (record.status === 0) {
        return (
          <span>
            <PrivilegeCover module="transport" feature="tariff" action="edit">
              <a onClick={() => this.handleChangeStatus(record._id, 1)}>{this.msg('enable')}</a>
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="transport" feature="tariff" action="delete">
              <ConfirmDel row={record} text="删除" onConfirm={this.handleDel} />
            </PrivilegeCover>
          </span>
        );
      } else if (record.status === 1) {
        return (
          <span>
            <PrivilegeCover module="transport" feature="tariff" action="edit">
              <div>
                <a onClick={() => this.handleChangeStatus(record._id, 0)}>{this.msg('disable')}</a>
                <span className="ant-divider" />
                <NavLink to={`/transport/tariff/edit/${record._id}`}>
                  {this.msg('revise')}
                </NavLink>
              </div>
            </PrivilegeCover>
          </span>
        );
      }
      return '';
    },
  }]
  handleTableLoad = (filters, current, sortField, sortOrder) => {
    this.props.loadTable({
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.tarifflist.pageSize,
      currentPage: current || this.props.tarifflist.current,
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleDel = (row) => {
    this.props.delTariff(row._id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleChangeStatus = (tariffId, status) => {
    this.props.updateTariffStatus(tariffId, status).then(() => {
      this.handleTableLoad();
    });
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.filters, name: searchVal };
    this.handleTableLoad(filters, 1);
  }
  handleShipmtDraftDel(shipmtNo, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.delDraft(shipmtNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleTableLoad(undefined, 1);
      }
    });
  }
  render() {
    const { tarifflist, loading } = this.props;
    this.dataSource.remotes = tarifflist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('transportTariff')}</span>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <PrivilegeCover module="transport" feature="tariff" action="create">
                <NavLink to="/transport/tariff/new">
                  <Button type="primary" icon="plus-circle-o">
                    {this.msg('tariffCreate')}
                  </Button>
                </NavLink>
              </PrivilegeCover>
            </div>
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
                dataSource={this.dataSource} onRowClick={this.handleShipmtPreview}
              />
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
