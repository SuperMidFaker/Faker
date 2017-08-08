import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Select, Layout, Tooltip, message } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { showTransitionDock, loadStockSearchOptions, loadStocks } from 'common/reducers/cwmInventoryStock';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import Table from 'client/components/remoteAntTable';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import QueryForm from './queryForm';
import TransitionDockPanel from './dock/transitionDockPanel';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;
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
  { showTransitionDock, loadStockSearchOptions, loadStocks, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class StockTransitionList extends React.Component {
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
    selectedRowKeys: [],
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
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('SKU'),
    dataIndex: 'product_sku',
    width: 180,
    sorter: true,
    render: (text, row) => this.renderNormalCol(text, row),
  }, {
    title: this.msg('descCN'),
    dataIndex: 'desc_cn',
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
    dataIndex: 'inbound_date',
    sorter: true,
  }, {
    title: this.msg('expiryDate'),
    width: 120,
    dataIndex: 'expiry_date',
    sorter: true,
  }, {
    title: this.msg('lotNo'),
    width: 120,
    dataIndex: 'external_lot_no',
  }, {
    title: this.msg('serialNo'),
    width: 120,
    dataIndex: 'serial_no',
  }, {
    title: this.msg('virtualWhse'),
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: this.msg('damageLevel'),
    width: 120,
    dataIndex: 'damage_level',
  }, {
    title: this.msg('attrib1'),
    width: 120,
    dataIndex: 'attrib_1_string',
  }, {
    title: this.msg('attrib2'),
    width: 120,
    dataIndex: 'attrib_2_string',
  }, {
    title: this.msg('attrib3'),
    width: 120,
    dataIndex: 'attrib_3_string',
  }, {
    title: this.msg('attrib4'),
    width: 120,
    dataIndex: 'attrib_4_string',
  }, {
    title: this.msg('attrib5'),
    width: 120,
    dataIndex: 'attrib_5_string',
  }, {
    title: this.msg('attrib6'),
    width: 120,
    dataIndex: 'attrib_6_string',
  }, {
    title: this.msg('attrib7'),
    width: 120,
    dataIndex: 'attrib_7_date',
  }, {
    title: this.msg('attrib8'),
    width: 120,
    dataIndex: 'attrib_8_date',
  }, {
    title: this.msg('traceId'),
    width: 120,
    dataIndex: 'trace_id',
  }, {
    title: this.msg('totalQty'),
    width: 100,
    dataIndex: 'total_qty',
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
    title: this.msg('bonded'),
    width: 120,
    dataIndex: 'bonded',
  }, {
    title: this.msg('portion'),
    width: 120,
    dataIndex: 'portion',
  }, {
    title: this.msg('ftzEntryId'),
    width: 120,
    dataIndex: 'ftz_ent_filed_id',
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
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => (<span>
      <RowUpdater onHit={this.handleShowDock} label="变更" row={record} />
      <span className="ant-divider" />
      <RowUpdater onHit={this.handleSplit} label="拆分" row={record} />
    </span>),
  }]
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
  handleShowDock = () => {
    this.props.showTransitionDock();
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
    // const columns = this.columns.filter(col => displayedColumns[col.dataIndex] !== false);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new Table.DataSource({
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
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                    whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                  }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              库存变更
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <Card noHovering style={{ marginBottom: 16 }}>
            <QueryForm onSearch={this.handleSearch} />
          </Card>
          <div className="page-body">
            <div className="toolbar">
              <div className="toolbar-right">
                <Tooltip title="显示字段设置">
                  <Button size="large" icon="setting" />
                </Tooltip>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length > 1 ? '' : 'hide'}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                <Button>批量转移</Button>
                <Button>批量移库</Button>
                <Button>批量冻结</Button>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} loading={loading} rowKey="id" bordered
                scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
              />
            </div>
          </div>
          <TransitionDockPanel />
        </Content>
      </Layout>
    );
  }
}