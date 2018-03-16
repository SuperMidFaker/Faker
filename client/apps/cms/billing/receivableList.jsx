import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { UPLOAD_BATCH_OBJECT, PARTNER_ROLES } from 'common/constants';
import { Checkbox, DatePicker, Dropdown, Icon, Menu, Layout, Select, message, Form } from 'antd';
import { loadPartners } from 'common/reducers/partner';
import { loadCurrencies, loadAdvanceParties, showAdvModelModal, loadExpenses, submitExpenses } from 'common/reducers/cmsExpense';
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

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadExpenses({
    filter: JSON.stringify({
      status: 'billing',
      mode: 'receivable',
    }),
    pageSize: state.cmsExpense.expensesList.pageSize,
    current: state.cmsExpense.expensesList.current,
  })));
  promises.push(dispatch(loadPartners({
    role: PARTNER_ROLES.CUS,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    expensesList: state.cmsExpense.expensesList,
    listFilter: state.cmsExpense.listFilter,
    partners: state.partner.partners,
    expensesLoading: state.cmsExpense.expensesLoading,
  }),
  {
    loadCurrencies,
    showPreviewer,
    loadAdvanceParties,
    showAdvModelModal,
    loadQuoteModel,
    togglePanelVisible,
    setUploadRecordsReload,
    loadExpenses,
    submitExpenses,
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
    intl: intlShape.isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    importPanelVisible: false,
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
      dataIndex: 'buyer_name',
      width: 200,
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
      dataIndex: 'customs_entry_nos',
      width: 120,
    }, {
      title: this.msg('serviceSummary'),
      dataIndex: 'sum_svc_charge',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('advanceSummary'),
      dataIndex: 'sum_adv_charge',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('spcSummary'),
      dataIndex: 'sum_spc_charge',
      width: 90,
      align: 'right',
      render: o => o && o.toFixed(2),
    }, {
      title: this.msg('receivableTotal'),
      dataIndex: 'total_charge',
      align: 'right',
      render: (o, record) => ((record.sum_svc_charge || 0) + (record.sum_adv_charge || 0) +
       (record.sum_spc_charge || 0)).toFixed(2),
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
      title: this.msg('billingStaff'),
      dataIndex: 'created_by',
      width: 120,
      render: lid => <UserAvatar size="small" loginId={lid} showName />,
    }, {
      title: this.msg('confirmStaff'),
      dataIndex: 'confirmed_by',
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
    fetcher: params => this.props.loadExpenses(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = {
        ...this.props.listFilter,
      };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.expensesList,
  })

  handleFilterMenuClick = (ev) => {
    const filter = { ...this.props.listFilter, status: ev.key };
    this.handleExpensesLoad('', filter);
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'shipment');
  }
  handleExpensesLoad = (currentPage, filter) => {
    const { listFilter, expensesList: { pageSize, current } } = this.props;
    this.props.loadExpenses({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDeselectRows();
      }
    });
  }
  handleImportExpense = () => {
    this.setState({
      importPanelVisible: true,
    });
  }
  toggleImportFeesModal = () => {
    this.setState({ importFeesModalVisible: !this.state.importFeesModalVisible });
  }
  handleDateChange = (data, dataString) => {
    const filter = { ...this.props.filter, startDate: dataString[0], endDate: dataString[1] };
    this.handleExpensesLoad(1, filter);
  }
  handleGenTemplate = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const params = { ...this.props.form.getFieldsValue(), mode: 'receivable' };
        window.open(`${API_ROOTS.default}v1/cms/billing/expenses/export/${createFilename('delegation_expenses')}.xlsx?params=${
          JSON.stringify(params)}`);
      }
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDetail = (row) => {
    const link = `/clearance/billing/expense/${row.delg_no}/fees`;
    this.context.router.push(link);
  }
  showImportLogs = (ev) => {
    if (ev.key === 'logs') {
      this.props.togglePanelVisible(true);
    }
  }
  handleSelectedExport = () => {
    const expenseNos = this.state.selectedRowKeys;
    const params = { expenseNos, mode: 'receivable' };
    window.open(`${API_ROOTS.default}v1/cms/billing/expenses/export/${createFilename('delegation_expenses')}.xlsx?params=${
      JSON.stringify(params)}`);
  }
  handleBatchSubmit = () => {
    const expenseNos = this.state.selectedRowKeys;
    this.props.submitExpenses({
      expNos: expenseNos,
    }).then((result) => {
      if (!result.error) {
        this.handleExpensesLoad(1);
      }
    });
  }
  handleAllSubmit = () => {
    this.props.submitExpenses({
      expNos: null,
    }).then((result) => {
      if (!result.error) {
        this.handleExpensesLoad(1);
      }
    });
  }
  expensesUploaded = () => {
    this.handleExpensesLoad(1);
    this.setState({
      importPanelVisible: false,
    });
  }
  render() {
    const {
      expensesList, partners, form: { getFieldDecorator }, expensesLoading,
    } = this.props;
    const { status } = this.props.listFilter;
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
        <Option value="all" key="all">全部</Option>
        {partners.map(data => (<Option key={String(data.id)} value={String(data.id)}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
      <RangePicker
        ranges={{ 当天: [moment(), moment()], 当月: [moment().startOf('month'), moment()] }}
        onChange={this.handleDateChange}
        style={{ width: 216 }}
      />
    </span>);
    const bulkActions = (<span>
      {(status === 'pending') &&
      <ToolbarAction icon="arrow-up" confirm={this.gmsg('confirmOp')} onConfirm={this.handleBatchSubmit} label={this.gmsg('submit')} />}
      <ToolbarAction icon="download" onClick={this.handleSelectedExport} label={this.gmsg('export')} />
    </span>);
    this.dataSource.remotes = expensesList;
    return (
      <Layout>
        <PageHeader title={this.msg('receivableExpense')}>
          <PageHeader.Actions>
            <ToolbarAction
              icon="arrow-up"
              confirm={this.gmsg('confirmOp')}
              onConfirm={this.handleAllSubmit}
              label={this.msg('submitAll')}
              disabled={status !== 'pending'}
            />
            <Dropdown.Button
              type="primary"
              icon="upload"
              onClick={this.handleImportExpense}
              overlay={menu}
              disabled={status === 'submitted' || status === 'confirmed'}
            >
              {this.msg('importFees')}
            </Dropdown.Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[status]} onClick={this.handleFilterMenuClick}>
              <Menu.Item key="all">
                {this.gmsg('all')}
              </Menu.Item>
              <Menu.ItemGroup key="status" title={this.gmsg('status')}>
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
              </Menu.ItemGroup>
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
              rowKey="expense_no"
              loading={expensesLoading}
              bordered
            />
          </Content>
          <ImportDataPanel
            title={this.msg('importFees')}
            visible={this.state.importPanelVisible}
            endpoint={`${API_ROOTS.default}v1/cms/billing/expense/import`}
            formData={{ mode: 'receivable' }}
            onClose={() => { this.setState({ importPanelVisible: false }); }}
            onUploaded={this.expensesUploaded}
            onGenTemplate={this.handleGenTemplate}
          >
            <FormItem>
              {getFieldDecorator('partnerId', {
                rules: [{ required: true, message: '委托方必选' }],
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
              {getFieldDecorator('withExpenseFees', {
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
