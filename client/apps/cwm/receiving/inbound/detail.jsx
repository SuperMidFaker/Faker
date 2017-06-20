import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Dropdown, Form, Radio, Layout, Menu, Popconfirm, Steps, Select, Button, Card, Col, Row, Tag, Table, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from './popover/packagePopover';
import ReceivingModal from './modal/receivingModal';
import QuantityInput from '../../common/quantityInput';
import ExpressReceivingModal from './modal/expressReceivingModal';
import { openReceiveModal, getInboundDetail, confirm, showExpressReceivingModal, updateInboundMode } from 'common/reducers/cwmReceive';
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
    defaultWhse: state.cwmContext.defaultWhse,
    locations: state.cwmWarehouse.locations,
  }),
  { openReceiveModal, getInboundDetail, loadLocations, confirm, showExpressReceivingModal, updateInboundMode }
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    currentStatus: 0,
    printed: false,
    inboundHead: {},
    inboundProducts: [],
    operator: {},
    confirm: true,
  }
  componentWillMount() {
    this.handleReload();
    this.props.loadLocations(this.props.defaultWhse.code);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReload = () => {
    this.props.getInboundDetail(this.props.params.inboundNo).then((result) => {
      const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(
        cis => CWM_INBOUND_STATUS[cis].value === result.data.inboundHead.status
      )[0];
      this.setState({
        inboundHead: result.data.inboundHead,
        inboundProducts: result.data.inboundProducts,
        currentStatus: inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0,
        selectedRowKeys: [],
      });
      this.checkConfirm(result.data.inboundProducts);
    });
  }
  handleReceivingModeChange = (ev) => {
    this.props.updateInboundMode(this.state.inboundHead.inbound_no, ev.target.value).then((result) => {
      if (!result.error) {
        const head = { ...this.state.inboundHead };
        head.rec_mode = ev.target.value;
        this.setState({ inboundHead: head });
      }
    });
  }
  handlePrint = () => {
    this.setState({
      printed: true,
    });
  }
  handleExpressReceiving = () => {
    this.props.showExpressReceivingModal();
  }
  handleReceive = (record) => {
    this.props.openReceiveModal({
      inboundNo: record.inbound_no,
      seqNo: record.asn_seq_no,
      expectQty: record.expect_qty,
      expectPackQty: record.expect_pack_qty,
      receivedQty: record.received_qty,
      receivedPackQty: record.received_pack_qty,
      skuPackQty: record.sku_pack_qty,
      asnNo: this.state.inboundHead.asn_no,
      productNo: record.product_no,
      name: record.name,
    });
  }
  handleInboundConfirmed = () => {
    const { loginId, tenantId } = this.props;
    this.props.confirm(this.state.inboundHead.inbound_no, this.state.inboundHead.asn_no, loginId, tenantId);
    this.setState({
      currentStatus: CWM_INBOUND_STATUS.COMPLETED.step,
    });
    this.handleReload();
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
    width: 80,
    className: 'cell-align-right',
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
    dataIndex: 'sku_pack_unit_name',
    render: (puname, row) => (<Tooltip title={`=${row.sku_pack_qty}主单位`} placement="right"><Tag>{puname}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    width: 180,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.expect_pack_qty} pcsQty={record.expect_qty} disabled />),
  }, {
    title: '收货数量',
    width: 180,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.received_pack_qty} pcsQty={record.received_qty}
      alert={record.expect_pack_qty !== record.receive_pack_qty} disabled
    />),
  }, {
    title: '库位号',
    dataIndex: 'location',
    fixed: 'right',
    width: 180,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option value={location.location}>{location.location}</Option>));
      if (record.location.length <= 1) {
        return (
          <Select value={o[0]} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      } else {
        return (
          <Select mode="tags" value={o} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      }
    },
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    fixed: 'right',
    width: 120,
    render: damage => (
      <Select value={damage} style={{ width: 100 }} disabled>
        <Option value={0}>完好</Option>
        <Option value={1}>轻微擦痕</Option>
        <Option value={2}>中度</Option>
        <Option value={3}>重度</Option>
        <Option value={4}>严重磨损</Option>
      </Select>),
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (this.state.inboundHead.status < CWM_INBOUND_STATUS.COMPLETED.value) {
        const label = this.state.inboundHead.rec_mode === 'scan' ? '扫码收货' : '手动收货';
        return (<RowUpdater onHit={this.handleReceive} label={label} row={record} />);
      }
    },
  }]

  render() {
    const { defaultWhse } = this.props;
    const { inboundHead, inboundProducts } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
      getCheckboxProps: record => ({
        disabled: record.trace_id.length >= 1,
      }),
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
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.inboundNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Tooltip title="打印入库单" placement="bottom">
              <Button size="large" icon="printer" onClick={this.handlePrint} />
            </Tooltip>
            }
            {this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup value={inboundHead.rec_mode} onChange={this.handleReceivingModeChange} size="large"
              disabled={this.state.currentStatus === CWM_INBOUND_STATUS.COMPLETED.step}
            >
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
                  <InfoItem addonBefore="货主" field={inboundHead.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="ASN编号" field={inboundHead.asn_no} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="总预期数量" field={inboundHead.total_expect_qty} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="总实收数量" field={inboundHead.total_received_qty} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="装箱数量" field={inboundHead.convey_box_qty} editable />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="码盘数量" field={inboundHead.convey_pallet_qty} editable />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={this.state.currentStatus}>
                  <Step description="待入库" />
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
                  {inboundHead.rec_mode === 'manual' &&
                  <Button size="large" onClick={this.handleExpressReceiving}>
                    快捷收货
                  </Button>
                  }
                </div>
                <div className="toolbar-right">
                  {inboundHead.rec_mode === 'manual' && this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
                  <Popconfirm title="确定此次入库操作已完成?" onConfirm={this.handleInboundConfirmed} okText="确认" cancelText="取消">
                    <Button type="primary" ghost size="large" icon="check" disabled={this.state.confirm}>
                      入库确认
                    </Button>
                  </Popconfirm>
                  }
                </div>
              </div>
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={inboundProducts} rowKey="asn_seq_no"
                scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
              />
              <ReceivingModal reload={this.handleReload} receivingMode={inboundHead.rec_mode} />
              <ExpressReceivingModal reload={this.handleReload} asnNo={inboundHead.asn_no} inboundNo={inboundHead.inbound_no} data={this.state.selectedRows} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
