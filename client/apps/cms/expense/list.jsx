import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Radio, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, openInModal, loadCurrencies, openMarkModal } from 'common/reducers/cmsExpense';
import { showPreviewer } from 'common/reducers/cmsDelegation';
import { EXP_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import moment from 'moment';
import SearchBar from 'client/components/search-bar';
import TrimSpan from 'client/components/trimSpan';
import ExpSubTable from './expSubTable';
import InputModal from './modals/inputModal';
import MarkModal from './modals/markModal';
import PreviewPanel from './modals/preview-panel';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadExpense({
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
    expslist: state.cmsExpense.expslist,
    listFilter: state.cmsExpense.listFilter,
    saved: state.cmsExpense.saved,
  }),
  { openInModal, loadCurrencies, loadExpense, openMarkModal, showPreviewer }
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
    openMarkModal: PropTypes.func.isRequired,
    loadCurrencies: PropTypes.func.isRequired,
    loadExpense: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    expandedKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleExpListLoad();
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [
    {
      title: this.msg('delgNo'),
      dataIndex: 'delg_no',
      width: 100,
      render: (o, record) => {
        return (
          <a onClick={() => this.handlePreview(o, record)}>
            {o}
          </a>);
      },
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
      title: '收款',
      children: [
        {
          title: this.msg('allBill'),
          width: 100,
          dataIndex: 'all_bill',
          key: 'all_bill',
          render: (o) => {
            if (o) {
              return (<span style={{ color: '#FF9933' }}>{o.toFixed(2)}</span>);
            }
          },
        }, {
          title: this.msg('servBill'),
          dataIndex: 'serv_bill',
          key: 'serv_bill',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('cushBill'),
          dataIndex: 'cush_bill',
          key: 'cush_bill',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        },
      ],
    }, {
      title: '付款',
      children: [
        {
          title: this.msg('allCost'),
          dataIndex: 'all_cost',
          width: 100,
          render: (o) => {
            if (o) {
              return (<span style={{ color: '#FF9933' }}>{o.toFixed(2)}</span>);
            }
          },
        }, {
          title: this.msg('进出口代理'),
          dataIndex: 'agency',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('报关'),
          dataIndex: 'cust',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('报检'),
          dataIndex: 'ciq',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('鉴定办证'),
          dataIndex: 'cert',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('其他'),
          dataIndex: 'misc',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        },
      ],
    }, {
      title: this.msg('statementEn'),
      width: 100,
      dataIndex: 'status',
      render: (o) => {
        return EXP_STATUS.filter(st => st.value === o)[0].text;
      },
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

  handlePreview = (o, record) => {
    this.props.showPreviewer({
      delgNo: o,
      tenantId: this.props.tenantId,
    }, record.status);
  }
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
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleExpListLoad(1, filters);
  }

  mergeFilters(curFilters, value) {
    const newFilters = {};
    Object.keys(curFilters).forEach((key) => {
      if (key !== 'filterNo') {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters.filterNo = value;
    }
    return newFilters;
  }
  handleCushInput = () => {
    this.props.loadCurrencies();
    this.props.openInModal();
  }
  handleMarkStatement = () => {
    this.props.openMarkModal();
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
    const unstateData = expslist.data.filter(dt => dt.status === 0);
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
                bordered scroll={{ x: 1560 }}
              />
            </div>
          </div>
        </div>
        <InputModal data={unstateData} />
        <MarkModal data={unstateData} />
        <PreviewPanel ietype="import" />
      </QueueAnim>
    );
  }
}
