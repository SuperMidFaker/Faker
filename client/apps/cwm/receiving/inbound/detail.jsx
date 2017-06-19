import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Dropdown, Form, Radio, Layout, Menu, Popconfirm, Steps, Select, Button, Card, Col, Row, Tag, Table, Input, Tooltip, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from './popover/packagePopover';
import ReceivingModal from './modal/receivingModal';
import { loadReceiveModal, getInboundDetail, updateReceivedQty, updateProductDetail, confirm } from 'common/reducers/cwmReceive';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import { CWM_INBOUND_STATUS } from 'common/constants';
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
    locations: state.cwmWarehouse.locations,
  }),
  { loadReceiveModal, getInboundDetail, loadLocations, updateReceivedQty, updateProductDetail, confirm }
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
    inboundProducts: [],
    operator: {},
    confirm: true,
  }
  componentWillMount() {
    const asnNo = this.props.params.asnNo;
    const { defaultWhse } = this.props;
    this.props.getInboundDetail(asnNo).then(
      (result) => {
        let status = 0;
        if (result.data.inboundHead.status === 3) {
          status = 2;
        }
        if (result.data.inboundHead.status === 5) {
          status = 3;
        }
        this.setState({
          inboundHead: result.data.inboundHead,
          inboundProducts: result.data.inboundProducts,
          currentStatus: status,
        });
      }
    );
    this.props.loadLocations(defaultWhse.code);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReload = () => {
    this.props.getInboundDetail(this.props.params.asnNo).then(
      (result) => {
        let status = 0;
        if (result.data.inboundHead.status === 3) {
          status = 2;
        }
        if (result.data.inboundHead.status === 5) {
          status = 3;
        }
        this.setState({
          inboundHead: result.data.inboundHead,
          inboundProducts: result.data.inboundProducts,
          currentStatus: status,
        });
      }
    );
  }
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
      currentStatus: CWM_INBOUND_STATUS.PARTIAL_RECEIVED,
      selectedRowKeys: [],
    });
  }
  handleProductReceive = (index, receivedPackQty, record) => {
    const expectQty = record.expect_qty;
    const packQty = record.sku_pack_qty;
    let receiveQty = receivedPackQty * packQty;
    if (receiveQty > expectQty) receiveQty = expectQty;
    const inboundProducts = [...this.state.inboundProducts];
    const { tenantId, loginId } = this.props;
    if (receivedPackQty > inboundProducts[index].expect_pack_qty) {
      message.info('收货数量不可大于预期数量');
      return;
    }
    if (receivedPackQty > 0) { // TODO:
      this.setState({
        currentStatus: CWM_INBOUND_STATUS.PARTIAL_RECEIVED,
      });
    }
    inboundProducts.splice(index, 1, { ...inboundProducts[index], received_pack_qty: receivedPackQty, received_qty: receiveQty });
    this.setState({ inboundProducts });
    this.checkConfirm(inboundProducts);
    this.props.updateReceivedQty(record.asn_no, record.id, record.inbound_no, receivedPackQty, receiveQty, tenantId, loginId, record.trace_id[0], record.asn_seq_no);
  }
  handleProductPutAway = (value, record, index) => {
    this.setState({
      currentStatus: CWM_INBOUND_STATUS.PARTIAL_PUTAWAY,
    });
    const inboundProducts = [...this.state.inboundProducts];
    inboundProducts.splice(index, 1, { ...inboundProducts[index], location: [value] });
    this.setState({ inboundProducts });
    this.checkConfirm(inboundProducts);
    this.props.updateProductDetail({ location: value }, record.trace_id[0], record.inbound_no);
  }
  handleProductStatusChange = (value, record, index) => {
    const inboundProducts = [...this.state.inboundProducts];
    inboundProducts.splice(index, 1, { ...inboundProducts[index], damage_level: [value] });
    this.setState({ inboundProducts });
    this.props.updateProductDetail({ damage_level: value }, record.trace_id[0], record.inbound_no);
  }
  handleReceive = (record) => {
    this.props.loadReceiveModal(record.inbound_no, record.asn_seq_no, record.expect_qty, record.expect_pack_qty,
      record.received_qty, record.received_pack_qty, record.sku_pack_qty, record.asn_no, record.product_no);
  }
  handleInboundConfirmed = () => {
    const { loginId, tenantId } = this.props;
    this.props.confirm(this.state.inboundHead.inbound_no, this.props.params.asnNo, loginId, tenantId);
    this.setState({
      currentStatus: CWM_INBOUND_STATUS.COMPLETED,
    });
  }
  checkConfirm = (inboundProducts) => {
    if (inboundProducts.length === 0) this.setState({ confirm: true });
    for (let i = 0; i < inboundProducts.length; i++) {
      if ((inboundProducts[i].received_pack_qty && inboundProducts[i].location.length !== 0) || (inboundProducts[i].received_pack_qty !== null && !inboundProducts[i].received_pack_qty)) {
        this.setState({
          confirm: false,
        });
      } else {
        this.setState({
          confirm: true,
        });
        break;
      }
    }
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
    width: 150,
  }, {
    title: '订单数量',
    dataIndex: 'expect_qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'asn_unit_name',
    width: 80,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 200,
    render: o => (<PackagePopover data={o} />),
  }, {
    title: 'SKU包装单位',
    width: 200,
    dataIndex: 'sku_pack_unit_name',
    render: (puname, row) => (<Tooltip title={`=${row.sku_pack_qty}主单位`} placement="right"><Tag>{puname}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    width: 200,
    fixed: 'right',
    render: (o, record) => (
      <span>
        <Tooltip title="包装单位数量"><Input className="readonly" value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
        <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip>
      </span>),
  }, {
    title: '收货数量',
    width: 200,
    fixed: 'right',
    render: (o, record, index) => {
      const receiveAlert = record.expect_pack_qty !== record.receive_pack_qty;
      return (<span className={receiveAlert ? 'mdc-text-red' : 'mdc-text-green'}>
        <Tooltip title="包装单位数量">
          <Input className={this.state.receivingMode === 'scan' && 'readonly'} value={record.received_pack_qty}
            style={{ width: 80 }} onChange={e => this.handleProductReceive(index, e.target.value, record)}
          />
        </Tooltip>
        <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip>
      </span>);
    },
  }, {
    title: '库位号',
    dataIndex: 'location',
    fixed: 'right',
    width: 120,
    render: (o, record, index) => {
      if (record.location.length <= 1) {
        const Options = this.props.locations.map(location => (<Option value={location.location}>{location.location}</Option>));
        return (<Select value={o[0]} showSearch style={{ width: 100 }} onChange={value => this.handleProductPutAway(value, record, index)} disabled={this.state.receivingMode === 'scan' || !record.received_pack_qty}>
          {Options}
        </Select>);
      } else {
        return (<Select mode="tags" defaultValue={o} style={{ width: 100 }} disabled />);
      }
    },
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    fixed: 'right',
    width: 120,
    render: (o, record, index) => {
      if (o.length <= 1) {
        return (<Select value={o[0]} style={{ width: 100 }} onChange={value => this.handleProductStatusChange(value, record, index)} disabled={this.state.receivingMode === 'scan'}>
          <Option value={0}>完好</Option>
          <Option value={1}>轻微擦痕</Option>
          <Option value={2}>中度</Option>
          <Option value={3}>重度</Option>
          <Option value={4}>严重磨损</Option>
        </Select>);
      } else {
        return (<Select mode="tags" defaultValue={o} style={{ width: 100 }} disabled />);
      }
    },
  }, {
    title: '操作',
    width: 50,
    fixed: 'right',
    render: (o, record) => {
      if (this.state.receivingMode === 'scan') {
        return (<RowUpdater onHit={this.handleReceive} label={<Icon type="scan" />} row={record} />);
      } else if (this.state.receivingMode === 'manual') {
        return (<RowUpdater onHit={() => this.handleReceive(record)} label={<Icon type="edit" />} row={record} />);
      }
    },
  }]

  render() {
    const { defaultWhse } = this.props;
    const { inboundHead, inboundProducts } = this.state;
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
            {this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED &&
            <Tooltip title="打印入库单" placement="bottom">
              <Button size="large" icon="printer" onClick={this.handlePrint} />
            </Tooltip>
            }
            {this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup defaultValue={this.state.receivingMode} onChange={this.handleReceivingModeChange} size="large">
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
                  <Button size="large" onClick={this.handleExpressReceiving}>
                    快捷收货
                  </Button>
                  }
                </div>
                <div className="toolbar-right">
                  {this.state.receivingMode === 'manual' && this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED &&
                  <Popconfirm title="确定此次入库操作已完成?" onConfirm={this.handleInboundConfirmed} okText="确认" cancelText="取消">
                    <Button type="primary" ghost size="large" icon="check" disabled={this.state.confirm}>
                      入库确认
                    </Button>
                  </Popconfirm>
                  }
                </div>
              </div>
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={inboundProducts} rowKey="asn_seq_no"
                scroll={{ x: this.columns.reduce((acc, cur) => acc + cur.width, 0) }}
              />
              <ReceivingModal reload={this.handleReload} receivingMode={this.state.receivingMode} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
