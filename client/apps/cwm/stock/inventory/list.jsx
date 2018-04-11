import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Layout } from 'antd';
import Summary from 'client/components/Summary';
import connectNav from 'client/common/decorators/connect-nav';
import { loadStocks } from 'common/reducers/cwmInventoryStock';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { createFilename } from 'client/util/dataTransform';
import DataTable from 'client/components/DataTable';
import Drawer from 'client/components/Drawer';
import TrimSpan from 'client/components/trimSpan';
import { CWM_STOCK_SEARCH_TYPE } from 'common/constants';
import PageHeader from 'client/components/PageHeader';
import WhseSelect from '../../common/whseSelect';
import QueryForm from './queryForm';
import SKUPopover from '../../common/popover/skuPopover';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

function getNormalCol(text, row) {
  const colObj = { children: text, props: {} };
  if (row.key === 'wh_no') {
    colObj.props.colSpan = 0;
  }
  return colObj;
}

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
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
    loading: PropTypes.bool.isRequired,
    stocklist: PropTypes.shape({ current: PropTypes.number }).isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string }).isRequired,
  }
  state = {
    selectedRowKeys: [],
    stockQty: 0,
    availQty: 0,
    allocQty: 0,
    frozenQty: 0,
    bondedQty: 0,
    nonbondedQty: 0,
  }
  componentDidMount() {
    const filter = { ...this.props.listFilter, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  getTotalData = (data) => {
    const stockQty = data.reduce((prev, curr) => prev + curr.stock_qty, 0);
    const availQty = data.reduce((prev, curr) => prev + curr.avail_qty, 0);
    const allocQty = data.reduce((prev, curr) => prev + curr.alloc_qty, 0);
    const frozenQty = data.reduce((prev, curr) => prev + curr.frozen_qty, 0);
    const bondedQty = data.reduce((prev, curr) => prev + curr.bonded_qty, 0);
    const nonbondedQty = data.reduce((prev, curr) => prev + curr.nonbonded_qty, 0);
    return {
      stockQty, availQty, allocQty, frozenQty, bondedQty, nonbondedQty,
    };
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
    render: (text, row) => getNormalCol(<TrimSpan maxLen={15} text={text} />, row),
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
    render: (text, row) => getNormalCol(text, row),
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
    render: (text, row) => getNormalCol(text, row),
  }, {
    title: this.msg('availQty'),
    width: 100,
    dataIndex: 'avail_qty',
    align: 'right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-normal">{text}</span>;
      }
      return <span className="text-success">{text}</span>;
    },
  }, {
    title: this.msg('allocQty'),
    width: 100,
    dataIndex: 'alloc_qty',
    align: 'right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-normal">{text}</span>;
      }
      return <span className="text-warning">{text}</span>;
    },
  }, {
    title: this.msg('frozenQty'),
    width: 100,
    dataIndex: 'frozen_qty',
    align: 'right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-normal">{text}</span>;
      }
      return <span className="text-error">{text}</span>;
    },
  }, {
    title: this.msg('bondedQty'),
    width: 100,
    dataIndex: 'bonded_qty',
    align: 'right',
    render: (text, row) => getNormalCol(text, row),
  }, {
    title: this.msg('nonbondedQty'),
    width: 100,
    dataIndex: 'nonbonded_qty',
    align: 'right',
    render: (text, row) => getNormalCol(text, row),
  }, {
    title: this.msg('grossWeight'),
    dataIndex: 'gross_weight',
    align: 'right',
    width: 120,
    render: (text, row) => getNormalCol(text, row),
  }, {
    title: this.msg('cbm'),
    dataIndex: 'cbm',
    align: 'right',
    width: 120,
    render: (text, row) => getNormalCol(text, row),
  }]
  handleWhseChange = (value) => {
    const filter = { ...this.props.listFilter, whse_code: value };
    this.handleStockQuery(1, filter);
  }
  handleStockQuery = (currentPage, filter) => {
    const { listFilter, stocklist: { pageSize, current } } = this.props;
    this.props.loadStocks({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (!result.error) {
        const {
          stockQty, availQty, allocQty, frozenQty, bondedQty, nonbondedQty,
        } = this.getTotalData(result.data.data);
        this.setState({
          selectedRowKeys: [],
          stockQty,
          availQty,
          allocQty,
          frozenQty,
          bondedQty,
          nonbondedQty,
        });
      }
    });
  }
  handleSearch = (searchForm) => {
    const filter = {
      ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code,
    };
    this.handleStockQuery(1, filter);
  }
  handleExportExcel = () => {
    const { listFilter } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/stock/exportInventoryExcel/${createFilename('inventory')}.xlsx?filters=${
      JSON.stringify(listFilter)}`);
  }
  handleDeselectRows = () => {
    this.setState({
      selectedRowKeys: [],
      stockQty: 0,
      availQty: 0,
      allocQty: 0,
      frozenQty: 0,
      bondedQty: 0,
      nonbondedQty: 0,
    });
  }

  render() {
    const {
      loading, listFilter,
    } = this.props;
    const {
      stockQty, availQty, allocQty, frozenQty, bondedQty, nonbondedQty,
    } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selRows) => {
        let data = null;
        if (selectedRowKeys.length !== 0) {
          data = this.getTotalData(selRows);
        } else {
          data = this.getTotalData(this.props.stocklist.data);
        }
        this.setState({
          selectedRowKeys,
          stockQty: data.stockQty,
          availQty: data.availQty,
          allocQty: data.allocQty,
          frozenQty: data.frozenQty,
          bondedQty: data.bondedQty,
          nonbondedQty: data.nonbondedQty,
        });
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
    const totCol = (
      <Summary>
        <Summary.Item label="库存数量">{stockQty}</Summary.Item>
        <Summary.Item label="可用数量">{availQty}</Summary.Item>
        <Summary.Item label="分配数量">{allocQty}</Summary.Item>
        <Summary.Item label="冻结数量">{frozenQty}</Summary.Item>
        <Summary.Item label="保税数量">{bondedQty}</Summary.Item>
        <Summary.Item label="非保税数量">{nonbondedQty}</Summary.Item>
      </Summary>
    );
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            <WhseSelect onChange={this.handleWhseChange} />,
            this.msg('stockInventory'),
            this.msg(CWM_STOCK_SEARCH_TYPE[listFilter.search_type - 1].text),
          ]}
        >
          <PageHeader.Actions>
            <Button icon="export" onClick={this.handleExportExcel}>
              {this.msg('export')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={220}>
            <QueryForm onSearch={this.handleSearch} />
          </Drawer>
          <Content className="page-content" key="main">
            <DataTable
              selectedRowKeys={this.state.selectedRowKeys}
              onDeselectRows={this.handleDeselectRows}
              total={totCol}
              columns={this.columns}
              dataSource={dataSource}
              rowSelection={rowSelection}
              rowKey="id"
              loading={loading}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
