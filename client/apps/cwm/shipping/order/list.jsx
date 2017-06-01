import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, Select, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
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
    width: 100,
  }, {
    title: this.msg('owner'),
    width: 150,
    dataIndex: 'owner_code',
  }, {
    title: this.msg('warehouse'),
    width: 150,
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
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
                defaultValue="0960"
                placeholder="选择仓库"
                style={{ width: 160 }}
              >
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingOrder')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="pending" onChange={this.handleStatusChange} size="large">
            <RadioButton value="pending">待出货</RadioButton>
            <RadioButton value="outbound">出库中</RadioButton>
            <RadioButton value="partial">部分出货</RadioButton>
            <RadioButton value="completed">出货完成</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools" />
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
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
