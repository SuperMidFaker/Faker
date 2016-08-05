import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadTable } from 'common/reducers/transportTariff';
import { setNavTitle } from 'common/reducers/navbar';
import { TARIFF_KINDS } from 'common/constants';
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
  { loadTable })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'transportTariff'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class TariffList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    tarifflist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(null, params),
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

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('tariffName'),
    dataIndex: 'name',
    width: 170,
  }, {
    title: this.msg('partnerName'),
    width: 130,
    dataIndex: 'partnerName',
  }, {
    title: this.msg('tariffType'),
    dataIndex: 'kind',
    width: 80,
    render: (o) => TARIFF_KINDS[o].text,
  }, {
    title: this.msg('effectiveDate'),
    dataIndex: 'effectiveDate',
    width: 120,
    render: (o, record) => moment(record.effectiveDate).format('YYYY.MM.DD'),
  }, {
    title: this.msg('expiryDate'),
    dataIndex: 'expiryDate',
    width: 120,
    render: (o, record) => moment(record.expiryDate).format('YYYY.MM.DD'),
  }, {
    title: this.msg('tariffStatus'),
    dataIndex: 'status',
    width: 80,
    render: () => '有效',
  }, {
    title: this.msg('tariffRevisions'),
    dataIndex: 'revisions',
    width: 80,
  }, {
    title: this.msg('revisionDate'),
    dataIndex: 'revisionDate',
    width: 120,
    render: (o, record) => moment(record.revisionDate).format('YYYY.MM.DD'),
  }, {
    title: this.msg('tariffReviser'),
    dataIndex: 'reviser',
    width: 110,
  }, {
    title: formatContainerMsg(this.props.intl, 'opColumn'),
    width: 130,
    render: (o, record) => {
      return (
        <span>
          <NavLink to={`/transport/tariff/edit/${record._id}`}>
          {this.msg('revise')}
          </NavLink>
          <span className="ant-divider" />
        </span>
      );
    },
  }]
  handleTableLoad = (filters, current, sortField, sortOrder) => {
    this.props.loadTable(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.tarifflist.pageSize,
      currentPage: current || this.props.tarifflist.current,
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.filters, name: searchVal };
    this.handleTableLoad(filters, 1);
  }
  handleShipmtDraftDel(shipmtNo, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.delDraft(shipmtNo).then(result => {
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
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <NavLink to="/transport/tariff/new">
              <Button type="primary" size="large" icon="plus-circle-o">
                {this.msg('tariffCreate')}
              </Button>
            </NavLink>
          </div>
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="page-body">
          <div className="panel-body table-panel">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} onRowClick={this.handleShipmtPreview}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button shape="circle-outline" icon="cross" onClick={this.handleSelectionClear} className="pull-right" />
          </div>
        </div>
      </div>
    );
  }
}
