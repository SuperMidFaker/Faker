import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Icon, Radio, message, DatePicker } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, openInModal, loadCurrencies,
  loadAdvanceParties, loadPartnersForFilter } from 'common/reducers/cmsExpense';
import { showPreviewer } from 'common/reducers/cmsDelegation';
import { EXP_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import moment from 'moment';
import SearchBar from 'client/components/search-bar';
import TrimSpan from 'client/components/trimSpan';
import ExpSubTable from './expSubTable';
import InputModal from './modals/inputModal';
import DelegationInfoHubPanel from '../common/modals/DelegationInfoHubPanel';
import DelgAdvanceExpenseModal from './modals/delgAdvanceExpenseModal';
import RowUpdater from './rowUpdater';
import ExpEptModal from './modals/expEptModal';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const RangePicker = DatePicker.RangePicker;
const endDay = new Date();
const firstDay = new Date();
firstDay.setDate(1);

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadExpense({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.cmsExpense.expslist.pageSize,
    currentPage: state.cmsExpense.expslist.current,
  })));
  promises.push(dispatch(loadPartnersForFilter(
    state.account.tenantId
  )));
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    expslist: state.cmsExpense.expslist,
    listFilter: state.cmsExpense.listFilter,
    saved: state.cmsExpense.saved,
    partners: state.cmsExpense.partners,
  }),
  { openInModal, loadCurrencies, loadExpense,
    showPreviewer, loadAdvanceParties }
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
    saved: PropTypes.bool.isRequired,
    partners: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    expandedKeys: [],
    expEptVisible: false,
    custFilter: [],
    supeFilter: [],
    acptDate: { en: false, firstDay, endDay },
    cleanDate: { en: false, firstDay, endDay },
    filterAcptVisible: false,
    filterCleanVisible: false,
    sortedInfo: { field: '', order: '' },
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleExpListLoad();
    }
    if (nextProps.partners !== this.props.partners) {
      const partners = nextProps.partners;
      const custFilter = [];
      const supeFilter = [];
      for (let i = 0; i < partners.customer.length; i++) {
        const customer = partners.customer[i];
        const obj = {
          text: customer.name,
          value: customer.name,
        };
        custFilter.push(obj);
      }
      for (let i = 0; i < partners.supplier.length; i++) {
        const supplier = partners.supplier[i];
        const obj = {
          text: `${supplier.partner_code} | ${supplier.name}`,
          value: supplier.partner_id,
        };
        supeFilter.push(obj);
      }
      // supeFilter.push({ text: `${this.props.tenantId} | ${this.props.tenantName}`, value: null });
      this.setState({ custFilter, supeFilter });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
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
    getParams: (pagination, filters, sorter) => {
      this.setState({
        sortedInfo: sorter,
      });
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const { acptDate, cleanDate } = this.state;
      const filter = { ...this.props.listFilter, filters,
        sortField: sorter.field, sortOrder: sorter.order, acptDate, cleanDate };
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
  handleSubexpsList = record => (
    <ExpSubTable delgNo={record.delg_no} />
    )
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  handleAcptDateChange = (dates) => {
    const acptDate = {
      en: true,
      firstDay: dates[0].toDate(),
      endDay: dates[1].toDate(),
    };
    this.setState({ acptDate });
    const { sortedInfo, cleanDate } = this.state;
    const filter = { ...this.props.listFilter,
      sortField: sortedInfo.field, sortOrder: sortedInfo.order, acptDate, cleanDate };
    this.handleExpListLoad(1, filter);
  }
  handleCleanDateChange = (dates) => {
    const cleanDate = {
      en: true,
      firstDay: dates[0].toDate(),
      endDay: dates[1].toDate(),
    };
    this.setState({ cleanDate });
    const { sortedInfo, acptDate } = this.state;
    const filter = { ...this.props.listFilter,
      sortField: sortedInfo.field, sortOrder: sortedInfo.order, acptDate, cleanDate };
    this.handleExpListLoad(1, filter);
  }
  render() {
    const { expslist, listFilter } = this.props;
    const { acptDate, cleanDate } = this.state;
    const { sortedInfo } = this.state;
    const sorted = sortedInfo || {};
    const columns = [
      {
        title: this.msg('delgNo'),
        dataIndex: 'delg_no',
        width: 120,
        fixed: 'left',
        render: o => (
          <a onClick={() => this.handlePreview(o)}>
            {o}
          </a>),
      }, {
        title: this.msg('custName'),
        dataIndex: 'send_name',
        filters: this.state.custFilter,
        render: o => <TrimSpan text={o} maxLen={14} />,
      }, {
        title: this.msg('agentName'),
        dataIndex: 'agent_name',
        filters: this.state.supeFilter,
        render: o => <TrimSpan text={o} maxLen={14} />,
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
          },
        ],
      }, {
        title: this.msg('profit'),
        width: 80,
        render: (record) => {
          const bill = isNaN(record.all_bill) ? 0 : record.all_bill;
          const cost = isNaN(record.all_cost) ? 0 : record.all_cost;
          if (bill < cost) {
            return (<span style={{ color: 'red' }}>{-(cost - bill).toFixed(2)}</span>);
          } else if (bill > cost) {
            return (<span style={{ color: 'green' }}>{(bill - cost).toFixed(2)}</span>);
          } else {
            return (<span>{0}</span>);
          }
        },
      }, {
        title: this.msg('invoiceNo'),
        dataIndex: 'invoice_no',
        width: 150,
      }, {
        title: this.msg('bLNo'),
        dataIndex: 'bl_wb_no',
        width: 220,
      }, {
        title: this.msg('statementEn'),
        width: 80,
        dataIndex: 'status',
        render: o => EXP_STATUS.filter(st => st.value === o)[0].text,
      }, {
        title: this.msg('acptTime'),
        dataIndex: 'acpt_time',
        width: 120,
        sorter: (a, b) => a.acpt_time - b.acpt_time,
        sortOrder: sorted.columnKey === 'acpt_time' && sorted.order,
        filterDropdown: (
          <RangePicker value={[moment(acptDate.firstDay), moment(acptDate.endDay)]} onChange={this.handleAcptDateChange} />
        ),
        filterDropdownVisible: this.state.filterAcptVisible,
        onFilterDropdownVisibleChange: visible => this.setState({ filterAcptVisible: visible }),
        render: o => `${moment(o).format('MM.DD HH:mm')}`,
      }, {
        title: this.msg('cleanDate'),
        dataIndex: 'clean_time',
        width: 120,
        sorter: (a, b) => a.clean_time - b.clean_time,
        sortOrder: sorted.columnKey === 'clean_time' && sorted.order,
        filterDropdown: (
          <RangePicker value={[moment(cleanDate.firstDay), moment(cleanDate.endDay)]} onChange={this.handleCleanDateChange} />
        ),
        filterDropdownVisible: this.state.filterCleanVisible,
        onFilterDropdownVisibleChange: visible => this.setState({ filterCleanVisible: visible }),
        render: (o) => {
          if (o) {
            return <span>{moment(o).format('MM.DD HH:mm')}</span>;
          }
        },
      }, {
        title: this.msg('lastActT'),
        dataIndex: 'last_charge_time',
        width: 120,
        sorter: (a, b) => a.last_charge_time - b.last_charge_time,
        sortOrder: sorted.columnKey === 'last_charge_time' && sorted.order,
        render: (o) => {
          if (o) {
            return <span>{moment(o).format('MM.DD HH:mm')}</span>;
          } else {
            return <span>{'--:--'}</span>;
          }
        },
      },
    ];
    this.dataSource.remotes = expslist;
    const unstateData = expslist.data.filter(dt => dt.status === 0);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('expense')}
            </Breadcrumb.Item>
          </Breadcrumb>
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
              <Button type="default" icon="upload" onClick={this.handleCushInput}>
                {this.msg('incExp')}
              </Button>
              <span />
              <Button type="ghost" icon="file-excel" onClick={this.handleExpExport}>
                {this.msg('eptExp')}
              </Button>
            </div>
            <div className="panel-body table-panel group-header">
              <Table columns={columns} dataSource={this.dataSource} loading={expslist.loading}
                bordered scroll={{ x: 1900 }} rowKey="delg_no"
              />
            </div>
          </div>
        </div>
        <InputModal data={unstateData} />
        <DelegationInfoHubPanel />
        <DelgAdvanceExpenseModal />
        <ExpEptModal visible={this.state.expEptVisible} toggle={this.toggleEptModal} />
      </QueueAnim>
    );
  }
}
