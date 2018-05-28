import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Checkbox, Input, Menu, Icon, Popconfirm, Progress, message, Layout, Tooltip, Select, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import { Link } from 'react-router';
import { CRM_ORDER_STATUS, PARTNER_ROLES, LINE_FILE_ADAPTOR_MODELS, UPLOAD_BATCH_OBJECT } from 'common/constants';
import { loadOrders, loadOrderAdaptor, removeOrder, setClientForm, acceptOrder, hideDock, loadOrderDetail, batchDeleteByUploadNo, batchStart, batchDelete } from 'common/reducers/sofOrders';
import { loadRequireOrderTypes } from 'common/reducers/sofOrderPref';
import { loadPartners } from 'common/reducers/partner';
import { emptyFlows, loadPartnerFlowList } from 'common/reducers/scofFlow';
import { loadModelAdaptors } from 'common/reducers/hubDataAdapter';
import { setUploadRecordsReload, togglePanelVisible } from 'common/reducers/uploadRecords';
import { toggleExportPanel } from 'common/reducers/saasExport';
import Drawer from 'client/components/Drawer';
import SearchBox from 'client/components/SearchBox';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import UserAvatar from 'client/components/UserAvatar';
import ToolbarAction from 'client/components/ToolbarAction';
import connectNav from 'client/common/decorators/connect-nav';
import ImportDataPanel from 'client/components/ImportDataPanel';
import ExportDataPanel from 'client/components/ExportDataPanel';
import UploadLogsPanel from 'client/components/UploadLogsPanel';
import { ShipmentDock, DelegationDock, ReceivingDock, ShippingDock, FreightDock } from 'client/components/Dock';
import OrderNoColumn from './columndef/orderNoColumn';
import ShipmentColumn from './columndef/shipmentColumn';
import ProgressColumn from './columndef/progressColumn';
import CreatorSelect from './creatorSelect';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  username: state.account.username,
  tenantName: state.account.tenantName,
  loading: state.sofOrders.loading,
  orders: state.sofOrders.orders,
  filters: state.sofOrders.orderFilters,
  partners: state.partner.partners,
  adaptors: state.hubDataAdapter.modelAdaptors,
  flows: state.scofFlow.partnerFlows,
  orderTypes: state.sofOrderPref.requireOrderTypes,
  uploadRecords: state.uploadRecords.uploadRecords,
}), {
  loadOrders,
  loadPartners,
  loadOrderAdaptor,
  removeOrder,
  setClientForm,
  acceptOrder,
  emptyFlows,
  loadPartnerFlowList,
  loadModelAdaptors,
  hideDock,
  loadRequireOrderTypes,
  loadOrderDetail,
  batchDeleteByUploadNo,
  setUploadRecordsReload,
  batchStart,
  batchDelete,
  togglePanelVisible,
  toggleExportPanel,
})
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class OrderList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    orders: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
    filters: PropTypes.shape({ progress: PropTypes.string, transfer: PropTypes.string }).isRequired,
    loadOrders: PropTypes.func.isRequired,
    removeOrder: PropTypes.func.isRequired,
    setClientForm: PropTypes.func.isRequired,
    acceptOrder: PropTypes.func.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    status: 'all',
    importPanel: {
      visible: false,
      cust_order_nodup: true,
      customer_partner_id: undefined,
      flow_id: undefined,
      cust_order_no: null,
      cust_order_no_input: false,
    },
  }
  componentDidMount() {
    const { query } = this.props.location;
    if (query.shipmt_order_no) {
      this.props.loadOrderDetail(query.shipmt_order_no, this.props.tenantId);
    }
    this.props.loadPartners({ role: PARTNER_ROLES.CUS });
    this.props.loadPartnerFlowList();
    this.props.loadModelAdaptors(null, [LINE_FILE_ADAPTOR_MODELS.SOF_ORDER.key]);
    this.props.loadRequireOrderTypes();
    const filters = {
      progress: 'all',
      transfer: 'all',
      partnerId: '',
      orderType: null,
      expedited: 'all',
      creator: 'all',
      loginId: this.props.loginId,
      startDate: '',
      endDate: '',
    };
    if (window.localStorage) {
      if (query.from === 'dashboard' && window.localStorage.scofOrderLists) {
        const scofOrderLists = JSON.parse(window.localStorage.scofOrderLists);
        filters.startDate = scofOrderLists.startDate;
        filters.endDate = scofOrderLists.endDate;
        filters.progress = scofOrderLists.progress;
        filters.expedited = scofOrderLists.expedited;
      }
      if (window.localStorage.scofAdvancedSearchFieldsValue) {
        const creatorObj = JSON.parse(window.localStorage.scofAdvancedSearchFieldsValue);
        filters.creator = creatorObj.creator;
      }
    }
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters,
    });
    this.props.hideDock();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location) {
      const { query } = this.props.location;
      const nextQuery = nextProps.location.query;
      if (query.shipmt_order_no !== nextQuery.shipmt_order_no) {
        this.props.loadOrderDetail(nextQuery.shipmt_order_no, this.props.tenantId);
      }
    }
  }
  onDateChange = (data, dataString) => {
    const filters = { ...this.props.filters, startDate: dataString[0], endDate: dataString[1] };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleImport = () => {
    this.setState({ importPanel: { visible: true, cust_order_nodup: true } });
  }
  handleCreate = () => {
    this.props.setClientForm(-2, {});
    this.props.emptyFlows();
    this.context.router.push('/scof/shipments/create');
  }
  handleRemove = (shipmtOrderNo) => {
    const { tenantId, loginId, username } = this.props;
    this.props.removeOrder({
      tenantId, loginId, username, shipmtOrderNo,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info(this.gmsg('deletedSuccess'));
        this.handleTableLoad();
      }
    });
  }
  handleBatchDelete = () => {
    const { selectedRowKeys } = this.state;
    const { username } = this.props;
    this.props.batchDelete(selectedRowKeys, username).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info(this.gmsg('deletedSuccess'));
        this.setState({
          selectedRowKeys: [],
        });
        this.handleTableLoad(1);
      }
    });
  }
  handleStart = (row) => {
    const { loginId, username } = this.props;
    const shipmtOrderNo = row.shipmt_order_no;
    this.props.acceptOrder({ loginId, username, shipmtOrderNo }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('订单流程已启动');
        this.handleTableLoad();
      }
    });
  }
  handleBatchStart = () => {
    const { selectedRowKeys } = this.state;
    const { username } = this.props;
    this.props.batchStart(selectedRowKeys, username).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('订单流程已启动');
        this.setState({
          selectedRowKeys: [],
        });
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = (currentPage) => {
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: currentPage || this.props.orders.current,
      filters: this.props.filters,
    });
  }
  handleSearch = (searchValue) => {
    const filters = { ...this.props.filters, order_no: searchValue };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
  }
  handleFilterMenuClick = (ev) => {
    const filters = ev.key === 'expedited' ?
      { ...this.props.filters, expedited: ev.key, progress: 'active' } :
      { ...this.props.filters, progress: ev.key, expedited: 'all' };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
    this.setState({ selectedRowKeys: [], status: ev.key });
  }
  handleExpeditedChange = (e) => {
    const filters = { ...this.props.filters, expedited: e.target.value };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
    this.setState({ selectedRowKeys: [] });
  }
  handleClientSelectChange = (value) => {
    const filters = { ...this.props.filters, partnerId: value };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
  }
  handleOrderTypeChange = (value) => {
    const filters = { ...this.props.filters, orderType: value === 'all' ? null : Number(value) };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
  }
  handleCreatorChange = (fieldsValue) => {
    const filters = { ...this.props.filters, ...fieldsValue, loginId: this.props.loginId };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      filters,
    });
  }
  handleImportClientChange = (customerPartnerId) => {
    this.props.loadPartnerFlowList({ partnerId: customerPartnerId });
    this.setState({
      importPanel: {
        ...this.state.importPanel,
        partner_id: customerPartnerId,
        flow_id: null,
      },
    });
  }
  handleImportFlowChange = (flowId) => {
    this.props.loadModelAdaptors(
      this.state.importPanel.partner_id,
      [LINE_FILE_ADAPTOR_MODELS.SOF_ORDER.key], flowId
    );
    this.setState({ importPanel: { ...this.state.importPanel, flow_id: flowId } });
  }
  handleImportCustNoChange = (ev) => {
    this.setState({ importPanel: { ...this.state.importPanel, cust_order_no: ev.target.value } });
  }
  handleCustOrderDupCheck = (ev) => {
    this.setState({
      importPanel: {
        ...this.state.importPanel,
        cust_order_nodup: ev.target.checked,
      },
    });
  }
  handleCheckUpload = (msg) => {
    if (!this.state.importPanel.flow_id) {
      if (msg) {
        message.warn('订单导入流程规则未选');
      }
      return false;
    }
    return true;
  }
  handleAdaptorChange = (adaptorCode) => {
    this.props.loadOrderAdaptor(adaptorCode).then((result) => {
      if (!result.error) {
        const adaptor = result.data;
        const noCustOrderNoField = adaptor.columns.filter(col => col.field === 'cust_order_no').length === 0;
        const noCustOrderNoDefault = adaptor.columnDefaults.filter(col => col.field === 'cust_order_no').length === 0;
        this.setState({
          importPanel: {
            ...this.state.importPanel,
            cust_order_no_input: noCustOrderNoField && noCustOrderNoDefault,
          },
        });
      }
    });
  }
  handleImportClose = () => {
    this.setState({
      importPanel: {
        visible: false,
      },
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleImportMenuClick = (ev) => {
    if (ev.key === 'logs') {
      this.props.togglePanelVisible(true);
    }
  }
  removeOrdersByBatchUpload = (uploadNo, uploadLogReload) => {
    this.props.batchDeleteByUploadNo(uploadNo).then((result) => {
      if (!result.error) {
        uploadLogReload();
        this.handleTableLoad(1);
      }
    });
  }
  handleExport = () => {
    this.props.toggleExportPanel(true);
  }
  render() {
    const {
      loading, filters, flows, partners,
    } = this.props;
    let dateVal = [];
    if (filters.endDate) {
      dateVal = [moment(filters.startDate, 'YYYY-MM-DD'), moment(filters.endDate, 'YYYY-MM-DD')];
    }
    const { importPanel } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const menu = (
      <Menu onClick={this.handleImportMenuClick}>
        <Menu.Item key="logs"><Icon type="profile" /> {this.gmsg('viewImportLogs')}</Menu.Item>
      </Menu>
    );
    const columns = [{
      title: '货运订单号/货主',
      width: 200,
      fixed: 'left',
      render: (o, record) => <OrderNoColumn order={record} />,
    }, {
      dataIndex: 'order_status',
      width: 80,
      render: (o, record) => {
        const percent = record.flow_node_num ?
          Number(((record.finish_num / record.flow_node_num) * 100).toFixed(1)) : 0;
        return (<div style={{ textAlign: 'center' }}><Progress type="circle" percent={percent} width={36} />
          <div className="mdc-text-grey table-font-small">
            <Tooltip title={`创建于${moment(record.created_date).format('YYYY.MM.DD HH:mm')}`} placement="bottom">
              <Icon type="clock-circle-o" /> {moment(record.created_date).fromNow()}
            </Tooltip>
          </div>
        </div>);
      },
    }, {
      title: '货运信息',
      width: 250,
      render: (o, record) => <ShipmentColumn shipment={record} />,
    }, {
      title: '跟单人员',
      dataIndex: 'exec_login_id',
      width: 100,
      render: lid => <UserAvatar showName size="small" loginId={lid} />,
    }, {
      title: '进度状态',
      render: (o, record) => <ProgressColumn order={record} />,
    }, {
      title: '操作',
      width: 88,
      fixed: 'right',
      render: (o, record) => {
        if (record.order_status === CRM_ORDER_STATUS.created) {
          return (
            <span>
              {record.flow_node_num > 0 &&
                <RowAction onClick={this.handleStart} tooltip={this.msg('startOrder')} icon="caret-right" row={record} />
              }
              <RowAction overlay={(
                <Menu onClick={this.handleMenuClick}>
                  <Menu.Item key="edit">
                    <Link to={`/scof/shipments/edit/${record.shipmt_order_no}`}><Icon type="edit" />修改</Link>
                  </Menu.Item>
                  <Menu.Item key="delete">
                    <Popconfirm title="确定删除?" onConfirm={() => this.handleRemove(record.shipmt_order_no)}>
                      <a><Icon type="delete" />删除</a>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>)}
              />
            </span>
          );
        }
        return (
          <div />
        );
      },
    }];
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadOrders(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        pageSizeOptions: ['10', '20', '30', '40', '100'],
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.orders,
    });
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        showSearch
        optionFilterProp="children"
        onChange={this.handleClientSelectChange}
        value={filters.partnerId ? filters.partnerId : 'all'}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部客户</Option>
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
      <CreatorSelect onChange={this.handleCreatorChange} />
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>
    );
    const bulkActions = (<span>
      {filters.progress === 'pending' &&
      <ToolbarAction icon="caret-right" onClick={this.handleBatchStart} label={this.msg('startOrder')} />}
      {filters.progress === 'pending' &&
      <ToolbarAction danger icon="delete" label={this.gmsg('delete')} confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleBatchDelete} />}
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('shipmentOrders')}>
          <PageHeader.Actions>
            <ToolbarAction icon="download" label={this.gmsg('export')} onClick={this.handleExport} />
            <ToolbarAction icon="upload" label={this.gmsg('import')} dropdown={menu} onClick={this.handleImport} />
            <ToolbarAction primary icon="plus" label={this.gmsg('create')} onClick={this.handleCreate} />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[this.state.status]} onClick={this.handleFilterMenuClick}>
              <Menu.Item key="all">
                {this.msg('allOrders')}
              </Menu.Item>
              <Menu.ItemGroup key="status" title={this.gmsg('status')}>
                <Menu.Item key="pending">
                  <Icon type="inbox" /> {this.msg('statusPending')}
                </Menu.Item>
                <Menu.Item key="active">
                  <Icon type="laptop" /> {this.msg('statusActive')}
                </Menu.Item>
                <Menu.Item key="expedited">
                  <Icon type="exclamation-circle" /> {this.msg('statusExpedited')}
                </Menu.Item>
                <Menu.Item key="completed">
                  <Icon type="check-square-o" /> {this.msg('statusCompleted')}
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </Drawer>
          <Content className="page-content" key="main">
            <DataTable
              noSetting
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              onDeselectRows={this.handleDeselectRows}
              dataSource={dataSource}
              columns={columns}
              rowKey="shipmt_order_no"
              loading={loading}
              minWidth={1200}
            />
          </Content>
        </Layout>
        <ShipmentDock reload={this.handleTableLoad} />
        <DelegationDock />
        <FreightDock />
        <ReceivingDock />
        <ShippingDock />
        <ImportDataPanel
          title="订单导入"
          visible={importPanel.visible}
          adaptors={this.props.adaptors}
          onAdaptorChange={this.handleAdaptorChange}
          endpoint={`${API_ROOTS.default}v1/sof/order/import`}
          formData={{
            customer_partner_id: importPanel.partner_id,
            flow_id: importPanel.flow_id,
            cust_order_no: importPanel.cust_order_no,
            cust_order_nodup: importPanel.cust_order_nodup,
          }}
          onClose={this.handleImportClose}
          onBeforeUpload={this.handleCheckUpload}
          onUploaded={(respData) => {
            if (respData.existOrderNos) {
              message.warn(<span>
                以下客户订单号已存在<br />
                {respData.existOrderNos.join(',').slice(0, 100)}</span>, 10);
            }
            this.handleImportClose();
            this.handleTableLoad();
            this.props.setUploadRecordsReload(true);
          }}
          template={`${XLSX_CDN}/订单导入模板.xlsx`}
          customizeOverwrite
        >
          <Form.Item label="客户">
            <Select
              placeholder="请选择客户"
              showSearch
              allowClear
              optionFilterProp="children"
              value={importPanel.partner_id}
              onChange={this.handleImportClientChange}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 360 }}
            >
              {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
            </Select>
          </Form.Item>
          <Form.Item label="流程">
            <Select
              placeholder="流程规则必填"
              showSearch
              allowClear
              value={importPanel.flow_id}
              onChange={this.handleImportFlowChange}
            >
              {flows.map(data => <Option key={data.id} value={data.id}>{data.name}</Option>)}
            </Select>
          </Form.Item>
          {importPanel.cust_order_no_input &&
          <Form.Item label="客户订单号">
            <Input value={importPanel.cust_order_no} onChange={this.handleImportCustNoChange} />
          </Form.Item>}
          <Form.Item>
            <Checkbox
              onChange={this.handleCustOrderDupCheck}
              checked={importPanel.cust_order_nodup}
            >忽略已存在客户单号
            </Checkbox>
          </Form.Item>
        </ImportDataPanel>
        <ExportDataPanel
          type={Object.keys(LINE_FILE_ADAPTOR_MODELS)[2]}
          formData={{}}
        />
        <UploadLogsPanel
          onUploadBatchDelete={this.removeOrdersByBatchUpload}
          type={UPLOAD_BATCH_OBJECT.SCOF_ORDER}
          formData={{}}
        />
      </Layout>
    );
  }
}
