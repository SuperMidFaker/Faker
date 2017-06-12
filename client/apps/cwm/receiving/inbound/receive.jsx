import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Dropdown, Form, Radio, Layout, Menu, Popconfirm, Steps, Select, Button, Card, Col, Row, Tag, Table, Input, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from './popover/packagePopover';
import ReceivingModal from './modal/receivingModal';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { loadReceiveModal }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class ReceiveInbound extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    receivingMode: 'scan',
    currentStatus: 0,
    printed: false,
    pushedTask: false,
  }
  msg = key => formatMsg(this.props.intl, key);

  handleReceivingModeChange = (ev) => {
    this.setState({
      receivingMode: ev.target.value,
    });
  }
  handlePrint = () => {
    this.setState({
      printed: true,
    });
  }
  handlePushTask = () => {
    this.setState({
      pushedTask: true,
    });
  }
  handleWithdrawTask = () => {
    this.setState({
      pushedTask: false,
    });
  }
  handleReceivedQtyAsExpected = () => {
    this.setState({
      currentStatus: 1,
      selectedRowKeys: [],
    });
  }
  handleProductReceive = (ev) => {
    if (ev.target.value > 0) { // TODO:
      this.setState({
        currentStatus: 1,
      });
    }
  }
  handleProductPutAway = () => {
    this.setState({
      currentStatus: 2,
    });
  }
  handleReceive = () => {
    this.props.loadReceiveModal();
  }
  handleInboundConfirmed = () => {
    this.setState({
      currentStatus: 3,
    });
  }
  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 200,
  }, {
    title: '订单数量',
    dataIndex: 'order_qty',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'unit',
    width: 100,
  }, {
    title: 'SKU',
    dataIndex: 'sku',
    width: 200,
    render: o => (
      <PackagePopover data={o} />
      ),
  }, {
    title: 'SKU包装单位',
    dataIndex: 'sku_pack',
    width: 150,
    render: o => (<Tooltip title="=10主单位" placement="right"><Tag>{o}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    width: 200,
    fixed: 'right',
    render: (o, record) => (<span><Tooltip title="包装单位数量"><Input className="readonly" value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '收货数量',
    width: 200,
    fixed: 'right',
    render: (o, record) => {
      if (record.expect_pack_qty === record.received_pack_qty) {
        return (<span className="mdc-text-green"><Tooltip title="包装单位数量"><Input className={this.state.receivingMode === 'scan' && 'readonly'} defaultValue={record.received_pack_qty} style={{ width: 80 }} onChange={this.handleProductReceive} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      } else {
        return (<span className="mdc-text-red"><Tooltip title="包装单位数量"><Input className={this.state.receivingMode === 'scan' && 'readonly'} defaultValue={record.received_pack_qty} style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      }
    },
  }, {
    title: '库位号',
    dataIndex: 'location',
    fixed: 'right',
    render: o => (<Select defaultValue={o} showSearch style={{ width: 100 }} onChange={this.handleProductPutAway} disabled={this.state.receivingMode === 'scan'}>
      <Option value="A1312A1">A1312A1</Option>
      <Option value="A1310A2">A1310A2</Option>
    </Select>),
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    fixed: 'right',
    render: o => (<Select defaultValue={o} style={{ width: 100 }} disabled={this.state.receivingMode === 'scan'}>
      <Option value="0">完好</Option>
      <Option value="1">轻微擦痕</Option>
      <Option value="2">中度</Option>
      <Option value="3">重度</Option>
      <Option value="4">严重磨损</Option>
    </Select>),
  }, {
    title: '操作',
    width: 50,
    fixed: 'right',
    render: (o, record) => {
      if (this.state.receivingMode === 'scan') {
        return (<RowUpdater onHit={this.handleReceive} label={<Icon type="scan" />} row={record} />);
      } else if (this.state.receivingMode === 'manual') {
        return (<RowUpdater onHit={this.handleReceive} label={<Icon type="edit" />} row={record} />);
      }
    },
  }]
  mockData = [{
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 15,
    desc_cn: '微纤维止血胶原粉',
    sku: 'N04601170548',
    unit: '件',
    sku_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 1000,
    desc_cn: 'PTA球囊扩张导管',
    sku: 'N04601170547',
    unit: '件',
    sku_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '3',
    product_no: 'SBMG-00859',
    order_qty: 1000,
    desc_cn: '临时起搏电极导管',
    sku: 'RS2A03A0AL0W00',
    unit: '个',
    sku_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '4',
    product_no: 'SBME-00787',
    order_qty: 12,
    desc_cn: '肾造瘘球囊扩张导管',
    sku: '109R0612D401',
    unit: '个',
    expect_pack_qty: 2,
    sku_pack: '箱',
    expect_qty: 12,
    received_pack_qty: 1,
    received_qty: 6,
  }, {
    seq_no: '5',
    product_no: 'SBMJ-00199',
    order_qty: 1,
    desc_cn: '输尿管镜球囊扩张导管',
    sku: '9GV0912P1G03',
    unit: '个',
    expect_pack_qty: 1,
    sku_pack: '托盘',
    expect_qty: 1,
    received_pack_qty: 0,
    received_qty: 0,
  }];

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const tagMenu = (
      <Menu>
        <Menu.Item key="printTraceTag">打印追踪标签</Menu.Item>
        <Menu.Item key="exportTraceTag">导出追踪标签</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="printConveyTag">打印箱/托标签</Menu.Item>
        <Menu.Item key="exportConveyTag">导出箱/托标签</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="exportAllTag">导出全部标签</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
                defaultValue="0960"
                placeholder="选择仓库"
                style={{ width: 160 }}
                disabled
              >
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              ASN096120170603223
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {this.state.receivingMode === 'manual' && this.state.currentStatus < 3 &&
            <Button type={!this.state.printed && 'primary'} size="large"icon={this.state.printed ? 'check-circle-o' : 'printer'} onClick={this.handlePrint}>
              打印入库清单
            </Button>
            }
            {this.state.receivingMode === 'scan' && this.state.currentStatus < 3 &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup defaultValue={this.state.receivingMode} onChange={this.handleReceivingModeChange} size="large" disabled={this.state.currentStatus > 0}>
              <Tooltip title="扫码收货"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="人工收货"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem label="货主" field="04601|米思米(中国)精密机械贸易" />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="入库单号" field="I096120170603223-01" />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="预计箱数" addonBefore={<Icon type="inbox" />} field={10} editable />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="预计托盘数" addonBefore={<Icon type="appstore-o" />} field={2} editable />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={this.state.currentStatus}>
                  <Step description="创建入库" />
                  <Step description="收货" />
                  <Step description="上架" />
                  <Step description="入库完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <div className="toolbar">
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                  {this.state.receivingMode === 'manual' &&
                  <Button size="large" onClick={this.handleReceivedQtyAsExpected}>
                    收货数量与预期一致
                  </Button>
                  }
                </div>
                <div className="toolbar-right">
                  {this.state.receivingMode === 'manual' && this.state.currentStatus < 3 &&
                  <Popconfirm title="确定此次入库操作已完成?" onConfirm={this.handleInboundConfirmed} okText="确认" cancelText="取消">
                    <Button type={this.state.printed && 'primary'} size="large" icon="check" disabled={this.state.currentStatus < 2}>
                      入库确认
                    </Button>
                  </Popconfirm>
                  }
                </div>
              </div>
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.mockData} rowKey="seq_no" scroll={{ x: 1600 }} />
              <ReceivingModal receivingMode={this.state.receivingMode} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
