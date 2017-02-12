import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Checkbox, Select, message, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStocks, loadStockSearchOptions } from 'common/reducers/scvInventoryStock';
import Table from 'client/components/remoteAntTable';
import StockSearchForm from './searchForm';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  const proms = [];
  proms.push(dispatch(loadStockSearchOptions(state.account.tenantId)));
  proms.push(dispatch(loadStocks({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.scvInventoryStock.listFilter),
    sorter: JSON.stringify(state.scvInventoryStock.sortFilter),
    pageSize: state.scvInventoryStock.list.pageSize,
    current: state.scvInventoryStock.list.current,
  })));
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.scvInventoryStock.loading,
    stocklist: state.scvInventoryStock.list,
    listFilter: state.scvInventoryStock.listFilter,
    sortFilter: state.scvInventoryStock.sortFilter,
    searchOption: state.scvInventoryStock.searchOption,
  }),
  { loadStocks }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class InventoryStockList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    stocklist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    sortFilter: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      warehouses: PropTypes.arrayOf(PropTypes.shape({ wh_no: PropTypes.string })),
    }),
  }
  state = {
    collapsed: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      const { tenantId, listFilter, stocklist: { pageSize } } = nextProps;
      nextProps.loadStocks({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current: 1,
      });
    }
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('warehouse'),
    dataIndex: 'wh_name',
    width: 140,
  }, {
    title: this.msg('finishedProduct'),
    dataIndex: 'sku_no',
    width: 100,
  }, {
    title: this.msg('category'),
    dataIndex: 'product_category',
    width: 120,
  }, {
    title: this.msg('stockPlan'),
    width: 80,
    dataIndex: 'avail_stock',
  }, {
    title: this.msg('unitPrice'),
    width: 80,
    dataIndex: 'unit_price',
  }, {
    title: this.msg('stockCost'),
    width: 80,
    dataIndex: 'stock_cost',
  }, {
    title: this.msg('cbmPerSku'),
    width: 80,
    dataIndex: 'unit_cbm',
  }, {
    title: this.msg('cbm'),
    width: 60,
    dataIndex: 'cbm',
    render: (o, row) => (row.unit_cbm * row.avail_stock).toFixed(2),
  }, {
    title: this.msg('cartonLength'),
    width: 80,
    dateIndex: 'length',
  }, {
    title: this.msg('cartonWidth'),
    width: 80,
    dateIndex: 'width',
  }, {
    title: this.msg('cartonHeight'),
    width: 80,
    dateIndex: 'height',
  }, {
    title: this.msg('productDesc'),
    width: 160,
    dataIndex: 'product_desc',
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadStocks(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.stocklist,
  })
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm };
    const { tenantId, stocklist: { pageSize }, sortFilter } = this.props;
    this.props.loadStocks({
      tenantId,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(sortFilter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { stocklist, loading, searchOption: { warehouses } } = this.props;
    this.dataSource.remotes = stocklist;
    return (
      <Layout>
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('inventory')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('inventoryStock')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <StockSearchForm onSearch={this.handleSearch} />
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('inventory')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('inventoryStock')}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <span />
            <Select size="large" defaultValue="all" style={{ width: 200 }}>
              <Option value="all">全部仓库</Option>
              {
                warehouses.map(whse => <Option key={whse.id} value={whse.wh_no}>{whse.wh_name}</Option>)
              }
            </Select>
            <span />
            <Checkbox>按SKU合并</Checkbox>
            <div className="top-bar-tools">
              <Button type="primary" size="large" icon="export" ghost>
                {this.msg('exportInventory')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="panel-body table-panel">
                <Table columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="id" scroll={{ x: 1200 }} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
