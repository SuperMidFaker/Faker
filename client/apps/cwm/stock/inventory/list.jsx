import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Select, Layout, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStocks } from 'common/reducers/cwmInventoryStock';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { createFilename } from 'client/util/dataTransform';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import QueryForm from './queryForm';
import SKUPopover from '../../common/popover/skuPopover';
import { formatMsg } from '../message.i18n';
import { CWM_STOCK_SEARCH_TYPE } from 'common/constants';
import PageHeader from 'client/components/PageHeader';

const { Content } = Layout;
const Option = Select.Option;

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
  }),
  { loadStocks, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class StockInventoryList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    stocklist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    sortFilter: PropTypes.object.isRequired,
  }
  state = {
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
    width: 180,
    sorter: true,
    fixed: 'left',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('productNo'),
    dataIndex: 'product_no',
    width: 180,
    sorter: true,
    fixed: 'left',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('SKU'),
    dataIndex: 'product_sku',
    width: 200,
    sorter: true,
    render: (o, row) => o && (<SKUPopover ownerPartnerId={row.owner_partner_id} sku={o} />),
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
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('inboundDate'),
    width: 120,
    dataIndex: 'inbound_timestamp',
    sorter: true,
    render: o => o && moment(o).format('YYYY.MM.DD'),
  }, {
    title: this.msg('totalQty'),
    width: 100,
    dataIndex: 'stock_qty',
    className: 'cell-align-right text-emphasis',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('availQty'),
    width: 100,
    dataIndex: 'avail_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-normal">{text}</span>;
      } else {
        return <span className="text-success">{text}</span>;
      }
    },
  }, {
    title: this.msg('allocQty'),
    width: 100,
    dataIndex: 'alloc_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-normal">{text}</span>;
      } else {
        return <span className="text-warning">{text}</span>;
      }
    },
  }, {
    title: this.msg('frozenQty'),
    width: 100,
    dataIndex: 'frozen_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-normal">{text}</span>;
      } else {
        return <span className="text-error">{text}</span>;
      }
    },
  }, {
    title: this.msg('bondedQty'),
    width: 100,
    dataIndex: 'bonded_qty',
    className: 'cell-align-right',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('nonbondedQty'),
    width: 100,
    dataIndex: 'nonbonded_qty',
    className: 'cell-align-right',
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('grossWeight'),
    dataIndex: 'gross_weight',
    className: 'cell-align-right',
    width: 120,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('cbm'),
    dataIndex: 'cbm',
    className: 'cell-align-right',
    width: 120,
    render: (text, row) => this.renderNormalCol(text, row),
  }]
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    const filter = { ...this.props.listFilter, whse_code: value };
    this.handleStockQuery(1, filter);
  }
  handleStockQuery = (currentPage, filter) => {
    const { tenantId, listFilter, stocklist: { pageSize, current } } = this.props;
    this.props.loadStocks({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  handleExportExcel = () => {
    const { tenantId, listFilter } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/stock/exportInventoryExcel/${createFilename('inventory')}.xlsx?tenantId=${tenantId}&filters=${
      JSON.stringify(listFilter)}`);
  }
  renderNormalCol(text, row) {
    const colObj = { children: text, props: {} };
    if (row.key === 'wh_no') {
      colObj.props.colSpan = 0;
    }
    return colObj;
  }
  render() {
    const { defaultWhse, whses, loading, listFilter } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadStocks(params),
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
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {
                      whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                    }
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                库存余量
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg(CWM_STOCK_SEARCH_TYPE[listFilter.search_type - 1].text)}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button size="large" icon="export" onClick={this.handleExportExcel}>
              {this.msg('export')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <Card noHovering bodyStyle={{ paddingBottom: 16 }}>
            <QueryForm onSearch={this.handleSearch} />
          </Card>
          <DataTable selectedRowKeys={this.state.selectedRowKeys} scrollOffset={390}
            columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" loading={loading}
          />
        </Content>
      </Layout>
    );
  }
}
