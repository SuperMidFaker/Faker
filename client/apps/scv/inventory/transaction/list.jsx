import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { DatePicker, Breadcrumb, Button, Select, message, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStockTransactions, loadStockSearchOptions } from 'common/reducers/scvInventoryTransaction';
import Table from 'client/components/remoteAntTable';
import ButtonToggle from 'client/components/ButtonToggle';
import StockSearchForm from './searchForm';
import SkuDetailList from './skuDetails';
import { formatMsg } from '../message.i18n';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch }) {
  const proms = [];
  proms.push(dispatch(loadStockSearchOptions(state.account.tenantId)));
  proms.push(dispatch(loadStockTransactions({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ ...state.scvInventoryTransaction.listFilter,
      start_date: moment().startOf('day').unix(),
      end_date: moment().add(1, 'day').startOf('day').unix(),
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
    rowKeys: [],
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('sku'),
    dataIndex: 'sku_no',
    width: 80,
  }, {
    title: this.msg('product'),
    dataIndex: 'product_no',
    width: 100,
  }, {
    title: this.msg('category'),
    dataIndex: 'product_category',
    width: 100,
  }, {
    title: this.msg('lotNo'),
    width: 100,
    dataIndex: 'lot_no',
    // sorter: true,
    render: () => this.props.listFilter.lot_no,
  }, {
    title: this.msg('serialNo'),
    width: 100,
    dataIndex: 'serial_no',
    // sorter: true,
    render: () => this.props.listFilter.serial_no,
  }, {
    title: this.msg('startDate'),
    width: 80,
    dataIndex: 'start_date',
    render: () => moment.unix(this.props.listFilter.start_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('startStock'),
    width: 80,
    dataIndex: 'pre_stock',
  }, {
    title: this.msg('inboundQty'),
    width: 80,
    dataIndex: 'inbound_qty',
    render: qty => <span className="mdc-text-green">{qty}</span>,
  }, {
    title: this.msg('outboundQty'),
    width: 80,
    dataIndex: 'outbound_qty',
    render: qty => <span className="mdc-text-red">{qty}</span>,
  }, {
    title: this.msg('endDate'),
    width: 80,
    dataIndex: 'end_date',
    render: () => moment.unix(this.props.listFilter.end_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('endStock'),
    width: 80,
    dataIndex: 'post_stock',
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.handleStockQuery(this.props.listFilter, params.sorter, params.current),
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
        current: pagination.current,
        sorter: {
          field: sorter.field,
          order: sorter.sortOrder === 'DESCEND' ? 'desc' : 'asc',
        },
      };
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
    this.setState({ rowKeys: [] });
    const { tenantId, stocklist: { pageSize }, sortFilter } = this.props;
    this.props.loadStockTransactions({
      tenantId,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(sorter || sortFilter),
      pageSize,
      current: newCurrent || 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSearch = (searchForm, checkLotProperty) => {
    const filter = {
      wh_no: this.props.listFilter.wh_no,
      pageSize: this.props.listFilter.pageSize,
      current: this.props.listFilter.current,
      ...searchForm,
      start_date: this.props.listFilter.start_date,
      end_date: this.props.listFilter.end_date };
    this.setState({ lot_query: checkLotProperty });
    this.handleStockQuery(filter);
  }
  handleWarehouseSelect = (whno) => {
    const filter = { ...this.props.listFilter, wh_no: whno };
    this.handleStockQuery(filter);
  }
  handleRangeChange = (newdates) => {
    const filter = { ...this.props.listFilter,
      start_date: newdates[0].unix(),
      end_date: newdates[1].unix() };
    this.handleStockQuery(filter);
  }
  handleRowExpand = (expands) => {
    this.setState({ rowKeys: expands });
  }
  renderExpandRow = row => <SkuDetailList sku_no={row.sku_no} filter={this.props.listFilter} />
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
          <div className="page-header">
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
          <Header className="page-header">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('inventory')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('inventoryTransaction')}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <ButtonToggle
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <span />
            <Select value={listFilter.wh_no} style={{ width: 200 }} onSelect={this.handleWarehouseSelect}>
              <Option value="_all_" key="_all_">{this.msg('allWarehouses')}</Option>
              {
                warehouses.map(whse => <Option key={whse.id} value={whse.wh_no}>{whse.whse_name}</Option>)
              }
            </Select>
            <span />
            {!this.state.lot_query &&
              <RangePicker onChange={this.handleRangeChange}
                value={[moment.unix(listFilter.start_date), moment.unix(listFilter.end_date)]}
              />
            }
            <div className="page-header-tools">
              <Button type="primary" icon="export" ghost>
                {this.msg('exportInventory')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="panel-body table-panel table-fixed-layout">
                <Table columns={columns} dataSource={this.dataSource} loading={loading} rowKey="id" scroll={{ x: 1200 }}
                  expandedRowRender={this.renderExpandRow} onExpandedRowsChange={this.handleRowExpand}
                  expandedRowKeys={this.state.rowKeys}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
