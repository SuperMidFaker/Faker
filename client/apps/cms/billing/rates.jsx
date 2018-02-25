import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Tag, message } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadQuoteTable, updateQuoteStatus, deleteQuote, deleteDraftQuote, openCreateModal, createDraftQuote } from 'common/reducers/cmsQuote';
import { TRANS_MODE } from 'common/constants';
import { formatMsg } from './message.i18n';
import CreateQtModal from './modals/createRatesModal';

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
    selectedRowKeys: [],
  }
  msg = formatMsg(this.props.intl)
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
  handleRadioChange = (key) => {
    if (key === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: key };
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
      this.context.router.push(`/clearance/quote/edit/${row.quote_no}/${row.version}`);
    } else if (row.next_version) {
      this.context.router.push(`/clearance/quote/edit/${row.quote_no}/${row.next_version}`);
    } else {
      const { loginName, loginId } = this.props;
      this.props.createDraftQuote(row.quote_no, loginName, loginId).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push(`/clearance/quote/edit/${row.quote_no}/${result.data.version}`);
        }
      });
    }
  }
  handleQuoteView = (row) => {
    this.context.router.push(`/clearance/quote/view/${row.quote_no}/${row.version}`);
  }
  handleQuoteTemplate = () => {
    this.context.router.push('/bss/settings/fees');
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
  handleCreateNew = () => {
    this.props.openCreateModal();
  }
  render() {
    const { quotesList, listFilter, tenantId } = this.props;
    this.dataSource.remotes = quotesList;
    const tabList = [
      {
        key: 'customerRates',
        tab: this.msg('customerRates'),
      },
      {
        key: 'vendorRates',
        tab: this.msg('vendorRates'),
      },
    ];
    const toolbarActions = <SearchBox placeholder={this.msg('itemsSearchTip')} onSearch={this.handleSearchItems} />;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
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
        title: this.msg('partnerLabel'),
        width: 280,
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
        title: this.msg('transMode'),
        dataIndex: 'trans_mode',
        render: (o) => {
          const tags = [];
          if (o) {
            o.forEach((d) => {
              const decl = TRANS_MODE.filter(dl => dl.value === d)[0];
              tags.push(<Tag key={d}>{decl && decl.text}</Tag>);
            });
          }
          return tags;
        },
      },
    ];
    if (listFilter.status === 'draft') {
      columns.push({
        title: this.msg('newVersion'),
        dataIndex: 'version',
        width: 80,
      }, {
        title: this.msg('modifiedBy'),
        dataIndex: 'modify_name',
        width: 100,
      }, {
        title: this.msg('modifiedTime'),
        dataIndex: 'modify_time',
        width: 140,
        render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
      }, {
        title: this.msg('operation'),
        width: 100,
        fixed: 'right',
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
                <RowAction icon="edit" tooltip={this.msg('reviseContinue')} onClick={() => this.handleQuoteEdit(record)} />
                <RowAction danger icon="delete" tooltip={this.msg('delete')}confirm="确定删除？" onConfirm={() => this.handleDeleteDraft(record._id, record.quote_no)} />
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
      });
    } else {
      columns.push({
        title: this.msg('status'),
        dataIndex: 'valid',
        width: 80,
        render: (o) => {
          if (!o) {
            return <Tag color="#ccc">{this.msg('invalid')}</Tag>;
          }
          return <Tag color="#87d068">{this.msg('valid')}</Tag>;
        },
      }, {
        title: this.msg('version'),
        dataIndex: 'version',
        width: 80,
      }, {
        title: this.msg('publisher'),
        dataIndex: 'publisher',
        width: 100,
      }, {
        title: this.msg('publishDate'),
        dataIndex: 'publish_date',
        width: 120,
        render: o => o && moment(o).format('YYYY.MM.DD'),
      }, {
        title: this.msg('operation'),
        width: 140,
        fixed: 'right',
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
            if (record.valid) {
              return (
                <PrivilegeCover module="clearance" feature="quote" action="edit">
                  <RowAction icon="eye-o" tooltip={this.msg('view')} onClick={() => this.handleQuoteView(record)} />
                  <RowAction icon="edit" tooltip={this.msg('revise')} onClick={() => this.handleQuoteEdit(record)} />
                  <RowAction icon="pause-circle-o" tooltip={this.msg('disable')} onClick={() => this.handleChangeStatus(record._id, false)} />
                </PrivilegeCover>
              );
            }
            return (
              <PrivilegeCover module="clearance" feature="quote" action="edit">
                <RowAction icon="eye-o" tooltip={this.msg('view')} onClick={() => this.handleQuoteView(record)} />
                <RowAction icon="play-circle-o" tooltip={this.msg('enable')} onClick={() => this.handleChangeStatus(record._id, true)} />
                <RowAction danger icon="delete" tooltip={this.msg('delete')} confirm="确定删除？" onConfirm={() => this.handleDeleteQuote(record.quote_no)} />
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
      });
    }
    return (
      <Layout>
        <PageHeader tabList={tabList} onTabChange={this.handleRadioChange}>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('rates')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateNew}>
              新建报价
            </Button>
            <Button icon="setting" onClick={this.handleQuoteTemplate} />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={this.dataSource}
            loading={quotesList.loading}
            rowKey="_id"
          />
        </Content>
        <CreateQtModal />
      </Layout>
    );
  }
}
