import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Select, Tag } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import { loadPartners } from 'common/reducers/partner';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import { loadInvoices } from 'common/reducers/sofInvoice';
import { PARTNER_ROLES } from 'common/constants';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Option } = Select;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadCmsParams()));
  promises.push(dispatch(loadInvoices({
    filter: JSON.stringify({ ...state.sofInvoice.filter, searchText: '' }),
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
  }),
  {
    loadInvoices,
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
  msg = formatMsg(this.props.intl)
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
  }, {
    title: '发票日期',
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY-MM-DD'),
  }, {
    title: '状态',
    dataIndex: 'invoice_status',
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
    title: '购买方',
    dataIndex: 'buyer',
    render: o => this.props.partners.find(partner => partner.id === Number(o)) &&
    this.props.partners.find(partner => partner.id === Number(o)).name,
  }, {
    title: '销售方',
    dataIndex: 'seller',
    render: o => this.props.partners.find(partner => partner.id === Number(o)) &&
    this.props.partners.find(partner => partner.id === Number(o)).name,
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
  }, {
    title: '总金额',
    dataIndex: 'total_amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
    render: o => this.props.currencies.find(curr => curr.curr_code === o) &&
    this.props.currencies.find(curr => curr.curr_code === o).curr_name,
  }, {
    title: '总数量',
    dataIndex: 'total_qty',
  }, {
    title: '总净重',
    dataIndex: 'total_net_wt',
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    fixed: 'right',
    render: (o, record) => <RowAction onClick={this.handleDetail} icon="form" tooltip="明细" row={record} />,
  }]
  handleCreate = () => {
    this.context.router.push('/scof/invoices/create');
  }
  handleDetail = (row) => {
    this.context.router.push(`/scof/invoices/edit/${row.invoice_no}`);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.handleReload(filter);
  }
  handleReload = (filter) => {
    this.props.loadInvoices({
      filter: JSON.stringify(filter),
      pageSize: this.props.invoiceList.pageSize,
      current: this.props.invoiceList.current,
    });
  }
  render() {
    const {
      invoiceList, partners, loading,
    } = this.props;
    this.dataSource.remotes = invoiceList;
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
      >
        <Option value="all" key="all">全部</Option>
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
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
            <Button icon="upload" onClick={this.handleImport}>
              {this.msg('importInvoices')}
            </Button>
            <Button type="primary" icon="plus" onClick={this.handleCreate} >{this.msg('createInvoice')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            dataSource={this.dataSource}
            columns={this.columns}
            loading={loading}
            rowKey="id"
          />
        </Content>
      </Layout>
    );
  }
}
