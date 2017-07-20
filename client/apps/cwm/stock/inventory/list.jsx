import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Select, message, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStocks, loadStockSearchOptions, loadLotStocks } from 'common/reducers/scvInventoryStock';
import Table from 'client/components/remoteAntTable';
import ButtonToggle from 'client/components/ButtonToggle';
import StockSearchForm from './searchForm';
import { formatMsg } from '../message.i18n';

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
    displayedColumns: state.scvInventoryStock.displayedColumns,
    listFilter: state.scvInventoryStock.listFilter,
    sortFilter: state.scvInventoryStock.sortFilter,
    searchOption: state.scvInventoryStock.searchOption,
  }),
  { loadStocks, loadLotStocks }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
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
    lot_query: false,
    collapsed: false,
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner',
    width: 150,
    sorter: true,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('sku'),
    dataIndex: 'product_sku',
    width: 150,
    sorter: true,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('product'),
    dataIndex: 'product_no',
    width: 150,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('descCN'),
    dataIndex: 'desc_cn',
    width: 150,
    sorter: true,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('whseLocation'),
    width: 120,
    dataIndex: 'whse_location',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('unit'),
    width: 120,
    dataIndex: 'unit',
    sorter: true,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('stockQty'),
    width: 100,
    dataIndex: 'avail_qty',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('allocQty'),
    width: 100,
    dataIndex: 'alloc_qty',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('frozenQty'),
    width: 100,
    dataIndex: 'frozen_qty',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('availQty'),
    width: 100,
    dataIndex: 'avail_qty',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('cbm'),
    dataIndex: 'cbm',
    render: (text, row) => this.renderNormalCol((row.unit_cbm * row.avail_stock).toFixed(2), row),
  }, {
    title: this.msg('grossWeight'),
    dataIndex: 'gross_weight',
    render: (text, row) => this.renderNormalCol(text, row),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.handleStockQuery(this.props.listFilter, params.sorter, params.current),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: false,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        current: pagination.current,
        sorter: {
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
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
    let prom;
    const { tenantId, stocklist: { pageSize }, sortFilter } = this.props;
    if (this.state.lot_query) {
      const lotColumn = {
        external_lot_no: false,
        serial_no: false,
        spec_date: false,
        unit_price: false,
        stock_cost: false,
      };
      if (filter.lot_property === 'unit_price') {
        lotColumn.unit_price = true;
        lotColumn.stock_cost = true;
      } else if (filter.lot_property === 'lot_no') {
        lotColumn.external_lot_no = true;
      } else if (filter.lot_property === 'serial_no') {
        lotColumn.serial_no = true;
      } else if (filter.lot_property === 'spec_date') {
        lotColumn.spec_date = true;
      }
      prom = this.props.loadLotStocks({
        tenantId,
        filter: JSON.stringify(filter),
        sorter: JSON.stringify(sorter || sortFilter),
        pageSize,
        current: newCurrent || 1,
      }, lotColumn);
    } else {
      prom = this.props.loadStocks({
        tenantId,
        filter: JSON.stringify(filter),
        sorter: JSON.stringify(sorter || sortFilter),
        pageSize,
        current: newCurrent || 1,
      });
    }
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSearch = (searchForm, checkLotProperty, lotProperty) => {
    const filter = { ...this.props.listFilter, ...searchForm };
    if (checkLotProperty) {
      this.state.lot_query = true;
      filter.lot_property = lotProperty;
    } else {
      this.state.lot_query = false;
      filter.lot_property = null;
    }
    this.handleStockQuery(filter);
  }
  handleWarehouseSelect = (whno) => {
    const filter = { ...this.props.listFilter,
      wh_no: whno,
      group_by_sku: whno !== '_all_' ? false : this.props.listFilter.group_by_sku };
    this.handleStockQuery(filter);
  }
  handleSkuGroupCheck = (ev) => {
    const filter = { ...this.props.listFilter, group_by_sku: ev.target.checked };
    this.handleStockQuery(filter);
  }
  renderNormalCol(text, row) {
    const colObj = { children: text, props: {} };
    if (row.key === 'wh_no') {
      colObj.props.colSpan = 0;
    }
    return colObj;
  }
  render() {
    const { stocklist, loading, listFilter, displayedColumns, searchOption: { warehouses } } = this.props;
    const columns = this.columns.filter(col => displayedColumns[col.dataIndex] !== false);
    if (listFilter.wh_no === '_all_' && !listFilter.group_by_sku) {
      const data = [];
      const whnoMap = {};
      stocklist.data.forEach((row) => {
        if (!whnoMap[row.whse_name]) {
          whnoMap[row.whse_name] = [row];
        } else {
          whnoMap[row.whse_name].push(row);
        }
      });
      let total = stocklist.totalCount;
      Object.keys(whnoMap).forEach((whno) => {
        data.push({ key: 'wh_no', id: whno, value: whno });
        data.push(...whnoMap[whno]);
        total += 1;
      });
      this.dataSource.remotes = {
        totalCount: total,
        current: stocklist.current,
        pageSize: data.length > stocklist.pageSize ? data.length : stocklist.pageSize,
        data,
      };
    } else {
      this.dataSource.remotes = stocklist;
    }
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
                {this.msg('stock')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('inventory')}
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
            </Breadcrumb>}
            <ButtonToggle size="large"
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <span />
            <Select size="large" value={listFilter.wh_no} style={{ width: 200 }} onSelect={this.handleWarehouseSelect}>
              {
                warehouses.map(whse => <Option key={whse.id} value={whse.wh_no}>{whse.whse_name}</Option>)
              }
            </Select>
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
