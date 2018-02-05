import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Select, Tag } from 'antd';
import { loadFlowList, loadFlowTrackingFields, openCreateFlowModal, openFlow, reloadFlowList,
  editFlow, toggleFlowDesigner, toggleFlowStatus } from 'common/reducers/scofFlow';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES } from 'common/constants';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Option } = Select;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadFlowList({
    filter: JSON.stringify({ ...state.scofFlow.listFilter, name: '', status: '' }),
    pageSize: state.scofFlow.flowList.pageSize,
    current: state.scofFlow.flowList.current,
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
    reload: state.scofFlow.reloadFlowList,
    loading: state.scofFlow.flowListLoading,
    listFilter: state.scofFlow.listFilter,
    flowList: state.scofFlow.flowList,
    designerVisible: state.scofFlow.flowDesigner.visible,
    partners: state.partner.partners,
    users: state.account.userMembers,
  }),
  {
    openCreateFlowModal,
    loadFlowList,
    loadFlowTrackingFields,
    openFlow,
    reloadFlowList,
    editFlow,
    toggleFlowDesigner,
    toggleFlowStatus,
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
  componentWillMount() {
    this.props.loadFlowTrackingFields();
  }
  msg = formatMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadFlowList(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, tblfilters) => {
      const newfilters = { ...this.props.listFilter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.flowList,
  })
  columns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '发票日期',
    dataIndex: 'invoice_date',
  }, {
    title: '状态',
    dataIndex: 'status',
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
  }, {
    title: '销售方',
    dataIndex: 'seller',
  }, {
    title: '采购订单号',
    dataIndex: 'order_no',
  }, {
    title: '总金额',
    dataIndex: 'total_amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
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

  render() {
    const {
      flowList, loading, partners, listFilter,
    } = this.props;
    this.dataSource.remotes = flowList;
    const toolbarActions = (<span>
      <SearchBox
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
      />
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 200 }}
        onChange={this.handleClientSelectChange}
        value={listFilter.ownerPartnerId}
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
