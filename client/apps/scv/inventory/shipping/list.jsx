import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Radio, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ShippingOrderList extends React.Component {
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
    title: this.msg('shippingNo'),
    dataIndex: 'so_no',
    width: 200,
  }, {
    title: this.msg('warehouse'),
    width: 200,
    dataIndex: 'whse_code',
  }, {
    title: this.msg('status'),
    width: 200,
    dataIndex: 'status',
  }, {
    title: this.msg('estShippingDate'),
    dataIndex: 'est_shipping_date',
    width: 160,
  }, {
    title: this.msg('plannedQty'),
    width: 120,
    dataIndex: 'planned_qty',
  }, {
    title: this.msg('packing'),
    width: 120,
    dataIndex: 'packing',
  }, {
    title: this.msg('weight'),
    width: 120,
    dataIndex: 'weight',
  }, {
    title: this.msg('cbm'),
    width: 120,
    dataIndex: 'cbm',
  }, {
    title: this.msg('consignee'),
    dataIndex: 'consignee',
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
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        },
      };
      return params;
    },
    remotes: this.props.stocklist,
  })
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/scv/inventory/shipping/create');
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('inventory')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingOrder')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleStatusChange} size="large">
            <RadioButton value="pending">{this.msg('pending')}</RadioButton>
            <RadioButton value="shipped">{this.msg('shipped')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick}>
              {this.msg('createShippingOrder')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1400 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
