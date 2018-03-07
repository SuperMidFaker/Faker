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
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadQuoteTable, updateQuoteStatus, deleteQuote, deleteDraftQuote, openCreateModal, createDraftQuote } from 'common/reducers/cmsQuote';
import { formatMsg, formatGlobalMsg } from '../message.i18n';
import CreateQuoteModal from '../modals/createQuoteModal';

const { Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadQuoteTable({
    tenantId: state.account.tenantId,
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
    loginName: state.account.username,
    quotesList: state.cmsQuote.quotesList,
    listFilter: state.cmsQuote.listFilter,
  }),
  {
    loadQuoteTable,
    updateQuoteStatus,
    deleteQuote,
    deleteDraftQuote,
    openCreateModal,
    createDraftQuote,
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
        ietype: this.props.ietype,
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.quotesList,
  })
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleQuoteTableLoad = (currentPage, filter) => {
    const {
      tenantId, listFilter,
      quotesList: { pageSize, current },
    } = this.props;
    this.props.loadQuoteTable({
      tenantId,
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
  handleChangeStatus = (id, status) => {
    this.props.updateQuoteStatus(
      id,
      status,
      this.props.tenantId,
      this.props.loginName,
      this.props.loginId,
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleQuoteTableLoad();
      }
    });
  }
  handleQuoteEdit = (row) => {
    if (row.status === 'draft') {
      this.context.router.push(`/clearance/billing/quote/${row.quote_no}/${row.version}`);
    } else if (row.next_version) {
      this.context.router.push(`/clearance/billing/quote/${row.quote_no}${row.version}`);
    } else {
      const { loginName, loginId } = this.props;
      this.props.createDraftQuote(row.quote_no, loginName, loginId).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push(`/clearance/billing/quote/${row.quote_no}${row.version}`);
        }
      });
    }
  }
  handleQuoteView = (row) => {
    this.context.router.push(`/clearance/billing/quote/${row.quote_no}/${row.version}`);
  }
  handleDeleteQuote = (quoteNo) => {
    this.props.deleteQuote(quoteNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleQuoteTableLoad();
      }
    });
  }
  handleDeleteDraft = (quoteId, quoteNo) => {
    this.props.deleteDraftQuote(quoteId, quoteNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleQuoteTableLoad();
      }
    });
  }
  handleCreate = () => {
    this.props.openCreateModal();
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
        render: (o, record) => {
          if (record.valid) {
            return o;
          }
          return <span className="mdc-text-grey">{o}</span>;
        },
      }, {
        title: this.msg('quoteName'),
        dataIndex: 'quote_name',
        width: 200,
      }, {
        title: this.state.currentTab === 'clientQuote' ? this.msg('clientName') : this.msg('providerName'),
        width: 200,
        render: (text, record) => {
          let partnerName = '';
          if (record.recv_tenant_id === tenantId) {
            partnerName = record.send_tenant_name;
          } else if (record.send_tenant_id === tenantId) {
            partnerName = record.recv_tenant_name;
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
        render: (o, record) => {
          let auth = '';
          if (record.create_tenant_id === tenantId) {
            auth = 'modify';
          } else if (record.partner_permission === 2) {
            auth = 'modify';
          } else if (record.partner_permission === 1) {
            auth = 'read';
          }
          if (auth === 'modify') {
            return (
              <PrivilegeCover module="clearance" feature="quote" action="edit">
                <RowAction icon="edit" tooltip={this.msg('edit')} onClick={() => this.handleQuoteEdit(record)} />
              </PrivilegeCover>
            );
          } else if (auth === 'read') {
            return (
              <PrivilegeCover module="clearance" feature="quote" action="view">
                <RowAction icon="eye-o" label={this.msg('view')} onClick={() => this.handleQuoteView(record)} />
              </PrivilegeCover>
            );
          }
          return null;
        },
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
            handleDeselectRows={this.handleDeselectRows}
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
