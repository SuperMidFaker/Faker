import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Card, Select, Layout, Tooltip, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadTransactions } from 'common/reducers/cwmTransaction';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import Table from 'client/components/remoteAntTable';
import TrimSpan from 'client/components/trimSpan';
import QueryForm from './queryForm';
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
  }, {
    title: '操作人',
    width: 100,
    dataIndex: 'trxn_login_name',
  }, {
    title: '操作类型',
    width: 100,
    dataIndex: 'type',
    /* render: (text) => {
      if (text > 0) {
        return <span className="text-success">{text}</span>;
      } else {
        return <span className="text-disabled">{text}</span>;
      }
    }, */
  }, {
    title: '操作数量',
    width: 100,
    dataIndex: 'transaction_qty',
    className: 'cell-align-right text-emphasis',
    render: (text) => {
      if (text > 0) {
        return <span className="text-success">{text}</span>;
      } else {
        return <span className="text-disabled">{text}</span>;
      }
    },
  }, {
    title: this.msg('traceId'),
    width: 120,
    dataIndex: 'trace_id',
  }, {
    title: this.msg('SKU'),
    dataIndex: 'product_sku',
    width: 180,
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
    title: this.msg('inboundDate'),
    width: 120,
    dataIndex: 'inbound_timestamp',
    render: inbtime => inbtime && moment(inbtime).format('YYYY.MM.DD'),
    sorter: true,
  }, {
    title: this.msg('expiryDate'),
    width: 120,
    dataIndex: 'expiry_date',
    render: expirydate => expirydate && moment(expirydate).format('YYYY.MM.DD'),
    sorter: true,
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
    render: attr7date => attr7date && moment(attr7date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('attrib8'),
    width: 120,
    dataIndex: 'attrib_8_date',
    render: attr8date => attr8date && moment(attr8date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('bonded'),
    width: 120,
    dataIndex: 'bonded',
    render: bonded => bonded ? '是' : '否',
  }, {
    title: this.msg('portion'),
    width: 120,
    dataIndex: 'portion',
    render: portion => portion ? '是' : '否',
  }, {
    title: this.msg('ftzEntryId'),
    width: 120,
    dataIndex: 'ftz_ent_filed_id',
  }, {
    title: this.msg('grossWeight'),
    dataIndex: 'gross_weight',
    className: 'cell-align-right',
    width: 120,
  }, {
    title: this.msg('cbm'),
    dataIndex: 'cbm',
    className: 'cell-align-right',
    width: 120,
  }]
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleStockQuery = (currentPage, filter) => {
    const { tenantId, sortFilter, transactionlist: { pageSize, current } } = this.props;
    this.props.loadTransactions({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: currentPage || current,
      sorter: JSON.stringify(sortFilter),
    });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  handleWarehouseSelect = (whno) => {
    const filter = { ...this.props.listFilter, whse_code: whno };
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
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadTransactions(params),
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
          <div className="page-body">
            <div className="toolbar">
              <div className="toolbar-right">
                <Tooltip title="显示字段设置">
                  <Button size="large" icon="setting" />
                </Tooltip>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={columns} rowSelection={rowSelection} dataSource={dataSource} loading={loading} rowKey="id" bordered
                scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
              />
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}
