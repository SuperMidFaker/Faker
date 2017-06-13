import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Breadcrumb, Layout, Radio, Select, Table, Tooltip } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { FtIcon } from 'client/components/FontIcon';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
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
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 120,
  }, {
    title: '波次号',
    width: 120,
    dataIndex: 'ref_order_no',
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_code',
  }, {
    title: '分配',
    dataIndex: 'allocating',
    className: 'cell-align-center',
    render: (o) => {
      switch (o) {
        case 0:
          return <FtIcon type="circle" color="gray" />;
        case 1:
          return <FtIcon type="circle" color="blue" />;
        case 2:
          return <FtIcon type="circle" color="orange" />;
        case 3:
          return <FtIcon type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '拣货',
    dataIndex: 'picking',
    className: 'cell-align-center',
    render: (o) => {
      switch (o) {
        case 0:
          return <FtIcon type="circle" color="gray" />;
        case 1:
          return <FtIcon type="circle" color="blue" />;
        case 2:
          return <FtIcon type="circle" color="orange" />;
        case 3:
          return <FtIcon type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '装箱复核',
    dataIndex: 'packing',
    className: 'cell-align-center',
    render: (o) => {
      switch (o) {
        case 0:
          return <FtIcon type="circle" color="gray" />;
        case 1:
          return <FtIcon type="circle" color="blue" />;
        case 2:
          return <FtIcon type="circle" color="orange" />;
        case 3:
          return <FtIcon type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '发运',
    dataIndex: 'shipping',
    className: 'cell-align-center',
    render: (o) => {
      switch (o) {
        case 0:
          return <FtIcon type="circle" color="gray" />;
        case 1:
          return <FtIcon type="circle" color="blue" />;
        case 2:
          return <FtIcon type="circle" color="orange" />;
        case 3:
          return <FtIcon type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '操作模式',
    dataIndex: 'receiving_mode',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码发货"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工发货"><Icon type="solution" /></Tooltip>);
      }
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
  }, {
    title: '完成时间',
    dataIndex: 'completed_date',
    width: 120,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="出库操作" row={record} /> </span>);
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else {
        return (<span><RowUpdater onHit={this.handleReceive} label="出库操作" row={record} /> </span>);
      }
    },
  }]

  dataSource = [{
    id: '1',
    so_no: 'N04601170548',
    bonded: 1,
    whse_code: '0961|希雅路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7IR2730',
    status: 0,
    receiving_lock: 0,
  }, {
    id: '2',
    so_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 0,
    receiving_lock: 1,
  }, {
    id: '3',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 0,
    receiving_lock: 2,
  }, {
    id: '4',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 1,
    receiving_lock: 0,
  }, {
    id: '5',
    so_no: 'N04601170546',
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
    const link = `/cwm/shipping/outbound/allocate/${row.so_no}`;
    this.context.router.push(link);
  }
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
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
              {this.msg('shippingOutbound')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleWaveList} size="large">
            <RadioButton value="waves">波次计划</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup defaultValue="allocating" onChange={this.handleStatusChange} size="large">
            <RadioButton value="allocating">分配</RadioButton>
            <RadioButton value="picking">拣货</RadioButton>
            <RadioButton value="shipping">发货</RadioButton>
            <RadioButton value="completed">出库完成</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
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
                <Button size="large">创建波次计划</Button>
                <Button size="large">添加到波次计划</Button>
                <Button size="large">触发补货任务</Button>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowSelection={rowSelection} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
