import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Icon, Breadcrumb, Layout, Radio, Select, Table, Tag, Tooltip } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
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
    title: '收货通知单号',
    dataIndex: 'rn_no',
    width: 120,
    fixed: 'left',
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_code',
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
    title: '入库单号',
    width: 120,
    dataIndex: 'inbound_no',
  }, {
    title: '入库状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="创建" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="收货" />);
      } else if (o === 2) {
        return (<Badge status="processing" text="上架" />);
      } else if (o === 3) {
        return (<Badge status="success" text="入库完成" />);
      }
    },
  }, {
    title: '操作人员',
    dataIndex: 'operator',
  }, {
    title: '开始时间',
    dataIndex: 'inbound_start_date',
    width: 120,
  }, {
    title: '完成时间',
    dataIndex: 'inbound_finish_date',
    width: 120,
  }, {
    title: '收货方式',
    dataIndex: 'receiving_mode',
    width: 80,
    render: (o) => {
      if (o === 'api') {
        return (<Tooltip title="接口收货"><Icon type="api" /></Tooltip>);
      } else if (o === 'scan') {
        return (<Tooltip title="扫码收货"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工收货"><Icon type="user" /></Tooltip>);
      }
    },
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
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
    receiving_mode: 'scan',
  }, {
    id: '2',
    rn_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 1,
    receiving_mode: 'api',
  }, {
    id: '3',
    rn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 2,
    receiving_mode: 'manual',
  }, {
    id: '4',
    rn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 2,
    receiving_mode: 'scan',
  }, {
    id: '5',
    rn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 3,
    receiving_mode: 'scan',
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
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="all" onChange={this.handleBondedChange} size="large">
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="receive">收货</RadioButton>
            <RadioButton value="putaway">上架</RadioButton>
            <RadioButton value="completed">入库完成</RadioButton>
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
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
