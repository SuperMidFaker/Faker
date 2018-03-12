import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { UPLOAD_BATCH_OBJECT, PARTNER_ROLES } from 'common/constants';
import { Breadcrumb, Checkbox, DatePicker, Dropdown, Icon, Menu, Layout, Select, message, Form } from 'antd';
import { loadPartners } from 'common/reducers/partner';
import { loadCurrencies, loadAdvanceParties, showAdvModelModal, loadBills } from 'common/reducers/cmsExpense';
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
  promises.push(dispatch(loadBills({
    filter: JSON.stringify({
      status: 'billing',
      mode: 'receivable',
    }),
    pageSize: state.cmsExpense.bills.pageSize,
    current: state.cmsExpense.bills.current,
  })));
  promises.push(dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role: PARTNER_ROLES.CUS,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    bills: state.cmsExpense.bills,
    listFilter: state.cmsExpense.listFilter,
    partners: state.partner.partners,
    uploadRecords: state.uploadRecords.uploadRecords,
  }),
  {
    loadCurrencies,
    showPreviewer,
    loadAdvanceParties,
    showAdvModelModal,
    loadQuoteModel,
    togglePanelVisible,
    setUploadRecordsReload,
    loadBills,
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
    status: 'billing',
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
      dataIndex: 'buyer_tenant_id',
      width: 200,
      render: o => this.props.partners.find(partner => partner.partner_tenant_id === Number(o)) &&
      this.props.partners.find(partner => partner.partner_tenant_id === Number(o)).name,
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
      title: '计费人员',
      dataIndex: 'created_by',
      width: 120,
      render: lid => <UserAvatar size="small" loginId={lid} showName />,
    }, {
      title: '审核人员',
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
    fetcher: params => this.props.loadBills(params),
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
    remotes: this.props.bills,
  })

  handleMenuClick = (ev) => {
    this.setState({ status: ev.key });
    const filter = { ...this.props.listFilter, status: ev.key };
    this.handleBillsLoad('', filter);
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'shipment');
  }
  handleBillsLoad = (currentPage, filter) => {
    const { listFilter, bills: { pageSize, current } } = this.props;
    this.props.loadBills({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
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
    this.handleBillsLoad(1, filter);
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
    const { bills, partners, form: { getFieldDecorator } } = this.props;
    const { status } = this.state;
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
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateChange}
        style={{ width: 256 }}
      />
    </span>);
    const bulkActions = (<span>
      {(status === 'billing' || status === 'pending') &&
      <ToolbarAction icon="arrow-up" confirm={this.gmsg('confirmOp')} onConfirm={this.handleBatchSubmit} label={this.gmsg('submit')} />}
      <ToolbarAction icon="download" onClick={this.handleExpExport} label={this.gmsg('export')} />
    </span>);
    this.dataSource.remotes = bills;
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
            <Menu mode="inline" selectedKeys={[this.state.status]} onClick={this.handleMenuClick}>
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
