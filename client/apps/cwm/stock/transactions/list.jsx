import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Select, Layout, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadTransactions } from 'common/reducers/cwmTransaction';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import QueryForm from './queryForm';
import { transactionColumns, commonTraceColumns } from '../commonColumns';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    tenantId: state.account.tenantId,
    loading: state.cwmTransaction.loading,
    transactionlist: state.cwmTransaction.list,
    listFilter: state.cwmTransaction.listFilter,
    sortFilter: state.cwmTransaction.sortFilter,
  }),
  { loadTransactions, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class StockTransactionsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    transactionlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    sortFilter: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    selectedRowKeys: [],
  }
  componentDidMount() {
    const filter = { ...this.props.listFilter, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner_name',
    width: 150,
    sorter: true,
    fixed: 'left',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('productNo'),
    dataIndex: 'product_no',
    width: 180,
    sorter: true,
    fixed: 'left',

  }, {
    title: this.msg('descCN'),
    dataIndex: 'name',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
    sorter: true,
  }].concat(transactionColumns(this.props.intl)).concat(commonTraceColumns(this.props.intl))
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    const filter = { ...this.props.listFilter, whse_code: value };
    this.handleStockQuery(1, filter);
  }
  handleStockQuery = (currentPage, filter) => {
    const { tenantId, sortFilter, listFilter, transactionlist: { pageSize, current } } = this.props;
    this.props.loadTransactions({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
      sorter: JSON.stringify(sortFilter),
    });
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  render() {
    const { defaultWhse, whses, loading, listFilter } = this.props;
    const columns = this.columns;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new DataTable.DataSource({
      fetcher: (params) => { this.props.loadTransactions(params); this.setState({ selectedRowKeys: [] }); },
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
        const params = {
          tenantId: this.props.tenantId,
          current: pagination.current,
          pageSize: pagination.pageSize,
          filter: JSON.stringify(listFilter),
          sorter: JSON.stringify({
            field: sorter.field,
            order: sorter.order === 'descend' ? 'DESC' : 'ASC',
          }),
        };
        return params;
      },
      remotes: this.props.transactionlist,
    });

    return (
      <Layout>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))}
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              库存流水
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button size="large" icon="export">
              {this.msg('export')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <Card noHovering style={{ marginBottom: 16 }} bodyStyle={{ paddingBottom: 8 }}>
            <QueryForm onSearch={this.handleSearch} />
          </Card>
          <DataTable selectedRowKeys={this.state.selectedRowKeys} bordered
            columns={columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" loading={loading}
          />
        </Content>
      </Layout>
    );
  }
}
