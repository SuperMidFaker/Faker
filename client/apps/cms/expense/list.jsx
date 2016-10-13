import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Radio, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, openInModal, loadCurrencies } from 'common/reducers/cmsExpense';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import moment from 'moment';
import SearchBar from 'client/components/search-bar';
import TrimSpan from 'client/components/trimSpan';
import ExpSubTable from './expSubTable';
import InputModal from './modals/inputModal';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadExpense({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.cmsExpense.expslist.pageSize,
    currentPage: state.cmsExpense.expslist.currentPage,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    expslist: state.cmsExpense.expslist,
    listFilter: state.cmsExpense.listFilter,
  }),
  { openInModal, loadCurrencies, loadExpense }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'expense' })
export default class ExpenseList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    expslist: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.object.isRequired,
    openInModal: PropTypes.func.isRequired,
    loadCurrencies: PropTypes.func.isRequired,
    loadExpense: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    expandedKeys: [],
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [
    {
      title: this.msg('delgNo'),
      dataIndex: 'delg_no',
      width: 100,
    }, {
      title: this.msg('custName'),
      dataIndex: 'send_name',
      width: 150,
      render: o => <TrimSpan text={o} maxLen={12} />,
    }, {
      title: this.msg('invoiceNo'),
      dataIndex: 'invoice_no',
      width: 100,
    }, {
      title: this.msg('bLNo'),
      dataIndex: 'bl_wb_no',
      width: 100,
    }, {
      title: this.msg('servBill'),
      dataIndex: 'serv_bill',
      width: 100,
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('cushBill'),
      dataIndex: 'cush_bill',
      width: 100,
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('allBill'),
      width: 100,
      dataIndex: 'all_bill',
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('servCost'),
      dataIndex: 'serv_cost',
      width: 100,
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('cushCost'),
      dataIndex: 'cush_cost',
      width: 100,
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('allCost'),
      dataIndex: 'all_cost',
      width: 100,
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('statementEn'),
      width: 100,
      dataIndex: 'status',
    }, {
      title: this.msg('lastActT'),
      dataIndex: 'last_act_time',
      width: 100,
      render: (o) => {
        return `${moment(o).format('MM.DD HH:mm')}`;
      },
    },
  ];
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadExpense(params),
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
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.expslist,
  })
  handleExpListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, expslist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadExpense({
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
    this.handleExpListLoad(1, filter);
  }
  handleSearch = () => {

  }
  handleCushInput = () => {
    this.props.loadCurrencies();
    this.props.openInModal();
  }
  handleMarkStatement = () => {

  }
  handleSubexpsList = (record) => {
    return (
      <ExpSubTable delgNo={record.delg_no} />
    );
  }
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  render() {
    const { expslist, listFilter } = this.props;
    this.dataSource.remotes = expslist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.msg('expense')}</span>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange}>
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="nostatement">{this.msg('nostatement')}</RadioButton>
            <RadioButton value="statement">{this.msg('statement')}</RadioButton>
            <RadioButton value="invoiced">{this.msg('invoiced')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.handleCushInput}>
                {this.msg('incExp')}
              </Button>
              <Button type="default" onClick={this.handleMarkStatement}>
                {this.msg('markState')}
              </Button>
            </div>
            <div className="panel-body table-panel expandable">
              <Table columns={this.columns} dataSource={this.dataSource} loading={expslist.loading}
                expandedRowKeys={this.state.expandedKeys}
                expandedRowRender={expslist.data.length > 0 && this.handleSubexpsList}
                scroll={{ x: 1560 }} onExpandedRowsChange={this.handleExpandedChange}
              />
            </div>
          </div>
        </div>
        <InputModal data={expslist.data} />
      </QueueAnim>
    );
  }
}
