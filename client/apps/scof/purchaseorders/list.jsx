import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, DatePicker } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import UserAvatar from 'client/components/UserAvatar';
import ToolbarAction from 'client/components/ToolbarAction';
import ImportDataPanel from 'client/components/ImportDataPanel';
import ExportDataPanel from 'client/components/ExportDataPanel';
import { loadParams } from 'common/reducers/cmsParams';
import { loadInvoiceBuyerSellers } from 'common/reducers/sofInvoice';
import { toggleExportPanel } from 'common/reducers/saasExport';
import { loadPurchaseOrders, batchDeletePurchaseOrders } from 'common/reducers/sofPurchaseOrders';
import { setUploadRecordsReload, togglePanelVisible } from 'common/reducers/uploadRecords';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { RangePicker } = DatePicker;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadParams()));
  promises.push(dispatch(loadPurchaseOrders({
    filter: JSON.stringify({
      ...state.sofPurchaseOrders.filter, searchText: '', partner: 'all', startDate: '', endDate: '',
    }),
    pageSize: state.sofPurchaseOrders.purchaseOrderList.pageSize,
    current: state.sofPurchaseOrders.purchaseOrderList.current,
  })));
  promises.push(dispatch(loadInvoiceBuyerSellers()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    filter: state.sofPurchaseOrders.filter,
    purchaseOrderList: state.sofPurchaseOrders.purchaseOrderList,
    currencies: state.cmsParams.currencies,
    loading: state.sofInvoice.loading,
    uploadRecords: state.uploadRecords.uploadRecords,
    buyers: state.sofInvoice.buyers,
    sellers: state.sofInvoice.sellers,
    countries: state.cmsParams.countries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    trxnModes: state.cmsParams.trxnModes.map(trxn => ({
      value: trxn.trx_mode,
      text: trxn.trx_spec,
    })),
    transModes: state.cmsParams.transModes.map(trans => ({
      value: trans.trans_code,
      text: trans.trans_spec,
    })),
    units: state.cmsParams.units.map(unit => ({
      value: unit.unit_code,
      text: unit.unit_name,
    })),
  }),
  {
    batchDeletePurchaseOrders,
    setUploadRecordsReload,
    togglePanelVisible,
    loadPurchaseOrders,
    toggleExportPanel,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class PurchaseOrderList extends React.Component {
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
  }
  onDateChange = (data, dataString) => {
    const filter = { ...this.props.filter, startDate: dataString[0], endDate: dataString[1] };
    this.props.loadPurchaseOrders({
      filter: JSON.stringify(filter),
      pageSize: this.props.purchaseOrderList.pageSize,
      current: 1,
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadPurchaseOrders(params),
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
    remotes: this.props.purchaseOrderList,
  })

  columns = [{
    title: this.msg('poNo'),
    dataIndex: 'po_no',
    width: 150,
    fixed: 'left',
  }, {
    title: this.msg('customer'),
    dataIndex: 'customer_partner_id',
    width: 200,
    render: o => this.props.buyers.find(buyer => buyer.partner_id === Number(o)) &&
    this.props.buyers.find(buyer => buyer.partner_id === Number(o)).name,
  }, {
    title: this.msg('customerCntry'),
    dataIndex: 'customer_country',
    width: 120,
    render: o => this.props.countries.find(cntry => cntry.value === o) &&
    this.props.countries.find(cntry => cntry.value === o).text,
  }, {
    title: this.msg('supplier'),
    dataIndex: 'supplier_partner_id',
    width: 200,
    render: o => this.props.sellers.find(seller => seller.partner_id === Number(o)) &&
    this.props.sellers.find(seller => seller.partner_id === Number(o)).name,
  }, {
    title: this.msg('supplierCntry'),
    dataIndex: 'supplier_country',
    width: 120,
    render: o => this.props.countries.find(cntry => cntry.value === o) &&
    this.props.countries.find(cntry => cntry.value === o).text,
  }, {
    title: this.msg('trxnMode'),
    dataIndex: 'trxn_mode',
    width: 120,
    render: o => this.props.trxnModes.find(trxn => trxn.value === o) &&
    this.props.trxnModes.find(trxn => trxn.value === o).text,
  }, {
    title: this.msg('transMode'),
    dataIndex: 'trans_mode',
    width: 120,
    render: o => this.props.transModes.find(trans => trans.value === o) &&
    this.props.transModes.find(trans => trans.value === o).text,
  }, {
    title: this.msg('productNo'),
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 120,
  }, {
    title: this.msg('virtualWhse'),
    dataIndex: 'virtual_whse',
    width: 120,
  }, {
    title: this.msg('brand'),
    dataIndex: 'brand',
    width: 120,
  }, {
    title: this.msg('orderQty'),
    dataIndex: 'order_qty',
    align: 'right',
    width: 120,
  }, {
    title: this.msg('unitPrice'),
    dataIndex: 'unit_price',
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
    title: this.msg('netWt'),
    dataIndex: 'net_wt',
    align: 'right',
    width: 120,
  }, {
    title: this.msg('wtUnit'),
    dataIndex: 'wt_unit',
    align: 'right',
    width: 120,
    render: o => this.props.units.find(unit => unit.value === o) &&
    this.props.units.find(unit => unit.value === o).text,
  }, {
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
    width: 120,
  }, {
    title: this.msg('shippingDate'),
    dataIndex: 'shipping_date',
    render: o => o && moment(o).format('YYYY-MM-DD'),
    width: 100,
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
  }]
  handleDetail = (row) => {
    this.context.router.push(`/scof/purchaseorders/edit/${row.po_no}`);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.handleReload(filter, 1);
  }
  handleReload = (filter, currentPage) => {
    this.props.loadPurchaseOrders({
      filter: JSON.stringify(filter),
      pageSize: this.props.purchaseOrderList.pageSize,
      current: currentPage || this.props.purchaseOrderList.current,
    });
  }
  handleImport = () => {
    this.setState({
      importPanelVisible: true,
    });
  }
  handleExport = () => {
    this.props.toggleExportPanel(true);
  }
  handleSelect = (value) => {
    const filter = { ...this.props.filter, partner: value };
    this.handleReload(filter, 1);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  }
  purchaseOrdersUploaded = () => {
    const { filter } = this.props;
    this.handleReload(filter);
    this.setState({
      importPanelVisible: false,
    });
    this.props.setUploadRecordsReload(true);
  }
  handleBatchDelete = () => {
    const { selectedRowKeys } = this.state;
    this.props.batchDeletePurchaseOrders(selectedRowKeys).then((result) => {
      if (!result.error) {
        this.handleDeselectRows();
        const { filter } = this.props;
        this.props.loadPurchaseOrders({
          filter: JSON.stringify(filter),
          pageSize: this.props.purchaseOrderList.pageSize,
          current: 1,
        });
      }
    });
  }
  handleMenuClick = (ev) => {
    if (ev.key === 'logs') {
      this.props.togglePanelVisible(true);
    }
  }
  render() {
    const {
      purchaseOrderList, loading, filter,
    } = this.props;
    let dateVal = [];
    if (filter.endDate) {
      dateVal = [moment(filter.startDate, 'YYYY-MM-DD'), moment(filter.endDate, 'YYYY-MM-DD')];
    }
    this.dataSource.remotes = purchaseOrderList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    const toolbarActions = (<span>
      <SearchBox
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
      />
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
        <PageHeader title={this.msg('purchaseOrders')}>
          <PageHeader.Actions>
            <ToolbarAction icon="download" label={this.gmsg('export')} onClick={this.handleExport} />
            <ToolbarAction icon="upload" label={this.gmsg('import')} onClick={this.handleImport} />
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
            columns={this.columns}
            loading={loading}
            rowKey="id"
          />
          <ImportDataPanel
            title={this.msg('batchImportPurchaseOrders')}
            visible={this.state.importPanelVisible}
            endpoint={`${API_ROOTS.default}v1/scof/purchase/orders/import`}
            formData={{}}
            onClose={() => { this.setState({ importPanelVisible: false }); }}
            onUploaded={this.purchaseOrdersUploaded}
            template={`${XLSX_CDN}/采购订单导入模板.xlsx`}
          />
          <ExportDataPanel
            type={Object.keys(LINE_FILE_ADAPTOR_MODELS)[4]}
            formData={{}}
          />
        </Content>
      </Layout>
    );
  }
}
