import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Breadcrumb, Layout, Radio, Select, Table, Tag, notification } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg } from '../message.i18n';

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
export default class ReceivingNoticeList extends React.Component {
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
  msg = formatMsg(this.props.intl)
  columns = [{
    title: 'ANS编号',
    dataIndex: 'asn_no',
    width: 120,
    fixed: 'left',
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_code',
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
  }, {
    title: '供应商',
    dataIndex: 'seller_name',
  }, {
    title: '通知日期',
    width: 120,
    dataIndex: 'created_date',
  }, {
    title: '预期到货时间',
    width: 120,
    dataIndex: 'expect_receive_date',
  }, {
    title: '收货时间',
    width: 120,
    dataIndex: 'received_date',
  }, {
    title: '状态',
    dataIndex: 'status',
    fixed: 'right',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待收货" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="入库中" />);
      } else if (o === 2) {
        return (<Badge status="warning" text="部分收货" />);
      } else if (o === 3) {
        return (<Badge status="success" text="收货完成" />);
      }
    },
  }, {
    title: '货物属性',
    width: 100,
    dataIndex: 'bonded',
    fixed: 'right',
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">保税</Tag>);
      } else if (o === 0) {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '备案状态',
    dataIndex: 'reg_status',
    width: 120,
    fixed: 'right',
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待备案" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReleaseASN} label="释放" row={record} /><span className="ant-divider" /><RowUpdater onHit={this.handleEditASN} label="修改" row={record} /></span>);
      } else if (record.status === 1) {
        if (record.bonded === 1 && record.reg_status === 0) {
          return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /><span className="ant-divider" /><RowUpdater onHit={this.handleEntryReg} label="进库备案" row={record} /></span>);
        } else {
          return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /></span>);
        }
      }
    },
  }]

  dataSource = [{
    id: '1',
    asn_no: 'N04601170548',
    bonded: 1,
    whse_code: '0961|希雅路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7IR2730',
    status: 0,
  }, {
    id: '2',
    asn_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 1,
  }, {
    id: '3',
    asn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 1,
    reg_status: 0,
  }, {
    id: '4',
    asn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 2,
    reg_status: 1,
  }, {
    id: '5',
    asn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 3,
    reg_status: 2,
  }];

  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleCreateASN = () => {
    this.context.router.push('/cwm/receiving/asn/create');
  }
  handleEditASN = (row) => {
    const link = `/cwm/receiving/asn/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleReleaseASN = (row) => {
    notification.success({
      message: '操作成功',
      description: `${row.asn_no} 已释放`,
    });
  }
  handleReceive = (row) => {
    const link = `/cwm/receiving/inbound/receive/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleEntryReg = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.asn_no}`;
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
              <Select size="large" defaultValue="0960" placeholder="选择仓库" style={{ width: 160 }}>
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingASN')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="pending" onChange={this.handleBondedChange} size="large">
            <RadioButton value="pending">待收货</RadioButton>
            <RadioButton value="inbound">入库中</RadioButton>
            <RadioButton value="partial">部分收货</RadioButton>
            <RadioButton value="completed">收货完成</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('createASN')}
            </Button>
          </div>
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
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1400 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
