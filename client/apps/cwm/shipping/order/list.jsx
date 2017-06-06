import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, Select, Table, Button, Badge, Tag } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
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
    title: 'SO编号',
    width: 100,
    dataIndex: 'so_no',
  }, {
    title: '货主',
    width: 150,
    dataIndex: 'owner_code',
  }, {
    title: '关联订单号',
    width: 150,
    dataIndex: 'whse_code',
  }, {
    title: '收货人',
    width: 200,
    dataIndex: 'receiver',
  }, {
    title: '预期发货时间',
    dataIndex: 'est_shipping_date',
    width: 160,
  }, {
    title: '订单创建时间',
    width: 120,
    dataIndex: 'planned_qty',
  }, {
    title: '仓库代码',
    width: 120,
    dataIndex: 'packing',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待出货" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="出库中" />);
      } else if (o === 2) {
        return (<Badge status="warning" text="部分出货" />);
      } else if (o === 3) {
        return (<Badge status="success" text="出货完成" />);
      }
    },
  }, {
    title: '货物属性',
    width: 100,
    dataIndex: 'bonded',
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">保税</Tag>);
      } else if (o === 0) {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '监管备案',
    dataIndex: 'reg_status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: '操作',
    width: 120,
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater label="释放" row={record} /><span className="ant-divider" /><RowUpdater label="修改" row={record} /></span>);
      } else if (record.status === 1) {
        if (record.bonded === 1 && record.reg_status === 0) {
          return (<span><RowUpdater onHit={this.handleReceive} label="出货" row={record} /><span className="ant-divider" /><RowUpdater label="备案" row={record} /></span>);
        } else {
          return (<span><RowUpdater onHit={this.handleReceive} label="出货" row={record} /></span>);
        }
      }
    },
  }]

  dataSource = [{
    id: '1',
    so_no: 'N04601170548',
    bonded: 1,
    whse_code: '0961|希雅路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    status: 0,
    receiver: 'kaka',
    packing: '1',
    est_shipping_date: '2017-09-04',
  }, {
    id: '2',
    so_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 1,
    receiver: 'james',
    packing: '1',
    est_shipping_date: '2017-09-04',
  }, {
    id: '3',
    so_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 2,
    receiver: 'james',
    packing: '1',
    est_shipping_date: '2017-09-04',
  }, {
    id: '4',
    so_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 3,
    receiver: 'james',
    packing: '1',
    est_shipping_date: '2017-09-04',
  }];
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/shipping/order/create');
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
          <div className="top-bar-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick}>
              {this.msg('createOrder')}
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
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
