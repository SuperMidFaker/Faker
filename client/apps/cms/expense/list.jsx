import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Badge, Breadcrumb, Button, DatePicker, Icon, Layout, Radio, Select, Tooltip, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, loadCurrencies, loadAdvanceParties, loadPartnersForFilter, showAdvModelModal } from 'common/reducers/cmsExpense';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import moment from 'moment';
import SearchBar from 'client/components/search-bar';
import TrimSpan from 'client/components/trimSpan';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import DelgAdvanceExpenseModal from './modals/delgAdvanceExpenseModal';
import RowUpdater from 'client/components/rowUpdater';
import ExpEptModal from './modals/expEptModal';
import AdvModelModal from './modals/advModelModal';
import AdvUploadModal from './modals/advUploadModal';
import AdvExpsImpTempModal from './modals/advExpImpTempModal';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

function fetchData({ state, dispatch }) {
  const promises = [];
  const endDay = new Date();
  const firstDay = new Date();
  firstDay.setDate(1);
  promises.push(dispatch(loadExpense({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({
      status: 'all',
      viewStatus: 'both',
      acptDate: { en: false, firstDay, endDay },
      cleanDate: { en: false, firstDay, endDay },
    }),
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
  { loadCurrencies, loadExpense, showPreviewer, loadAdvanceParties, showAdvModelModal, loadQuoteModel }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'expense' })
export default class ExpenseList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    expslist: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadCurrencies: PropTypes.func.isRequired,
    loadExpense: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
    partners: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    expandedKeys: [],
    expEptVisible: false,
    custFilter: [],
    supeFilter: [],
    filterAcptVisible: false,
    filterCleanVisible: false,
    sortedInfo: { field: '', order: '' },
    advUploadVisible: false,
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
          value: `partnerId:${supplier.partner_id}`,
        };
        supeFilter.push(obj);
      }
      supeFilter.push({
        text: `${this.props.tenantId} | ${this.props.tenantName}`,
        value: `tenantId:${this.props.tenantId}`,
      });
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
      showTotal: total => `共 ${total} 条`,
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
      const enFilter = { ...filters };
      if (filters.agent_name) {
        const agentPartnerIds = [];
        filters.agent_name.forEach((agent) => {
          if (agent.indexOf('partnerId') !== -1) {
            const partnerId = agent.substring(10);
            agentPartnerIds.push(parseInt(partnerId, 10));
            enFilter.agentPartnerIds = agentPartnerIds;
          } else if (agent.indexOf('tenantId') !== -1) {
            enFilter.agentTenantId = this.props.tenantId;
          }
        });
      }
      const filter = { ...this.props.listFilter,
        enFilter,
        sortField: sorter.field,
        sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.expslist,
  })

  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'expenses');
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
        message.error(result.error.message, 10);
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
  handleAdvFeesImport = () => {
    this.toggleAdvUploadModal();
  }
  handleExpExport = () => {
    this.setState({
      expEptVisible: true,
    });
  }
  toggleEptModal = () => {
    this.setState({ expEptVisible: !this.state.expEptVisible });
  }
  toggleAdvUploadModal = () => {
    this.setState({ advUploadVisible: !this.state.advUploadVisible });
  }
  handleAcptDateChange = (dates) => {
    const acptDate = {
      en: true,
      firstDay: dates[0].toDate(),
      endDay: dates[1].toDate(),
    };
    const { sortedInfo } = this.state;
    const filter = { ...this.props.listFilter,
      sortField: sortedInfo.field,
      sortOrder: sortedInfo.order,
      acptDate };
    this.handleExpListLoad(1, filter);
  }
  handleCleanDateChange = (dates) => {
    const cleanDate = {
      en: true,
      firstDay: dates[0].toDate(),
      endDay: dates[1].toDate(),
    };
    const { sortedInfo } = this.state;
    const filter = { ...this.props.listFilter,
      sortField: sortedInfo.field,
      sortOrder: sortedInfo.order,
      cleanDate };
    this.handleExpListLoad(1, filter);
  }
  handleViewChange = (value) => {
    const filter = { ...this.props.listFilter, viewStatus: value };
    this.handleExpListLoad(1, filter);
  }
  handleAdvModelEpt = () => {
    this.props.showAdvModelModal(true);
    this.props.loadQuoteModel(this.props.tenantId);
  }
  render() {
    const { expslist, listFilter } = this.props;
    const { acptDate, cleanDate } = listFilter;
    const { sortedInfo } = this.state;
    const sorted = sortedInfo || {};
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
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
        width: 200,
        filters: this.state.custFilter,
        render: o => <TrimSpan text={o} maxLen={12} />,
      }, {
        title: this.msg('agentName'),
        dataIndex: 'agent_name',
        width: 200,
        filters: this.state.supeFilter,
        render: o => <TrimSpan text={o} maxLen={12} />,
      }, {
        title: this.msg('revenue'),
        dataIndex: 'revenue',
        children: [
          {
            title: this.msg('serviceRevenue'),
            dataIndex: 'serv_bill',
            key: 'serv_bill',
            width: 80,
            className: 'cell-align-right',
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
            className: 'cell-align-right',
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
          }, {
            title: this.msg('allBill'),
            dataIndex: 'all_bill',
            key: 'all_bill',
            width: 80,
            className: 'cell-align-right',
            render: (o) => {
              if (!isNaN(o)) {
                return (<b>{o.toFixed(2)}</b>);
              }
            },
          }, {
            title: this.msg('status'),
            width: 60,
            dataIndex: 'bill_status',
            key: 'revenue_status',
            className: 'status-indicator',
            render: (status) => {
              if (status === 0) {
                return <Badge status="default" />;
              } else if (status === 1) {
                return <Badge status="warning" />;
              } else if (status === 2) {
                return <Badge status="success" />;
              }
            },
          },
        ],
      }, {
        title: this.msg('cost'),
        dataIndex: 'cost',
        children: [
          {
            title: this.msg('servCost'),
            dataIndex: 'serv_cost',
            key: 'serv_cost',
            width: 80,
            className: 'cell-align-right',
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
            className: 'cell-align-right',
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
          }, {
            title: this.msg('allCost'),
            dataIndex: 'all_cost',
            width: 80,
            className: 'cell-align-right',
            render: (o) => {
              if (!isNaN(o)) {
                return (<b>{o.toFixed(2)}</b>);
              }
            },
          }, {
            title: this.msg('status'),
            width: 60,
            dataIndex: 'cost_status',
            key: 'cost_status',
            className: 'status-indicator',
            render: (status) => {
              if (status === 0) {
                return <Badge status="default" />;
              } else if (status === 1) {
                return <Badge status="warning" />;
              } else if (status === 2) {
                return <Badge status="success" />;
              }
            },
          },
        ],
      }, {
        title: this.msg('profit'),
        width: 80,
        dataIndex: 'profit',
        className: 'cell-align-right',
        render: (o, record) => {
          const bill = isNaN(record.all_bill) ? 0 : record.all_bill;
          const cost = isNaN(record.all_cost) ? 0 : record.all_cost;
          if (bill < cost) {
            return (<span className="mdc-text-red">{-(cost - bill).toFixed(2)}</span>);
          } else if (bill > cost) {
            return (<span className="mdc-text-green">{(bill - cost).toFixed(2)}</span>);
          } else {
            return (<span className="mdc-text-grey">0.00</span>);
          }
        },
      }, {
        title: this.msg('invoiceNo'),
        dataIndex: 'invoice_no',
        width: 180,
      }, {
        title: this.msg('bLNo'),
        dataIndex: 'bl_wb_no',
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
    let curColumns = columns;
    let tableWidth = 2020;
    if (listFilter.viewStatus === 'revenueOnly') {
      curColumns = columns.filter(colm => colm.dataIndex !== 'cost' && colm.dataIndex !== 'profit' && colm.dataIndex !== 'agent_name');
      tableWidth = 1400;
    } else if (listFilter.viewStatus === 'costOnly') {
      curColumns = columns.filter(colm => colm.dataIndex !== 'revenue' && colm.dataIndex !== 'profit' && colm.dataIndex !== 'send_name');
      tableWidth = 1400;
    }
    this.dataSource.remotes = expslist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('billing')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('expense')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="pending">{this.msg('statusPending')}</RadioButton>
            <RadioButton value="estimated">{this.msg('statusEstimated')}</RadioButton>
            <RadioButton value="closed">{this.msg('statusClosed')}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <Button size="large" icon="download" onClick={this.handleAdvModelEpt}>
              {this.msg('eptAdvModel')}
            </Button>
            <Button size="large" icon="upload" onClick={this.handleAdvFeesImport}>
              {this.msg('incExp')}
            </Button>
            <Button size="large" icon="file-excel" onClick={this.handleExpExport}>
              {this.msg('eptExp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} size="large" />
              <div className="toolbar-right">
                <Select value={listFilter.viewStatus}
                  style={{ width: 120 }}
                  showSearch={false}
                  onChange={this.handleViewChange}
                  size="large"
                >
                  <OptGroup label="常用视图">
                    <Option value="both">显示收入与支出</Option>
                    <Option value="revenueOnly">仅显示收入</Option>
                    <Option value="costOnly">仅显示支出</Option>
                  </OptGroup>
                </Select>
                <Tooltip title="费用与计费设置">
                  <Button size="large" icon="setting" />
                </Tooltip>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout group-header">
              <Table rowSelection={rowSelection} columns={curColumns} dataSource={this.dataSource} loading={expslist.loading}
                bordered scroll={{ x: tableWidth }} rowKey="delg_no"
              />
            </div>
          </div>
        </Content>
        <DelegationDockPanel />
        <DelgAdvanceExpenseModal />
        <AdvModelModal />
        <AdvUploadModal visible={this.state.advUploadVisible} toggle={this.toggleAdvUploadModal} />
        <AdvExpsImpTempModal onload={() => this.handleExpListLoad()} />
        <ExpEptModal visible={this.state.expEptVisible} toggle={this.toggleEptModal} />
      </QueueAnim>
    );
  }
}
