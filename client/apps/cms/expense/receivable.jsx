import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import moment from 'moment';
import { Badge, Breadcrumb, Button, DatePicker, Select, Layout, message } from 'antd';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, loadCurrencies, loadAdvanceParties, loadPartnersForFilter, showAdvModelModal } from 'common/reducers/cmsExpense';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import { showPreviewer } from 'common/reducers/cmsDelegationDock';
import SearchBox from 'client/components/SearchBox';
import TrimSpan from 'client/components/trimSpan';
import RowAction from 'client/components/RowAction';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import DelgAdvanceExpenseModal from './modals/delgAdvanceExpenseModal';
import ExpEptModal from './modals/expEptModal';
import AdvModelModal from './modals/advModelModal';
import AdvUploadModal from './modals/advUploadModal';
import AdvExpsImpTempModal from './modals/advExpImpTempModal';
import { formatMsg, formatGlobalMsg } from './message.i18n';


const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

function mergeFilters(curFilters, value) {
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

function fetchData({ state, dispatch }) {
  const promises = [];
  const endDay = new Date();
  const firstDay = new Date();
  firstDay.setDate(1);
  promises.push(dispatch(loadExpense({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({
      status: 'all',
      mode: 'receivable',
      tabkey: 'byDelegation',
      acptDate: { en: false, firstDay, endDay },
      cleanDate: { en: false, firstDay, endDay },
    }),
    pageSize: state.cmsExpense.expenseList.pageSize,
    currentPage: state.cmsExpense.expenseList.current,
  })));
  promises.push(dispatch(loadPartnersForFilter(state.account.tenantId)));
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    expenseList: state.cmsExpense.expenseList,
    listFilter: state.cmsExpense.listFilter,
    saved: state.cmsExpense.saved,
    partners: state.cmsExpense.partners,
  }),
  {
    loadCurrencies,
    loadExpense,
    showPreviewer,
    loadAdvanceParties,
    showAdvModelModal,
    loadQuoteModel,
  }
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
    expenseList: PropTypes.shape({ current: PropTypes.number }).isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string }).isRequired,
    loadExpense: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
    partners: PropTypes.shape({
      customer: PropTypes.array,
      supplier: PropTypes.array,
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    expEptVisible: false,
    supeFilter: [],
    sortedInfo: { field: '', order: '' },
    advUploadVisible: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleExpListLoad();
    }
    if (nextProps.partners !== this.props.partners) {
      const { partners } = nextProps;
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
      this.setState({ supeFilter });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [
    {
      title: this.msg('delgNo'),
      dataIndex: 'delg_no',
      width: 160,
      fixed: 'left',
      render: o => (
        <a onClick={() => this.handlePreview(o)}>
          {o}
        </a>),
    }, {
      title: this.msg('custName'),
      dataIndex: 'send_name',
      width: 200,
      filters: this.state.supeFilter,
      render: o => <TrimSpan text={o} maxLen={12} />,
    }, {
      title: this.msg('cusDeclCharges'),
      dataIndex: 'cus_decl_charges',
      width: 80,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('ciqDeclCharges'),
      dataIndex: 'ciq_decl_charges',
      width: 80,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('certsCharges'),
      dataIndex: 'certs_charges',
      width: 80,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('serviceSummary'),
      dataIndex: 'certs_charges',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('forwarderCharge'),
      dataIndex: 'forwarder_charges',
      width: 80,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('advanceSummary'),
      dataIndex: 'certs_charges',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('receivableTotal'),
      dataIndex: 'revenue',
    }, {
      title: this.msg('status'),
      dataIndex: 'cost_status',
      key: 'cost_status',
      width: 100,
      render: (status) => {
        if (status === 1) {
          return <Badge status="warning" />;
        } else if (status === 2) {
          return <Badge status="success" />;
        }
        return <Badge status="default" />;
      },
    }, {
      title: this.msg('ccdCount'),
      dataIndex: 'ccd_count',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('ccsCount'),
      dataIndex: 'ccs_count',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('itemCount'),
      dataIndex: 'item_count',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('prdtCount'),
      dataIndex: 'prdt_count',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('declValue'),
      dataIndex: 'decl_value',
      align: 'right',
      width: 100,
    }, {
      title: this.msg('acptTime'),
      dataIndex: 'acpt_time',
      width: 120,
      render: o => o && moment(o).format('MM.DD HH:mm'),
    }, {
      title: this.msg('cleanDate'),
      dataIndex: 'clean_time',
      width: 120,
      render: o => o && moment(o).format('MM.DD HH:mm'),
    }, {
      title: this.msg('lastActT'),
      dataIndex: 'last_charge_time',
      width: 120,
      render: o => o && moment(o).format('MM.DD HH:mm'),
    }, {
      title: this.gmsg('op'),
      dataIndex: 'OPS_COL',
      width: 120,
      fixed: 'right',
      render: (o, record) => <RowAction onClick={this.handleDetail} label="应收明细" row={record} />,
    },
  ];
  dataSource = new DataTable.DataSource({
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
      const filter = {
        ...this.props.listFilter,
        enFilter,
        sortField: sorter.field,
        sortOrder: sorter.order,
      };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.expenseList,
  })

  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'shipment');
  }
  handleExpListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, expenseList: { pageSize, current } } = this.props;
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
    const filters = mergeFilters(this.props.listFilter, searchVal);
    this.handleExpListLoad(1, filters);
  }
  handleAddAdvanceIncome = (row) => {
    this.props.loadAdvanceParties(row.delg_no, this.props.tenantId, 'recv');
  }
  handleAddAdvancePayment = (row) => {
    this.props.loadAdvanceParties(row.delg_no, this.props.tenantId, 'send');
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
    let filter = this.props.listFilter;
    if (dates.length > 0) {
      const acptDate = {
        en: true,
        firstDay: dates[0].toDate(),
        endDay: dates[1].toDate(),
      };
      const { sortedInfo } = this.state;
      filter = {
        ...this.props.listFilter,
        sortField: sortedInfo.field,
        sortOrder: sortedInfo.order,
        acptDate,
      };
    }
    this.handleExpListLoad(1, filter);
  }
  handleCleanDateChange = (dates) => {
    const cleanDate = {
      en: true,
      firstDay: dates[0].toDate(),
      endDay: dates[1].toDate(),
    };
    const { sortedInfo } = this.state;
    const filter = {
      ...this.props.listFilter,
      sortField: sortedInfo.field,
      sortOrder: sortedInfo.order,
      cleanDate,
    };
    this.handleExpListLoad(1, filter);
  }
  handleTabChange = (key) => {
    if (key === this.props.listFilter.tabkey) {
      return;
    }
    const filter = { ...this.props.listFilter, tabkey: key };
    this.handleExpListLoad(1, filter);
  }
  handleStatusChange = (value) => {
    if (value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: value };
    this.handleExpListLoad(1, filter);
  }
  handleAdvModelEpt = () => {
    this.props.showAdvModelModal(true);
    this.props.loadQuoteModel(this.props.tenantId);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDetail = (row) => {
    const link = `/clearance/expense/receivable/${row.delg_no}`;
    this.context.router.push(link);
  }
  render() {
    const { expenseList, listFilter } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const tabList = [
      {
        key: 'byDelegation',
        tab: this.msg('byDelegation'),
      },
      {
        key: 'byCustomer',
        tab: this.msg('byCustomer'),
      },
    ];
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        value={listFilter.status}
        style={{ width: 160 }}
        onChange={this.handleStatusChange}
      >
        <Option value="all">全部</Option>
        <Option value="pending">未提交结算</Option>
        <Option value="submitted">已提交结算</Option>
      </Select>
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleAcptDateChange}
        style={{ width: 256 }}
      />
    </span>);
    this.dataSource.remotes = expenseList;
    return (
      <Layout>
        <PageHeader tabList={tabList} onTabChange={this.handleTabChange}>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('receivableExpense')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button icon="download" onClick={this.handleAdvModelEpt}>
              {this.msg('eptAdvModel')}
            </Button>
            <Button icon="upload" onClick={this.handleAdvFeesImport}>
              {this.msg('incExp')}
            </Button>
            <Button icon="file-excel" onClick={this.handleExpExport}>
              {this.msg('eptExp')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={this.dataSource}
            rowKey="delg_no"
            loading={expenseList.loading}
            scrollOffset={320}
            bordered
          />
        </Content>
        <DelegationDockPanel />
        <DelgAdvanceExpenseModal />
        <AdvModelModal />
        <AdvUploadModal visible={this.state.advUploadVisible} toggle={this.toggleAdvUploadModal} />
        <AdvExpsImpTempModal onload={() => this.handleExpListLoad()} />
        <ExpEptModal visible={this.state.expEptVisible} toggle={this.toggleEptModal} />
      </Layout>
    );
  }
}
