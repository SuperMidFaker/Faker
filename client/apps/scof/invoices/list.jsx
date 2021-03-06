import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Form, Menu, Layout, Select, Tag, DatePicker } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import EmptyState from 'client/components/EmptyState';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import UserAvatar from 'client/components/UserAvatar';
import ToolbarAction from 'client/components/ToolbarAction';
import ImportDataPanel from 'client/components/ImportDataPanel';
import ExportDataPanel from 'client/components/ExportDataPanel';
import UploadLogsPanel from 'client/components/UploadLogsPanel';
import { loadPartners } from 'common/reducers/partner';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import { loadInvoices, deleteSofInvice, batchDeleteInvoices, batchDeleteByUploadNo, loadInvoiceCategories, loadInvoiceBuyerSellers } from 'common/reducers/sofInvoice';
import { setUploadRecordsReload, togglePanelVisible } from 'common/reducers/uploadRecords';
import { toggleExportPanel } from 'common/reducers/saasExport';
import { loadModelAdaptors } from 'common/reducers/hubDataAdapter';
import { PARTNER_ROLES, LINE_FILE_ADAPTOR_MODELS, UPLOAD_BATCH_OBJECT } from 'common/constants';
// import { createFilename } from 'client/util/dataTransform';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadCmsParams()));
  promises.push(dispatch(loadInvoices({
    filter: JSON.stringify({
      ...state.sofInvoice.filter, searchText: '', partner: 'all', startDate: '', endDate: '',
    }),
    pageSize: state.sofInvoice.invoiceList.pageSize,
    current: state.sofInvoice.invoiceList.current,
  })));

  promises.push(dispatch(loadPartners({
    role: [PARTNER_ROLES.CUS, PARTNER_ROLES.SUP],
  })));
  promises.push(dispatch(loadInvoiceCategories()));
  promises.push(dispatch(loadInvoiceBuyerSellers()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    filter: state.sofInvoice.filter,
    invoiceList: state.sofInvoice.invoiceList,
    partners: state.partner.partners,
    currencies: state.cmsManifest.params.currencies,
    loading: state.sofInvoice.loading,
    adaptors: state.hubDataAdapter.modelAdaptors,
    uploadRecords: state.uploadRecords.uploadRecords,
    invoiceCategories: state.sofInvoice.invoiceCategories,
    buyers: state.sofInvoice.buyers,
    sellers: state.sofInvoice.sellers,
  }),
  {
    loadInvoices,
    loadModelAdaptors,
    deleteSofInvice,
    batchDeleteInvoices,
    batchDeleteByUploadNo,
    setUploadRecordsReload,
    togglePanelVisible,
    toggleExportPanel,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class InvoiceList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    importPanelVisible: false,
    selectedRows: [],
    selectedRowKeys: [],
    buyer: '',
    seller: '',
  }
  componentDidMount() {
    this.props.loadModelAdaptors('', [LINE_FILE_ADAPTOR_MODELS.SCOF_INVOICE.key]);
  }
  onDateChange = (data, dataString) => {
    const filter = { ...this.props.filter, startDate: dataString[0], endDate: dataString[1] };
    this.props.loadInvoices({
      filter: JSON.stringify(filter),
      pageSize: this.props.invoiceList.pageSize,
      current: 1,
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadInvoices(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: Number(resolve(result.totalCount, result.current, result.pageSize)),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: Number(result.pageSize),
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(this.props.filter),
      };
      return params;
    },
    remotes: this.props.invoiceList,
  })
  handleCreate = () => {
    this.context.router.push('/scof/invoices/create');
  }
  handleDetail = (row) => {
    this.context.router.push(`/scof/invoices/edit/${row.invoice_no}`);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.handleReload(filter, 1);
  }
  handleReload = (filter, currentPage) => {
    this.props.loadInvoices({
      filter: JSON.stringify(filter),
      pageSize: this.props.invoiceList.pageSize,
      current: currentPage || this.props.invoiceList.current,
    });
  }
  handleImport = () => {
    this.setState({
      importPanelVisible: true,
    });
  }
  handleSelect = (value) => {
    const filter = { ...this.props.filter, partner: value };
    this.handleReload(filter, 1);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  }
  invoicesUploaded = () => {
    const { filter } = this.props;
    this.handleReload(filter);
    this.setState({
      importPanelVisible: false,
    });
    this.props.setUploadRecordsReload(true);
  }
  handleDelete = (row) => {
    this.props.deleteSofInvice(row.invoice_no).then((result) => {
      if (!result.error) {
        const { selectedRowKeys } = this.state;
        const newKeys = selectedRowKeys.filter(key => key !== row.invoice_no);
        this.setState({
          selectedRowKeys: newKeys,
        });
        const { filter } = this.props;
        this.handleReload(filter);
      }
    });
  }
  handleBatchDelete = () => {
    const { selectedRowKeys } = this.state;
    this.props.batchDeleteInvoices(selectedRowKeys).then((result) => {
      if (!result.error) {
        this.handleDeselectRows();
        const { filter } = this.props;
        this.props.loadInvoices({
          filter: JSON.stringify(filter),
          pageSize: this.props.invoiceList.pageSize,
          current: 1,
        });
      }
    });
  }
  handleBuyerChange = (buyer) => {
    this.setState({
      buyer,
    });
  }
  handleSellerChange = (seller) => {
    this.setState({
      seller,
    });
  }
  handleMenuClick = (ev) => {
    if (ev.key === 'logs') {
      this.props.togglePanelVisible(true);
    }
  }
  removeInvoiceByBatchUpload = (uploadNo, uploadLogReload) => {
    const invoiceFilter = this.props.filter;
    this.props.batchDeleteByUploadNo(uploadNo).then((result) => {
      if (!result.error) {
        uploadLogReload();
        this.handleReload(invoiceFilter);
      }
    });
  }
  handleExport = () => {
    this.props.toggleExportPanel(true);
  }
  columns = [{
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
    width: 180,
    fixed: 'left',
  }, {
    title: this.msg('invoiceDate'),
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY-MM-DD'),
    width: 100,
  }, {
    title: this.msg('buyer'),
    dataIndex: 'buyer',
    width: 200,
    render: o => this.props.buyers.find(buyer => buyer.partner_id === Number(o)) &&
    this.props.buyers.find(buyer => buyer.partner_id === Number(o)).name,
  }, {
    title: this.msg('seller'),
    dataIndex: 'seller',
    width: 200,
    render: o => this.props.sellers.find(seller => seller.partner_id === Number(o)) &&
    this.props.sellers.find(seller => seller.partner_id === Number(o)).name,
  }, {
    title: this.msg('poNo'),
    dataIndex: 'po_no',
    width: 180,
  }, {
    title: this.msg('totalQty'),
    dataIndex: 'total_qty',
    align: 'right',
    width: 150,
  }, {
    title: this.msg('totalNetWt'),
    dataIndex: 'total_net_wt',
    align: 'right',
    width: 150,
  }, {
    title: this.msg('totalAmount'),
    dataIndex: 'total_amount',
    align: 'right',
    width: 150,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 150,
    render: o => this.props.currencies.find(curr => curr.curr_code === o) &&
    this.props.currencies.find(curr => curr.curr_code === o).curr_name,
  }, {
    title: this.msg('status'),
    dataIndex: 'invoice_status',
    width: 100,
    render: (o) => {
      switch (o) {
        case 0:
          return <Tag>{this.msg('toShip')}</Tag>;
        case 1:
          return <Tag color="orange">{this.msg('partialShipped')}</Tag>;
        case 2:
          return <Tag color="green">{this.msg('shipped')}</Tag>;
        default:
          return null;
      }
    },
  }, {
    title: this.gmsg('createdDate'),
    dataIndex: 'created_date',
    width: 140,
    render: createdate => createdate && moment(createdate).format('YYYY.MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: this.gmsg('createdBy'),
    dataIndex: 'created_by',
    width: 120,
    render: lid => <UserAvatar size="small" loginId={lid} showName />,
  }, {
    dataIndex: 'SPACER_COL',
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    width: 60,
    className: 'table-col-ops',
    fixed: 'right',
    render: (o, record) => (<span>
      <RowAction onClick={this.handleDetail} icon="edit" tooltip="编辑" row={record} />
    </span>),
  }];
  render() {
    const {
      invoiceList, partners, loading, filter, buyers, sellers,
    } = this.props;
    const columns = [...this.columns];
    columns.splice(1, 0, {
      title: this.msg('category'),
      dataIndex: 'invoice_category',
      width: 120,
      filters: this.props.invoiceCategories.map(cate => ({
        text: cate.category, value: cate.category,
      })),
      onFilter: (value, record) =>
        record.invoice_category && record.invoice_category.indexOf(value) !== -1,
    });
    let dateVal = [];
    if (filter.endDate) {
      dateVal = [moment(filter.startDate, 'YYYY-MM-DD'), moment(filter.endDate, 'YYYY-MM-DD')];
    }
    this.dataSource.remotes = invoiceList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="logs"><Icon type="profile" /> {this.gmsg('viewImportLogs')}</Menu.Item>
      </Menu>
    );
    const toolbarActions = (<span>
      <SearchBox
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
      />
      <Select
        showSearch
        optionFilterProp="children"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
        onSelect={this.handleSelect}
      >
        <Option value="all" key="all">{this.gmsg('all')}</Option>
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    const bulkActions = (<span>
      <ToolbarAction icon="download" onClick={this.handleExport} label={this.gmsg('export')} />
      <ToolbarAction danger icon="delete" label={this.gmsg('delete')} confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleBatchDelete} />
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('invoices')}>
          <PageHeader.Actions>
            <ToolbarAction icon="download" label={this.gmsg('export')} onClick={this.handleExport} />
            <ToolbarAction icon="upload" label={this.gmsg('import')} dropdown={menu} onClick={this.handleImport} />
            <ToolbarAction primary icon="plus" label={this.gmsg('create')} onClick={this.handleCreate} />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            bulkActions={bulkActions}
            dataSource={this.dataSource}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            columns={columns}
            loading={loading}
            rowKey="invoice_no"
            locale={{
              emptyText: <EmptyState
                header={this.msg('invoiceEmpty')}
                primaryAction={<ToolbarAction primary icon="plus" label={this.gmsg('createInvoice')} onClick={this.handleCreate} />}
              />,
            }}
          />
          <ImportDataPanel
            title={this.msg('batchImportInvoices')}
            visible={this.state.importPanelVisible}
            adaptors={this.props.adaptors}
            endpoint={`${API_ROOTS.default}v1/scof/invoices/import`}
            formData={{ buyer: this.state.buyer, seller: this.state.seller }}
            onClose={() => { this.setState({ importPanelVisible: false }); }}
            onUploaded={this.invoicesUploaded}
            template={`${XLSX_CDN}/发票导入模板.xlsx`}
          >
            <Form.Item label={this.msg('buyer')}>
              <Select
                placeholder={this.msg('selectBuyer')}
                showSearch
                allowClear
                optionFilterProp="children"
                onChange={this.handleBuyerChange}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 360 }}
              >
                {buyers.map(data => (<Option key={data.partner_id} value={data.partner_id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
              </Select>
            </Form.Item>
            <Form.Item label={this.msg('seller')}>
              <Select
                placeholder={this.msg('selectSeller')}
                showSearch
                allowClear
                optionFilterProp="children"
                onChange={this.handleSellerChange}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 360 }}
              >
                {sellers.map(data => (<Option key={data.partner_id} value={data.partner_id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
              </Select>
            </Form.Item>
          </ImportDataPanel>
          <ExportDataPanel
            type={Object.keys(LINE_FILE_ADAPTOR_MODELS)[3]}
            formData={{}}
          />
          <UploadLogsPanel
            onUploadBatchDelete={this.removeInvoiceByBatchUpload}
            type={UPLOAD_BATCH_OBJECT.SCOF_INVOICE}
          />
        </Content>
      </Layout>
    );
  }
}
