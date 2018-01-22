import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Popconfirm, Radio, Tag, Tooltip, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import DataTable from 'client/components/DataTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadQuoteTable, updateQuoteStatus, deleteQuote, deleteDraftQuote, openCreateModal, createDraftQuote } from 'common/reducers/cmsQuote';
import { TARIFF_KINDS, TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';

import { formatMsg } from './message.i18n';

import CreateQtModal from './modals/createQtModal';


const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
    loadQuoteTable, updateQuoteStatus, deleteQuote, deleteDraftQuote, openCreateModal, createDraftQuote,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote' })
export default class QuoteList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    quotesList: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.object.isRequired,
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
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
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
    this.context.router.push('/clearance/quote/template');
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
    const msg = formatMsg(this.props.intl);
    const { quotesList, listFilter, tenantId } = this.props;
    this.dataSource.remotes = quotesList;
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [
      {
        title: msg('quoteNo'),
        dataIndex: 'quote_no',
        width: 140,
        render: (o, record) => {
          if (record.valid) {
            return o;
          }
          return <span className="mdc-text-grey">{o}</span>;
        },
      }, {
        title: msg('partnerLabel'),
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
        title: msg('tariffKinds'),
        width: 80,
        render: (text, record) => {
          let tariffKinds = '';
          if (!record.send_tenant_id) {
            tariffKinds = 'salesBase';
          } else if (!record.recv_tenant_id) {
            tariffKinds = 'costBase';
          } else if (record.recv_tenant_id === tenantId) {
            tariffKinds = 'sales';
          } else if (record.send_tenant_id === tenantId) {
            tariffKinds = 'cost';
          }
          const decl = TARIFF_KINDS.filter(ts => ts.value === tariffKinds)[0];
          return decl && decl.text;
        },
      }, {
        title: msg('declareWay'),
        dataIndex: 'decl_way_code',
        render: (o) => {
          const tags = [];
          if (o) {
            o.forEach((d) => {
              const decl = DECL_TYPE.filter(dl => dl.key === d)[0];
              tags.push(<Tag key={d}>{decl && decl.value}</Tag>);
            });
          }
          return tags;
        },
      }, {
        title: msg('transMode'),
        dataIndex: 'trans_mode',
        width: 200,
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
        title: msg('newVersion'),
        dataIndex: 'version',
        width: 80,
      }, {
        title: msg('modifiedBy'),
        dataIndex: 'modify_name',
        width: 80,
      }, {
        title: msg('modifiedTime'),
        dataIndex: 'modify_time',
        width: 100,
        render: o => o && moment(o).format('MM.DD HH:mm'),
      }, {
        title: msg('operation'),
        width: 150,
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
              <span>
                <PrivilegeCover module="clearance" feature="quote" action="edit">
                  <div>
                    <a onClick={() => this.handleQuoteEdit(record)}>{msg('reviseContinue')}</a>
                    <span className="ant-divider" />
                    <Popconfirm title="确定删除？" onConfirm={() => this.handleDeleteDraft(record._id, record.quote_no)}>
                      <a>{msg('delete')}</a>
                    </Popconfirm>
                  </div>
                </PrivilegeCover>
              </span>
            );
          } else if (auth === 'read') {
            return (
              <span>
                <PrivilegeCover module="clearance" feature="quote" action="view">
                  <div>
                    <a onClick={() => this.handleQuoteView(record)}>{msg('view')}</a>
                  </div>
                </PrivilegeCover>
              </span>
            );
          }
        },
      });
    } else {
      columns.push({
        title: msg('status'),
        dataIndex: 'valid',
        width: 80,
        render: (o) => {
          if (!o) {
            return <Tag color="#ccc">{msg('invalid')}</Tag>;
          }
          return <Tag color="#87d068">{msg('valid')}</Tag>;
        },
      }, {
        title: msg('version'),
        dataIndex: 'version',
        width: 80,
      }, {
        title: msg('publisher'),
        dataIndex: 'publisher',
        width: 80,
      }, {
        title: msg('publishDate'),
        dataIndex: 'publish_date',
        width: 100,
        render: o => o && moment(o).format('MM.DD HH:mm'),
      }, {
        title: msg('operation'),
        width: 150,
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
                <span>
                  <PrivilegeCover module="clearance" feature="quote" action="edit">
                    <div>
                      <a onClick={() => this.handleQuoteView(record)}>{msg('view')}</a>
                      <span className="ant-divider" />
                      <a onClick={() => this.handleQuoteEdit(record)}>{msg('revise')}</a>
                      <span className="ant-divider" />
                      <a onClick={() => this.handleChangeStatus(record._id, false)}>{msg('disable')}</a>
                    </div>
                  </PrivilegeCover>
                </span>
              );
            }
            return (
              <span>
                <PrivilegeCover module="clearance" feature="quote" action="edit">
                  <div>
                    <a onClick={() => this.handleChangeStatus(record._id, true)}>{msg('enable')}</a>
                    <span className="ant-divider" />
                    <Popconfirm title="确定删除？" onConfirm={() => this.handleDeleteQuote(record.quote_no)}>
                      <a>{msg('delete')}</a>
                    </Popconfirm>
                    <span className="ant-divider" />
                    <a onClick={() => this.handleQuoteView(record)}>{msg('view')}</a>
                  </div>
                </PrivilegeCover>
              </span>
            );
          } else if (auth === 'read') {
            return (
              <span>
                <PrivilegeCover module="clearance" feature="quote" action="view">
                  <div>
                    <a onClick={() => this.handleQuoteView(record)}>{msg('view')}</a>
                  </div>
                </PrivilegeCover>
              </span>
            );
          }
        },
      });
    }
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('quoteRates')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} >
            <RadioButton value="all">{msg('filterAll')}</RadioButton>
            <RadioButton value="selling">{msg('filterSelling')}</RadioButton>
            <RadioButton value="buying">{msg('filterBuying')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} >
            <RadioButton value="draft">{msg('filterDraft')}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <Button type="primary" icon="plus" onClick={this.handleCreateNew}>
              新建报价
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <div className="toolbar-right">
                <Tooltip title="报价模板设置">
                  <Button icon="setting" onClick={this.handleQuoteTemplate} />
                </Tooltip>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <DataTable
                rowSelection={rowSelection}
                columns={columns}
                dataSource={this.dataSource}
                loading={quotesList.loading}
                scroll={{ x: 1400 }}
                rowKey="_id"
              />
            </div>
          </div>
        </Content>
        <CreateQtModal />
      </QueueAnim>
    );
  }
}
