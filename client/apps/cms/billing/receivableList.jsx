import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Checkbox, DatePicker, Dropdown, Icon, Menu, Layout, Select, message, Form } from 'antd';
import { UPLOAD_BATCH_OBJECT, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { loadExpense, loadCurrencies, loadAdvanceParties, showAdvModelModal } from 'common/reducers/cmsExpense';
import { loadPartners } from 'common/reducers/partner';
import { setUploadRecordsReload, togglePanelVisible } from 'common/reducers/uploadRecords';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import { showPreviewer } from 'common/reducers/cmsDelegationDock';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectNav from 'client/common/decorators/connect-nav';
import { createFilename } from 'client/util/dataTransform';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import TrimSpan from 'client/components/trimSpan';
import RowAction from 'client/components/RowAction';
import ToolbarAction from 'client/components/ToolbarAction';
import ImportDataPanel from 'client/components/ImportDataPanel';
import UploadLogsPanel from 'client/components/UploadLogsPanel';
import Drawer from 'client/components/Drawer';
import UserAvatar from 'client/components/UserAvatar';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const FormItem = Form.Item;
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
  promises.push(dispatch(loadPartners({
    role: [PARTNER_ROLES.CUS, PARTNER_ROLES.SUP],
    businessType: PARTNER_BUSINESSE_TYPES.clearance,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    expenseList: state.cmsExpense.expenseList,
    listFilter: state.cmsExpense.listFilter,
    saved: state.cmsExpense.saved,
    partners: state.partner.partners,
    uploadRecords: state.uploadRecords.uploadRecords,
  }),
  {
    loadCurrencies,
    loadExpense,
    showPreviewer,
    loadAdvanceParties,
    showAdvModelModal,
    loadQuoteModel,
    togglePanelVisible,
    setUploadRecordsReload,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'expense' })
export default class ExpenseList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    expenseList: PropTypes.shape({ current: PropTypes.number }).isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string }).isRequired,
    loadExpense: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentStatus: 'billing',
    selectedRowKeys: [],
    expEptVisible: false,
    sortedInfo: { field: '', order: '' },
    importPanelVisible: false,
    partners: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleExpListLoad();
    }
    if (nextProps.partners !== this.props.partners) {
      const client = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.CUS);
      this.setState({ partners: client });
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
  handleSearch = (searchVal) => {
    const filters = mergeFilters(this.props.listFilter, searchVal);
    this.handleExpListLoad(1, filters);
  }
  handleImportExpense = () => {
    this.setState({
      importPanelVisible: true,
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
    const params = { ...this.props.form.getFieldsValue(), mode: 'receivable' };
    window.open(`${API_ROOTS.default}v1/cms/billing/expense/model/${createFilename('expense')}.xlsx?params=${
      JSON.stringify(params)}`);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDetail = (row) => {
    const link = `/clearance/billing/expense/${row.delg_no}/receivable/${row.disp_id}`;
    this.context.router.push(link);
  }
  showImportLogs = (ev) => {
    if (ev.key === 'logs') {
      this.props.togglePanelVisible(true);
    }
  }
  render() {
    const { expenseList, form: { getFieldDecorator } } = this.props;
    const { currentStatus, partners } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const menu = (
      <Menu onClick={this.showImportLogs}>
        <Menu.Item key="logs">{this.gmsg('importLogs')}</Menu.Item>
      </Menu>
    );
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
        {partners.map(pt => (
          <Option value={String(pt.id)} key={String(pt.id)}>
            {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
          </Option>
        ))}
      </Select>
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleAcptDateChange}
        style={{ width: 256 }}
      />
    </span>);
    const bulkActions = (<span>
      {(currentStatus === 'billing' || currentStatus === 'pending') &&
      <ToolbarAction icon="arrow-up" confirm={this.gmsg('confirmOp')} onConfirm={this.handleBatchSubmit} label={this.gmsg('submit')} />}
      <ToolbarAction icon="download" onClick={this.handleExpExport} label={this.gmsg('export')} />
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
            <ToolbarAction
              icon="arrow-up"
              confirm={this.gmsg('confirmOp')}
              onConfirm={this.handleAllSubmit}
              label={this.msg('submitAll')}
              disabled={currentStatus !== 'pending'}
            />
            <Dropdown.Button
              type="primary"
              icon="upload"
              onClick={this.handleImportExpense}
              overlay={menu}
              disabled={currentStatus === 'submitted' || currentStatus === 'confirmed'}
            >
              {this.msg('importFees')}
            </Dropdown.Button>
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
              onDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={this.dataSource}
              rowKey="delg_no"
              loading={expenseList.loading}
              bordered
            />
          </Content>
          <ImportDataPanel
            title={this.msg('importFees')}
            visible={this.state.importPanelVisible}
            endpoint={`${API_ROOTS.default}v1/scof/invoices/import`}
            formData={{}}
            onClose={() => { this.setState({ importPanelVisible: false }); }}
            onUploaded={this.invoicesUploaded}
            onGenTemplate={this.handleGenTemplate}
          >
            <FormItem>
              {getFieldDecorator('partnerId', {
              })(<Select
                placeholder="请选择委托方"
                showSearch
                allowClear
                optionFilterProp="children"
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 360 }}
                style={{ width: '100%', marginBottom: 16 }}
              >
                {partners.map(pt => (
                  <Option value={String(pt.id)} key={String(pt.id)}>
                    {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                  </Option>))
                }
              </Select>)}
            </FormItem>
            <FormItem>
              {getFieldDecorator('dataInclude', {
              })(<Checkbox style={{ width: '100%', marginBottom: 16 }}>包含待计费数据</Checkbox>)}
            </FormItem>
          </ImportDataPanel>
          <UploadLogsPanel
            type={UPLOAD_BATCH_OBJECT.CMS_EXPENSE}
          />
        </Layout>
        <DelegationDockPanel />
      </Layout>
    );
  }
}
