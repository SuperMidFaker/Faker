import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Breadcrumb, Layout, Select, Table, Tag, Tooltip } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingInboundList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '收货通知单号',
    dataIndex: 'rn_no',
    width: 160,
  }, {
    title: '货物属性',
    width: 90,
    dataIndex: 'bonded',
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">保税</Tag>);
      } else if (o === 0) {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '仓库',
    width: 200,
    dataIndex: 'whse_code',
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_code',
  }, {
    title: '关联订单号',
    width: 200,
    dataIndex: 'ref_order_no',
  }, {
    title: '入库单号',
    width: 200,
    dataIndex: 'stock_in_no',
  }, {
    title: '入库日期',
    dataIndex: 'stock_in_date',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      if (o === 0) {
        return (<Tag>未入库</Tag>);
      } else if (o === 1) {
        return (<Tag color="#87d068">已入库</Tag>);
      }
    },
  }, {
    title: '收货锁定',
    dataIndex: 'receiving_lock',
    width: 80,
    render: (o) => {
      if (o === 1) {
        return (<Tooltip title="由WMS上传实际收货记录"><Icon type="lock" /></Tooltip>);
      } else if (o === 2) {
        return (<Tooltip title="已指派APP收货"><Icon type="lock" /></Tooltip>);
      }
    },
  }, {
    title: '操作',
    width: 100,
    render: (o, record) => {
      if (record.status === 0 && record.receiving_lock === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="收货" row={record} /><span className="ant-divider" /><RowUpdater label="派单" row={record} /></span>);
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else if (record.status === 1) {

      }
    },
  }]

  dataSource = [{
    id: '1',
    rn_no: 'N04601170548',
    bonded: 1,
    whse_code: '0961|希雅路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7IR2730',
    status: 0,
    receiving_lock: 0,
  }, {
    id: '2',
    rn_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 0,
    receiving_lock: 1,
  }, {
    id: '3',
    rn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 0,
    receiving_lock: 2,
  }, {
    id: '4',
    rn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 1,
    receiving_lock: 0,
  }, {
    id: '5',
    rn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 1,
    receiving_lock: 0,
  }];

  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleReceive = (row) => {
    const link = `/cwm/receiving/inbound/receive/${row.rn_no}`;
    this.context.router.push(link);
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('receiving')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleClientSelectChange} defaultValue="all"
              >
                <Option value="all">全部仓库</Option>
              </Select>
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleClientSelectChange} defaultValue="all"
              >
                <Option value="all">全部货主</Option>
              </Select>
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 100 }}
                onChange={this.handleClientSelectChange} defaultValue="all"
              >
                <Option value="all">所有状态</Option>
                <Option value="pending">未确认</Option>
                <Option value="confirmed">已确认</Option>
                <Option value="completed">已入库</Option>
              </Select>
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
