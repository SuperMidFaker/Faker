import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, message } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import UserAvatar from 'client/components/UserAvatar';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { toggleQtCreateModal, loadQuoteTable, deleteQuote } from 'common/reducers/cmsQuote';
import { formatMsg, formatGlobalMsg } from '../message.i18n';
import CreateQuoteModal from '../modals/createQuoteModal';

const { Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadQuoteTable({
    filter: JSON.stringify(state.cmsQuote.listFilter),
    pageSize: state.cmsQuote.quotesList.pageSize,
    current: state.cmsQuote.quotesList.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    quotesList: state.cmsQuote.quotesList,
    listFilter: state.cmsQuote.listFilter,
  }),
  {
    toggleQtCreateModal,
    loadQuoteTable,
    deleteQuote,
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
    currentTab: 'clientQuote',
    selectedRowKeys: [],
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
    this.setState({ currentTab: key });
    if (key === this.props.listFilter.viewStatus) {
      return;
    }
    const filter = { ...this.props.listFilter, viewStatus: key };
    this.handleQuoteTableLoad(1, filter);
  }
  handleQuoteEdit = (row) => {
    this.context.router.push(`/clearance/billing/quote/${row.quote_no}`);
  }
  handleDeleteQuote = (row) => {
    this.props.deleteQuote(row.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleQuoteTableLoad();
      }
    });
  }
  handleCreate = () => {
    this.props.toggleQtCreateModal(true);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { quotesList, tenantId } = this.props;
    const columns = [
      {
        title: this.msg('quoteNo'),
        dataIndex: 'quote_no',
        width: 140,
      }, {
        title: this.msg('quoteName'),
        dataIndex: 'quote_name',
        width: 200,
      }, {
        title: this.state.currentTab === 'clientQuote' ? this.msg('clientName') : this.msg('providerName'),
        width: 200,
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
        title: this.gmsg('actions'),
        dataIndex: 'OPS_COL',
        align: 'right',
        fixed: 'right',
        width: 60,
        render: (o, record) =>
          (<span>
            <RowAction onClick={this.handleQuoteEdit} icon="edit" row={record} />
            <RowAction danger confirm="确定删除?" onConfirm={this.handleDeleteQuote} icon="delete" row={record} />
          </span>),
      },
    ];
    this.dataSource.remotes = quotesList;
    const tabList = [
      {
        key: 'clientQuote',
        tab: this.msg('clientQuote'),
      },
      {
        key: 'providerQuote',
        tab: this.msg('providerQuote'),
      },
    ];
    const toolbarActions = <SearchBox placeholder={this.msg('itemsSearchTip')} onSearch={this.handleSearchItems} />;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const bulkActions = (<span>
      <Button icon="delete" onClick={this.handleBatchDelete}>{this.gmsg('delete')}</Button>
    </span>);
    return (
      <Layout>
        <PageHeader tabList={tabList} onTabChange={this.handleTabChange}>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('quote')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreate}>
              新建报价
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
            rowKey="_id"
          />
        </Content>
        <CreateQuoteModal />
      </Layout>
    );
  }
}
