import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { DatePicker, Breadcrumb, Button, Select, message, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStockTransactions, loadStockSearchOptions } from 'common/reducers/scvInventoryTransaction';
import Table from 'client/components/remoteAntTable';
import StockSearchForm from './searchForm';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch }) {
  const proms = [];
  proms.push(dispatch(loadStockSearchOptions(state.account.tenantId)));
  proms.push(dispatch(loadStockTransactions({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ ...state.scvInventoryTransaction.listFilter,
      start_date: new Date(),
      end_date: new Date(),
    }),
    sorter: JSON.stringify(state.scvInventoryTransaction.sortFilter),
    pageSize: state.scvInventoryTransaction.list.pageSize,
    current: state.scvInventoryTransaction.list.current,
  })));
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.scvInventoryTransaction.loading,
    stocklist: state.scvInventoryTransaction.list,
    displayedColumns: state.scvInventoryTransaction.displayedColumns,
    listFilter: state.scvInventoryTransaction.listFilter,
    sortFilter: state.scvInventoryTransaction.sortFilter,
    searchOption: state.scvInventoryTransaction.searchOption,
  }),
  { loadStockTransactions }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class InventoryTransactionList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    stocklist: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      warehouses: PropTypes.arrayOf(PropTypes.shape({ wh_no: PropTypes.string })),
    }),
  }
  state = {
    lot_query: false,
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
    title: this.msg('sku'),
    dataIndex: 'sku_no',
    width: 100,
  }, {
    title: this.msg('product'),
    dataIndex: 'product_no',
    width: 100,
  }, {
    title: this.msg('category'),
    dataIndex: 'product_category',
    width: 120,
  }, {
    title: this.msg('startDate'),
    width: 80,
    dataIndex: 'start_date',
    render: text => moment(text).format('YYYY.MM.DD'),
  }, {
    title: this.msg('startStock'),
    width: 80,
    dataIndex: 'pre_stock',
  }, {
    title: this.msg('inboundQty'),
    width: 80,
    dataIndex: 'inbound_qty',
  }, {
    title: this.msg('outboundQty'),
    width: 80,
    dataIndex: 'outbound_qty',
  }, {
    title: this.msg('endDate'),
    width: 80,
    dataIndex: 'end_date',
    render: text => moment(text).format('YYYY.MM.DD'),
  }, {
    title: this.msg('endStock'),
    width: 80,
    dataIndex: 'post_stock',
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
  handleStockQuery = (filter, sorter, newCurrent) => {
    const { tenantId, stocklist: { pageSize }, sortFilter } = this.props;
    this.props.loadStockTransactions({
      tenantId,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(sorter || sortFilter),
      pageSize,
      current: newCurrent || 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleSearch = (searchForm, checkLotProperty) => {
    const filter = { ...this.props.listFilter, ...searchForm };
    if (checkLotProperty) {
      this.state.lot_query = true;
    } else {
      this.state.lot_query = false;
    }
    this.handleStockQuery(filter);
  }
  handleWarehouseSelect = (whno) => {
    const filter = { ...this.props.listFilter, wh_no: whno };
    this.handleStockQuery(filter);
  }
  handleRangeChange = (newdates) => {
    const filter = { ...this.props.listFilter, start_date: newdates[0], end_date: newdates[1] };
    this.handleStockQuery(filter);
  }
  render() {
    const { stocklist, loading, listFilter, displayedColumns, searchOption: { warehouses } } = this.props;
    const columns = this.columns.filter(col => displayedColumns[col.dataIndex] !== false);
    this.dataSource.remotes = stocklist;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
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
                {this.msg('inventoryTransaction')}
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
                {this.msg('inventoryTransaction')}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <span />
            <Select size="large" value={listFilter.wh_no} style={{ width: 200 }} onSelect={this.handleWarehouseSelect}>
              <Option value="_all_" key="_all_">{this.msg('allWarehouses')}</Option>
              {
                warehouses.map(whse => <Option key={whse.id} value={whse.wh_no}>{whse.wh_name}</Option>)
              }
            </Select>
            <span />
            { !this.state.lot_query &&
              <RangePicker size="large" onChange={this.handleRangeChange} value={[moment(listFilter.start_date), moment(listFilter.end_date)]} />
            }
            <div className="top-bar-tools">
              <Button type="primary" size="large" icon="export" ghost>
                {this.msg('exportInventory')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="panel-body table-panel">
                <Table columns={columns} dataSource={this.dataSource} loading={loading} rowKey="id" scroll={{ x: 1200 }} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
