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
import { loadReceiveModal, getInboundDetail } from 'common/reducers/cwmReceive';
import { loadZones } from 'common/reducers/cwmWarehouse';
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
    defaultWhse: state.cwmContext.defaultWhse,
    zoneList: state.cwmWarehouse.zoneList,
  }),
  { loadReceiveModal, getInboundDetail, loadZones }
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
    inboundConfirmed: false,
    inboundHead: {},
    inboundBody: [],
  }
  componentWillMount() {
    const asnNo = this.props.params.asnNo;
    const { defaultWhse } = this.props;
    this.props.getInboundDetail(asnNo).then(
      (result) => {
        this.setState({
          inboundHead: result.data.inboundHead,
          inboundBody: result.data.inboundBody,
        });
      }
    );
    this.props.loadZones(defaultWhse.code);
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
  handleProductReceive = (e) => {
    if (e.target.value > 0) { // TODO:
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
    dataIndex: 'asn_seq_no',
    width: 50,
    fixed: 'left',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
    fixed: 'left',
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '订单数量',
    dataIndex: 'expect_qty',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'unit',
    width: 100,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 200,
    render: o => (<PackagePopover data={o} />),
  }, {
    title: 'SKU包装单位',
    width: 100,
    dataIndex: 'sku_pack_unit_name',
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
        return (<span className="mdc-text-red"><Tooltip title="包装单位数量"><Input className={this.state.receivingMode === 'scan' && 'readonly'} defaultValue={record.received_pack_qty} style={{ width: 80 }} onChange={this.handleProductReceive} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      }
    },
  }, {
    title: '库位号',
    dataIndex: 'location',
    fixed: 'right',
    render: (o) => {
      const Options = this.props.zoneList.map(zone => (<Option value={zone.zone_code}>{zone.zone_name}</Option>));
      return (<Select defaultValue={o} showSearch style={{ width: 100 }} onChange={this.handleProductPutAway} disabled={this.state.receivingMode === 'scan'}>
        {Options}
      </Select>);
    },
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

  render() {
    const { defaultWhse } = this.props;
    const { inboundHead, inboundBody } = this.state;
    const asnNo = this.props.params.asnNo;
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
                value={defaultWhse.code}
                style={{ width: 160 }}
                disabled
              >
                <Option value={defaultWhse.code}>{defaultWhse.name}</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {asnNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {this.state.currentStatus < 3 &&
            <Tooltip title="打印入库单" placement="bottom">
              <Button size="large" icon="printer" onClick={this.handlePrint} />
            </Tooltip>
            }
            {this.state.currentStatus < 3 &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup defaultValue={this.state.receivingMode} onChange={this.handleReceivingModeChange} size="large" disabled={this.state.currentStatus > 0}>
              <Tooltip title="扫码收货" placement="bottom"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="人工收货" placement="bottom"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem label="货主" field={inboundHead.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="入库单号" field={inboundHead.inbound_no} />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="预计箱数" addonBefore={<Icon type="inbox" />} field={inboundHead.convey_box_qty} editable />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="预计托盘数" addonBefore={<Icon type="appstore-o" />} field={inboundHead.convey_pallet_qty} editable />
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
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={inboundBody} rowKey="asn_seq_no" scroll={{ x: 1600 }} />
              <ReceivingModal receivingMode={this.state.receivingMode} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
