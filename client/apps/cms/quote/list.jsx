import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Radio, Tag, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadQuoteTable, updateQuoteStatus, deleteQuote } from 'common/reducers/cmsQuote';
import { TARIFF_KINDS, TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import NavLink from 'client/components/nav-link';
import moment from 'moment';
const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadQuoteTable({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.cmsExpense.expslist.pageSize,
    currentPage: state.cmsExpense.expslist.current,
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
  { loadQuoteTable, updateQuoteStatus, deleteQuote }
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
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadQuoteTable(params),
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
    remotes: this.props.quotesList,
  })
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleQuoteTableLoad = (currentPage, filter) => {
    const { tenantId, listFilter,
      quotesList: { pageSize, current } } = this.props;
    this.props.loadQuoteTable({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
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
  handleDeleteQuote = (id) => {
    this.props.deleteQuote(
      id,
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
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const { quotesList, listFilter } = this.props;
    this.dataSource.remotes = quotesList;
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    const columns = [
      {
        title: msg('quoteNo'),
        dataIndex: 'quote_no',
        width: 120,
        render: (o, record) => {
          if (record.valid) {
            return o;
          } else {
            return <span className="mdc-text-grey">{o}</span>;
          }
        },
      }, {
        title: msg('partners'),
        dataIndex: 'partner.name',
        width: 240,
      }, {
        title: msg('tariffKinds'),
        dataIndex: 'tariff_kind',
        width: 80,
        render: (o) => {
          const decl = TARIFF_KINDS.filter(ts => ts.value === o)[0];
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
              tags.push(<Tag>{decl && decl.value}</Tag>);
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
              tags.push(<Tag>{decl && decl.text}</Tag>);
            });
          }
          return tags;
        },
      }, {
        title: msg('status'),
        dataIndex: 'valid',
        width: 80,
        render: (o) => {
          if (!o) {
            return <Tag color="#ccc">{msg('invalid')}</Tag>;
          } else {
            return <Tag color="green">{msg('valid')}</Tag>;
          }
        },
      }, {
        title: msg('version'),
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
        render: (o, record) => `${moment(record.modify_time).format('MM.DD HH:mm')}`,
      }, {
        title: msg('operation'),
        width: 100,
        fixed: 'right',
        render: (o, record) => {
          if (record.valid) {
            return (
              <span>
                <PrivilegeCover module="clearance" feature="quote" action="edit">
                  <div>
                    <a onClick={() => this.handleChangeStatus(record._id, false)}>{msg('disable')}</a>
                    <span className="ant-divider" />
                    <NavLink to={`/clearance/billing/quote/edit/${record.quote_no}`}>
                      {msg('modify')}
                    </NavLink>
                  </div>
                </PrivilegeCover>
              </span>
            );
          } else {
            return (
              <span>
                <PrivilegeCover module="clearance" feature="quote" action="edit">
                  <div>
                    <a onClick={() => this.handleChangeStatus(record._id, true)}>{msg('enable')}</a>
                    <span className="ant-divider" />
                    <a onClick={() => this.handleDeleteQuote(record._id)}>{msg('delete')}</a>
                  </div>
                </PrivilegeCover>
              </span>
            );
          }
        },
      },
    ];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{msg('quoteManage')}</span>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange}>
            <RadioButton value="all">{msg('filterAll')}</RadioButton>
            <RadioButton value="selling">{msg('filterSelling')}</RadioButton>
            <RadioButton value="buying">{msg('filterBuying')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={() => this.handleNavigationTo('/clearance/billing/quote/create')}>
                新建报价
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={this.dataSource} scroll={{ x: 1600 }} />
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
