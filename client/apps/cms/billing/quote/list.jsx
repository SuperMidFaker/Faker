import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { TENANT_ASPECT } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Layout, message } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import ToolbarAction from 'client/components/ToolbarAction';
import UserAvatar from 'client/components/UserAvatar';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { toggleEventsModal } from 'common/reducers/cmsPrefEvents';
import { toggleQuoteCreateModal, loadQuoteTable, deleteQuotes } from 'common/reducers/cmsQuote';
import { formatMsg, formatGlobalMsg } from '../message.i18n';
import CreateQuoteModal from '../modals/createQuoteModal';

const { Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadQuoteTable({
    filter: JSON.stringify({ ...state.cmsQuote.listFilter, searchText: '' }),
    pageSize: state.cmsQuote.quotesList.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    aspect: state.account.aspect,
    quotesList: state.cmsQuote.quotesList,
    listFilter: state.cmsQuote.listFilter,
  }),
  {
    toggleQuoteCreateModal,
    loadQuoteTable,
    deleteQuotes,
    toggleEventsModal,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote' })
export default class RatesList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string.isRequired }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    extraVisible: false,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadQuoteTable(params),
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
        current: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.quotesList,
  })
  handleQuoteTableLoad = (currentPage, filter) => {
    const {
      listFilter,
      quotesList: { pageSize, current },
    } = this.props;
    this.props.loadQuoteTable({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleTabChange = (key) => {
    if (key === this.props.listFilter.viewStatus) {
      return;
    }
    const filter = { ...this.props.listFilter, viewStatus: key };
    this.handleQuoteTableLoad(1, filter);
  }
  handleQuoteEdit = (row) => {
    this.context.router.push(`/clearance/billing/quote/${row.quote_no}`);
  }
  handleBatchDelete = () => {
    const quoteNos = this.state.selectedRowKeys;
    this.props.deleteQuotes(quoteNos).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDeselectRows();
        this.handleQuoteTableLoad();
      }
    });
  }
  handleCreate = () => {
    this.props.toggleQuoteCreateModal(true);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, searchText: value };
    this.handleQuoteTableLoad(1, filter);
  }
  handleClick = (key) => {
    this.props.toggleEventsModal(true, key);
  }
  toggleExtra = () => {
    this.setState({ extraVisible: !this.state.extraVisible });
  }
  render() {
    const { quotesList, tenantId, aspect } = this.props;
    const columns = [
      {
        title: this.msg('quoteNo'),
        dataIndex: 'quote_no',
        width: 180,
      }, {
        title: this.msg('quoteName'),
        dataIndex: 'quote_name',
        width: 250,
      }, {
        title: this.props.listFilter.viewStatus === 'clientQuote' ? this.msg('buyerName') : this.msg('sellerName'),
        width: 250,
        render: (text, record) => {
          let partnerName = '';
          if (record.buyer_tenant_id === tenantId) {
            partnerName = record.seller_name;
          } else if (record.seller_tenant_id === tenantId) {
            partnerName = record.buyer_name;
          }
          return partnerName;
        },
      }, {
        title: this.gmsg('lastUpdatedDate'),
        dataIndex: 'last_updated_date',
        key: 'last_updated_date',
        width: 140,
        render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
      }, {
        title: this.gmsg('lastUpdatedBy'),
        dataIndex: 'last_updated_by',
        key: 'last_updated_by',
        width: 100,
        render: lid => lid && <UserAvatar size="small" loginId={lid} showName />,
      }, {
        title: this.gmsg('createdDate'),
        dataIndex: 'created_date',
        width: 120,
        render: o => o && moment(o).format('YYYY.MM.DD'),
      }, {
        dataIndex: 'SPACER_COL',
      }, {
        title: this.gmsg('actions'),
        dataIndex: 'OPS_COL',
        fixed: 'right',
        className: 'table-col-ops',
        width: 60,
        render: (o, record) => {
          if (record.tenant_id === tenantId) {
            return (
              <RowAction onClick={this.handleQuoteEdit} icon="edit" row={record} />
            );
          }
          return (
            <RowAction onClick={this.handleQuoteEdit} icon="eye-o" row={record} />
          );
        },
      },
    ];
    this.dataSource.remotes = quotesList;
    const menus = [];
    if (aspect === TENANT_ASPECT.LSP) {
      menus.push({
        key: 'clientQuote',
        menu: this.msg('clientQuote'),
      });
    }
    menus.push({
      key: 'providerQuote',
      menu: this.msg('providerQuote'),
    });
    const toolbarActions = <SearchBox placeholder={this.gmsg('searchTip')} onSearch={this.handleSearch} />;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const bulkActions = (<span>
      <ToolbarAction danger icon="delete" label={this.gmsg('delete')} confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleBatchDelete} />
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('quote')} menus={menus} currentKey={this.props.listFilter.viewStatus} onTabChange={this.handleTabChange}>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreate}>
              {this.msg('createQuote')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            bulkActions={bulkActions}
            columns={columns}
            dataSource={this.dataSource}
            loading={quotesList.loading}
            rowKey="quote_no"
          />
        </Content>
        <CreateQuoteModal />
      </Layout>
    );
  }
}
