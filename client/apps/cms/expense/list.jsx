import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Icon, Radio, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, openInModal, loadCurrencies, openMarkModal,
  loadAdvanceParties } from 'common/reducers/cmsExpense';
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
import PreviewPanel from '../common/modals/preview-panel';
import DelgAdvanceExpenseModal from './modals/delgAdvanceExpenseModal';
import RowUpdater from './rowUpdater';
import ExpEptModal from './modals/expEptModal';

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
  { openInModal, loadCurrencies, loadExpense,
    openMarkModal, showPreviewer, loadAdvanceParties }
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
    expEptVisible: false,
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
      width: 120,
      fixed: 'left',
      render: (o) => {
        return (
          <a onClick={() => this.handlePreview(o)}>
            {o}
          </a>);
      },
    }, {
      title: this.msg('custName'),
      dataIndex: 'send_name',
      render: o => <TrimSpan text={o} maxLen={14} />,
    }, {
      title: this.msg('invoiceNo'),
      dataIndex: 'invoice_no',
      width: 180,
    }, {
      title: this.msg('bLNo'),
      dataIndex: 'bl_wb_no',
      width: 220,
    }, {
      title: this.msg('revenue'),
      children: [
        {
          title: this.msg('allBill'),
          width: 80,
          dataIndex: 'all_bill',
          key: 'all_bill',
          render: (o) => {
            if (!isNaN(o)) {
              return (<span className="mdc-text-info"><b>{o.toFixed(2)}</b></span>);
            }
          },
        }, {
          title: this.msg('serviceRevenue'),
          dataIndex: 'serv_bill',
          key: 'serv_bill',
          width: 80,
          render: (o) => {
            if (!isNaN(o)) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('cushBill'),
          dataIndex: 'cush_bill',
          key: 'cush_bill',
          width: 80,
          render: (o, row) => {
            if (!isNaN(o)) {
              const labelElem = (
                <span>{o.toFixed(2)}<Icon type="edit" /></span>
              );
              return (
                <RowUpdater onHit={this.handleAddAdvanceIncome} field="cush_bill"
                  row={{ delg_no: row.delg_no }} label={labelElem}
                />);
            }
          },
        },
      ],
    }, {
      title: this.msg('cost'),
      children: [
        {
          title: this.msg('allCost'),
          dataIndex: 'all_cost',
          width: 80,
          render: (o) => {
            if (!isNaN(o)) {
              return (<span className="mdc-text-warning"><b>{o.toFixed(2)}</b></span>);
            }
          },
        }, {
          title: this.msg('servCost'),
          dataIndex: 'serv_cost',
          key: 'serv_cost',
          width: 80,
          render: (o) => {
            if (!isNaN(o)) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('cushCost'),
          dataIndex: 'cush_cost',
          key: 'cush_cost',
          width: 80,
          render: (o, row) => {
            if (!isNaN(o)) {
              const labelElem = (
                <span>{o.toFixed(2)}<Icon type="edit" /></span>
              );
              return (
                <RowUpdater onHit={this.handleAddAdvancePayment} field="cush_cost"
                  row={{ delg_no: row.delg_no }} label={labelElem}
                />);
            }
          },
        /*
          title: this.msg('进出口代理'),
          dataIndex: 'agency_cost',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('报关'),
          dataIndex: 'cust_cost',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('报检'),
          dataIndex: 'ciq_cost',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('鉴定办证'),
          dataIndex: 'cert_cost',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: this.msg('其他'),
          dataIndex: 'misc_cost',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        */
        },
      ],
    }, {
      title: this.msg('statementEn'),
      width: 80,
      dataIndex: 'status',
      render: (o) => {
        return EXP_STATUS.filter(st => st.value === o)[0].text;
      },
    }, {
      title: this.msg('lastActT'),
      dataIndex: 'last_act_time',
      width: 120,
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

  handlePreview = (delgNo) => {
    this.props.showPreviewer(this.props.tenantId, delgNo, 'expenses');
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
  handleAddAdvanceIncome = (row) => {
    this.props.loadAdvanceParties(row.delg_no, this.props.tenantId, 'recv');
  }
  handleAddAdvancePayment = (row) => {
    this.props.loadAdvanceParties(row.delg_no, this.props.tenantId, 'send');
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

  }
  handleExpExport = () => {
    this.setState({
      expEptVisible: true,
    });
  }
  toggleEptModal = () => {
    this.setState({ expEptVisible: !this.state.expEptVisible });
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
          <span>{this.msg('expense')}</span>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange}>
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="nostatement">{this.msg('nostatement')}</RadioButton>
            <RadioButton value="statement">{this.msg('statement')}</RadioButton>
            <RadioButton value="invoiced">{this.msg('invoiced')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.handleCushInput}>
                {this.msg('incExp')}
              </Button>
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.handleExpExport}>
                {this.msg('eptExp')}
              </Button>
              <Button type="default" onClick={this.handleMarkStatement}>
                {this.msg('markState')}
              </Button>
            </div>
            <div className="panel-body table-panel group-header">
              <Table columns={this.columns} dataSource={this.dataSource} loading={expslist.loading}
                bordered scroll={{ x: 1400 }} rowKey="delg_no"
              />
            </div>
          </div>
        </div>
        <InputModal data={unstateData} />
        <MarkModal data={unstateData} />
        <PreviewPanel />
        <DelgAdvanceExpenseModal />
        <ExpEptModal visible={this.state.expEptVisible} toggle={this.toggleEptModal} />
      </QueueAnim>
    );
  }
}
