import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, message, Layout } from 'antd';
import moment from 'moment';
import QueueAnim from 'rc-queue-anim';
import { loadInboundTransactions } from 'common/reducers/cwmTransaction';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadInboundTransactions({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cwmTransaction.listFilter),
    sorter: JSON.stringify(state.cwmTransaction.sortFilter),
    pageSize: state.cwmTransaction.list.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    inboundlist: state.cwmTransaction.list,
    listFilter: state.cwmTransaction.listFilter,
    sortFilter: state.cwmTransaction.sortFilter,
  }),
  { loadInboundTransactions }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class InboundTransactionsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('warehouse'),
    width: 140,
    dataIndex: 'wh_name',
  }, {
    title: this.msg('inboundNo'),
    dataIndex: 'transaction_no',
    width: 120,
  }, {
    title: this.msg('inboundDate'),
    dataIndex: 'inbound_timestamp',
    width: 120,
    render: time => time && moment.unix(time).format('YYYY.MM.DD'),
  }, {
    title: 'SKU',
    width: 100,
    dataIndex: 'sku_no',
  }, {
    title: this.msg('actualQty'),
    width: 100,
    dataIndex: 'inbound_qty',
  }, {
    title: this.msg('postQty'),
    width: 100,
    dataIndex: 'post_qty',
  }, {
    title: this.msg('lotserialNo'),
    width: 120,
    dataIndex: 'serial_no',
    render: (o, row) => {
      if (row.external_lot_no && row.serial_no) {
        return `${row.external_lot_no}/${row.serial_no}`;
      } else if (row.external_lot_no) {
        return row.external_lot_no;
      } else if (row.serial_no) {
        return row.serial_no;
      }
    },
  }, {
    title: this.msg('vendor'),
    width: 120,
    dataIndex: 'vendor_name',
    /*
  }, {
    title: this.msg('ASN'),
    width: 200,
    dataIndex: 'asn_no',
    */
  }, {
    title: this.msg('unitPrice'),
    width: 120,
    dataIndex: 'unit_price',
  }, {
    title: this.msg('manufexpiryDate'),
    width: 200,
    dataIndex: 'specific_date',
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadInboundTransactions(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: false,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: JSON.stringify({
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        }),
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.inboundlist,
  })
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, sku: value };
    this.props.loadInboundTransactions({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(this.props.sortFilter),
      pageSize: this.props.inboundlist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { loading, inboundlist } = this.props;
    this.dataSource.remotes = inboundlist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('inbound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('inboundTransactions')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="toolbar-right" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('inboundListSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="id" scroll={{ x: 1400 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
