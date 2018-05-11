import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Dropdown, Form, Menu, Layout, Select, Tag, DatePicker } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import UserAvatar from 'client/components/UserAvatar';
import ToolbarAction from 'client/components/ToolbarAction';
import ImportDataPanel from 'client/components/ImportDataPanel';
import UploadLogsPanel from 'client/components/UploadLogsPanel';
import { loadPartners } from 'common/reducers/partner';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import { loadInvoices, deleteSofInvice, batchDeleteInvoices, batchDeleteByUploadNo, loadInvoiceCategories, loadInvoiceBuyerSellers } from 'common/reducers/sofInvoice';
import { setUploadRecordsReload, togglePanelVisible } from 'common/reducers/uploadRecords';
import { loadModelAdaptors } from 'common/reducers/hubDataAdapter';
import { PARTNER_ROLES, LINE_FILE_ADAPTOR_MODELS, UPLOAD_BATCH_OBJECT } from 'common/constants';
import { createFilename } from 'client/util/dataTransform';
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
    getParams: (pagination, tblfilters) => {
      const newfilters = { ...this.props.filter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
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
    const { selectedRowKeys } = this.state;
    window.open(`${API_ROOTS.default}v1/scof/invoices/${createFilename('invoices')}.xlsx?invoiceNos=${selectedRowKeys}`);
  }
  columns = [{
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
    width: 150,
    fixed: 'left',
  }, {
    title: this.msg('invoiceDate'),
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY-MM-DD'),
    width: 100,
  }, {
    title: this.msg('buyer'),
    dataIndex: 'buyer',
    width: 180,
    render: o => this.props.buyers.find(buyer => buyer.partner_id === Number(o)) &&
    this.props.buyers.find(buyer => buyer.partner_id === Number(o)).name,
  }, {
    title: this.msg('seller'),
    dataIndex: 'seller',
    width: 180,
    render: o => this.props.sellers.find(seller => seller.partner_id === Number(o)) &&
    this.props.sellers.find(seller => seller.partner_id === Number(o)).name,
  }, {
    title: this.msg('poNo'),
    dataIndex: 'po_no',
  }, {
    title: this.msg('totalQty'),
    dataIndex: 'total_qty',
    align: 'right',
    width: 120,
  }, {
    title: this.msg('totalNetWt'),
    dataIndex: 'total_net_wt',
    align: 'right',
    width: 120,
  }, {
    title: this.msg('totalAmount'),
    dataIndex: 'total_amount',
    align: 'right',
    width: 120,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 100,
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
    if (columns.filter(col => col.dataIndex === 'invoice_category')[0]) {
      columns.splice(2, 1, {
        title: this.msg('category'),
        dataIndex: 'invoice_category',
        width: 120,
        filters: this.props.invoiceCategories.map(cate => ({
          text: cate.category, value: cate.category,
        })),
        onFilter: (value, record) =>
          record.invoice_category && record.invoice_category.indexOf(value) !== -1,
      });
    } else {
      columns.splice(2, 0, {
        title: this.msg('category'),
        dataIndex: 'invoice_category',
        width: 120,
        filters: this.props.invoiceCategories.map(cate => ({
          text: cate.category, value: cate.category,
        })),
        onFilter: (value, record) =>
          record.invoice_category && record.invoice_category.indexOf(value) !== -1,
      });
    }
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
        <Menu.Item key="logs">{this.gmsg('importLogs')}</Menu.Item>
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
        style={{ width: '100%' }}
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
            <Dropdown.Button icon="upload" onClick={this.handleImport} overlay={menu}>
              {this.gmsg('batchImport')}
            </Dropdown.Button>
            <Button type="primary" icon="plus" onClick={this.handleCreate} >{this.msg('createInvoice')}</Button>
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
          <UploadLogsPanel
            onUploadBatchDelete={this.removeInvoiceByBatchUpload}
            type={UPLOAD_BATCH_OBJECT.SCOF_INVOICE}
          />
        </Content>
      </Layout>
    );
  }
}
