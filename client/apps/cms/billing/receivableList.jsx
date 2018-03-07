import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import moment from 'moment';
import { Breadcrumb, Button, Checkbox, DatePicker, Icon, Select, Menu, Layout, message } from 'antd';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, loadCurrencies, loadAdvanceParties, loadPartnersForFilter, showAdvModelModal } from 'common/reducers/cmsExpense';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import { showPreviewer } from 'common/reducers/cmsDelegationDock';
import SearchBox from 'client/components/SearchBox';
import TrimSpan from 'client/components/trimSpan';
import ImportDataPanel from 'client/components/ImportDataPanel';
import RowAction from 'client/components/RowAction';
import Drawer from 'client/components/Drawer';
import UserAvatar from 'client/components/UserAvatar';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import DelgAdvanceExpenseModal from './modals/delgAdvanceExpenseModal';
import ExpEptModal from './modals/expEptModal';
import AdvModelModal from './modals/advModelModal';
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
    currentStatus: 'billing',
    selectedRowKeys: [],
    expEptVisible: false,
    sortedInfo: { field: '', order: '' },
    importFeesModalVisible: false,
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
      title: this.msg('clientName'),
      dataIndex: 'client_name',
      width: 200,
      render: o => <TrimSpan text={o} maxLen={12} />,
    }, {
      title: this.msg('custOrderNo'),
      dataIndex: 'cust_order_no',
      width: 120,
    }, {
      title: this.msg('waybillLadingNo'),
      dataIndex: 'bl_wb_no',
      width: 180,
    }, {
      title: this.msg('cusDeclNo'),
      dataIndex: 'cus_decl_nos',
      width: 120,
    }, {
      title: this.msg('bizStatus'),
      dataIndex: 'biz_status',
      width: 80,
    }, {
      title: this.msg('serviceSummary'),
      dataIndex: 'sum_svc_charges',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('advanceSummary'),
      dataIndex: 'sum_adv_charges',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('receivableTotal'),
      dataIndex: 'total_charges',
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('expStatus'),
      dataIndex: 'exp_status',
      width: 80,
    }, {
      title: this.msg('declQty'),
      dataIndex: 'decl_qty',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('declSheetQty'),
      dataIndex: 'decl_sheet_qty',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('declItemQty'),
      dataIndex: 'decl_item_qty',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('tradeItemQty'),
      dataIndex: 'trade_item_qty',
      align: 'center',
      width: 70,
    }, {
      title: this.msg('tradeAmount'),
      dataIndex: 'trade_amount',
      align: 'right',
      width: 100,
    }, {
      title: this.msg('quoteNo'),
      dataIndex: 'quote_no',
      width: 100,
    }, {
      title: this.msg('lastActT'),
      dataIndex: 'last_updated_date',
      width: 120,
      render: o => o && moment(o).format('MM.DD HH:mm'),
    }, {
      title: '计费人员',
      dataIndex: 'charged_by',
      width: 120,
      render: lid => <UserAvatar size="small" loginId={lid} showName />,
    }, {
      title: '审核人员',
      dataIndex: 'audited_by',
      width: 120,
      render: lid => <UserAvatar size="small" loginId={lid} showName />,
    }, {
      title: this.gmsg('actions'),
      dataIndex: 'OPS_COL',
      align: 'right',
      fixed: 'right',
      width: 120,
      render: (o, record) => {
        if (record.exp_status < 3) {
          return <RowAction icon="form" onClick={this.handleDetail} label="应收明细" row={record} />;
        }
        return <RowAction icon="eye-o" onClick={this.handleDetail} label="应收明细" row={record} />;
      },
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

  handleMenuClick = (ev) => {
    this.setState({ currentStatus: ev.key });
  }
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
    this.toggleImportFeesModal();
  }
  handleExpExport = () => {
    this.setState({
      expEptVisible: true,
    });
  }
  toggleEptModal = () => {
    this.setState({ expEptVisible: !this.state.expEptVisible });
  }
  toggleImportFeesModal = () => {
    this.setState({ importFeesModalVisible: !this.state.importFeesModalVisible });
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
  handleGenTemplate = () => {
    // this.props.showAdvModelModal(true);
    this.props.loadQuoteModel(this.props.tenantId);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDetail = (row) => {
    const link = `/clearance/billing/expense/${row.delg_no}/receivable/${row.disp_id}`;
    this.context.router.push(link);
  }
  render() {
    const { expenseList, partners } = this.props;
    const { currentStatus } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        showSearch
        allowClear
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        {partners.customer.map(data => (<Option key={data.name} value={data.partner_id}>
          {data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
        </Option>))}
      </Select>
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleAcptDateChange}
        style={{ width: 256 }}
      />
    </span>);
    const bulkActions = (<span>
      {(currentStatus === 'billing' || currentStatus === 'pending') &&
      <Button icon="arrow-up" onClick={this.handleBatchSubmit}>{this.gmsg('submit')}</Button>}
      <Button icon="download" onClick={this.handleExpExport}>{this.gmsg('export')}</Button>
    </span>);
    this.dataSource.remotes = expenseList;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('receivableExpense')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            {/*  <Button icon="download" onClick={this.handleAdvModelEpt}>
              {this.msg('eptAdvModel')}
            </Button>
            */}
            {(currentStatus === 'billing' || currentStatus === 'pending') &&
            <Button type="primary" ghost={currentStatus === 'pending'} icon="upload" onClick={this.handleAdvFeesImport}>
              {this.msg('importFees')}
            </Button>}
            {currentStatus === 'pending' &&
            <Button type="primary" icon="arrow-up" onClick={this.handleAllSubmit}>
              {this.msg('submitAll')}
            </Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[this.state.currentStatus]} onClick={this.handleMenuClick}>
              <Menu.Item key="billing">
                <Icon type="loading" /> {this.msg('statusBilling')}
              </Menu.Item>
              <Menu.Item key="pending">
                <Icon type="select" /> {this.msg('statusPending')}
              </Menu.Item>
              <Menu.Item key="submitted">
                <Icon type="upload" /> {this.msg('statusSubmitted')}
              </Menu.Item>
              <Menu.Item key="confirmed">
                <Icon type="check-square-o" /> {this.msg('statusConfirmed')}
              </Menu.Item>
            </Menu>
          </Drawer>
          <Content className="page-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={this.dataSource}
              rowKey="delg_no"
              loading={expenseList.loading}
              bordered
            />
          </Content>
          <ImportDataPanel
            title={this.msg('importFees')}
            visible={this.state.importFeesModalVisible}
            endpoint={`${API_ROOTS.default}v1/scof/invoices/import`}
            formData={{}}
            onClose={() => { this.setState({ importFeesModalVisible: false }); }}
            onUploaded={this.invoicesUploaded}
            onGenTemplate={this.handleGenTemplate}
          >
            <Select
              placeholder="请选择委托方"
              showSearch
              allowClear
              optionFilterProp="children"
              onChange={this.handlePartnerChange}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 360 }}
              style={{ width: '100%', marginBottom: 16 }}
            >
              {partners.customer.map(data => (<Option key={data.name} value={data.partner_id}>
                {data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
              </Option>))}
            </Select>
            <Checkbox style={{ width: '100%', marginBottom: 16 }}>包含待计费数据</Checkbox>
          </ImportDataPanel>
        </Layout>
        <DelegationDockPanel />
        <DelgAdvanceExpenseModal />
        <AdvModelModal />
        <AdvExpsImpTempModal onload={() => this.handleExpListLoad()} />
        <ExpEptModal visible={this.state.expEptVisible} toggle={this.toggleEptModal} />
      </Layout>
    );
  }
}
