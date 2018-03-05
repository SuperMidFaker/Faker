import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Dropdown, Menu, Layout, Select, Tag, DatePicker } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import UserAvatar from 'client/components/UserAvatar';
import { loadPartners } from 'common/reducers/partner';
import ImportDataPanel from 'client/components/ImportDataPanel';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import { loadInvoices, deleteSofInvice, batchDeleteInvoices } from 'common/reducers/sofInvoice';
import { loadModelAdaptors } from 'common/reducers/hubDataAdapter';
import { PARTNER_ROLES, LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
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
    tenantId: state.account.tenantId,
    role: PARTNER_ROLES.CUS,
  })));
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
  }),
  {
    loadInvoices, loadModelAdaptors, deleteSofInvice, batchDeleteInvoices,
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
  columns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '发票日期',
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY-MM-DD'),
    width: 100,
  }, {
    title: '购买方',
    dataIndex: 'buyer',
    width: 200,
    render: o => this.props.partners.find(partner => partner.id === Number(o)) &&
    this.props.partners.find(partner => partner.id === Number(o)).name,
  }, {
    title: '销售方',
    dataIndex: 'seller',
    width: 200,
    render: o => this.props.partners.find(partner => partner.id === Number(o)) &&
    this.props.partners.find(partner => partner.id === Number(o)).name,
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
  }, {
    title: '总数量',
    dataIndex: 'total_qty',
    align: 'right',
    width: 120,
  }, {
    title: '总净重',
    dataIndex: 'total_net_wt',
    align: 'right',
    width: 120,
  }, {
    title: '总金额',
    dataIndex: 'total_amount',
    align: 'right',
    width: 120,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 100,
    render: o => this.props.currencies.find(curr => curr.curr_code === o) &&
    this.props.currencies.find(curr => curr.curr_code === o).curr_name,
  }, {
    title: '状态',
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
    title: '创建时间',
    dataIndex: 'created_date',
    width: 140,
    render: createdate => createdate && moment(createdate).format('YYYY.MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 120,
    render: lid => <UserAvatar size="small" loginId={lid} showName />,
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    width: 60,
    align: 'right',
    fixed: 'right',
    render: (o, record) => (<span>
      <RowAction onClick={this.handleDetail} icon="edit" tooltip="编辑" row={record} />
    </span>),
  }]
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
  }
  handleDelete = (row) => {
    this.props.deleteSofInvice(row.invoice_no).then((result) => {
      if (!result.error) {
        const { selectedRowKeys } = this.state;
        const newKeys = selectedRowKeys.filter(key => key !== row.id);
        this.setState({
          selectedRowKeys: newKeys,
        });
        const { filter } = this.props;
        this.handleReload(filter);
      }
    });
  }
  handleBatchDelete = () => {
    const { selectedRows } = this.state;
    const invoiceNos = selectedRows.map(row => row.invoice_no);
    this.props.batchDeleteInvoices(invoiceNos).then((result) => {
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
  handlePartnerChange = (partnerId) => {
    this.props.loadModelAdaptors(partnerId, [LINE_FILE_ADAPTOR_MODELS.SCOF_INVOICE.key]);
  }
  render() {
    const {
      invoiceList, partners, loading, filter,
    } = this.props;
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
        <Menu.Item key="logs">{this.msg('importLogs')}</Menu.Item>
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
        style={{ width: 200 }}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
        onSelect={this.handleSelect}
      >
        <Option value="all" key="all">全部</Option>
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    const bulkActions = (<span>
      <Button icon="download" onClick={this.handleExport}>{this.gmsg('export')}</Button>
      <Button type="danger" icon="delete" onClick={this.handleBatchDelete}>{this.gmsg('delete')}</Button>
    </span>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('invoices')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
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
            handleDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            loading={loading}
            rowKey="id"
          />
          <ImportDataPanel
            title={this.msg('batchImportInvoices')}
            visible={this.state.importPanelVisible}
            adaptors={this.props.adaptors}
            endpoint={`${API_ROOTS.default}v1/scof/invoices/import`}
            formData={{}}
            onClose={() => { this.setState({ importPanelVisible: false }); }}
            onUploaded={this.invoicesUploaded}
            template={`${XLSX_CDN}/发票导入模板.xlsx`}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              allowClear
              optionFilterProp="children"
              onChange={this.handlePartnerChange}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 360 }}
              style={{ width: '100%' }}
            >
              {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
            </Select>
          </ImportDataPanel>
        </Content>
      </Layout>
    );
  }
}
