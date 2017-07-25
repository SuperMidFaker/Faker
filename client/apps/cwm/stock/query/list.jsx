import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Select, Layout, message } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStockSearchOptions, loadStocks } from 'common/reducers/cwmInventoryStock';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import Table from 'client/components/remoteAntTable';
import StockSearchForm from './searchForm';
import { formatMsg } from '../message.i18n';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  const proms = [];
  proms.push(dispatch(loadStockSearchOptions(state.account.tenantId)));
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    tenantId: state.account.tenantId,
    loading: state.cwmInventoryStock.loading,
    stocklist: state.cwmInventoryStock.list,
    displayedColumns: state.cwmInventoryStock.displayedColumns,
    listFilter: state.cwmInventoryStock.listFilter,
    sortFilter: state.cwmInventoryStock.sortFilter,
    searchOption: state.cwmInventoryStock.searchOption,
  }),
  { loadStockSearchOptions, loadStocks, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class StockQueryList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    stocklist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    sortFilter: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      warehouses: PropTypes.arrayOf(PropTypes.shape({ whse_code: PropTypes.string })),
    }),
  }
  state = {
    collapsed: false,
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner_name',
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
    title: this.msg('Location'),
    width: 120,
    dataIndex: 'location',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('unit'),
    width: 120,
    dataIndex: 'unit',
    sorter: true,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('totalQty'),
    width: 100,
    dataIndex: 'total_qty',
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
    title: this.msg('cbm'),
    dataIndex: 'cbm',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('grossWeight'),
    dataIndex: 'gross_weight',
    render: (text, row) => this.renderNormalCol(text, row),
  }]
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleStockQuery = (filter) => {
    const { tenantId, stocklist: { pageSize, current } } = this.props;
    this.props.loadStocks({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current,
    });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(filter);
  }
  handleWarehouseSelect = (whno) => {
    const filter = { ...this.props.listFilter, whse_code: whno };
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
    const { defaultWhse, whses, loading, displayedColumns } = this.props;
    const columns = this.columns.filter(col => displayedColumns[col.dataIndex] !== false);
    const dataSource = new Table.DataSource({
      fetcher: () => this.handleStockQuery(this.props.listFilter),
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
    });
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
                <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {
                    whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                  }
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('query')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <StockSearchForm onSearch={this.handleSearch} />
        </Sider>
        <Layout>
          <Header className="top-bar">
            <div className="top-bar-tools">
              <Button type="primary" size="large" icon="export" ghost>
                {this.msg('exportInventory')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="panel-body table-panel">
                <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" scroll={{ x: 1200 }} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
