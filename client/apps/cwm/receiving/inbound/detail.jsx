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
import { loadReceiveModal, getInboundDetail, confirm, showExpressReceivingModal } from 'common/reducers/cwmReceive';
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
  { loadReceiveModal, getInboundDetail, loadLocations, confirm, showExpressReceivingModal }
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
    selectedRows: [],
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
    this.handleReload();
    this.props.loadLocations(this.props.defaultWhse.code);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReload = () => {
    this.props.getInboundDetail(this.props.params.asnNo).then((result) => {
      const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(
        cis => CWM_INBOUND_STATUS[cis].value === result.data.inboundHead.status
      )[0];
      this.setState({
        inboundHead: result.data.inboundHead,
        inboundProducts: result.data.inboundProducts,
        currentStatus: inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0,
      });
      this.checkConfirm(result.data.inboundProducts);
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
  handleExpressReceiving = () => {
    this.props.showExpressReceivingModal();
  }
  handleReceive = (record) => {
    this.props.loadReceiveModal(record.inbound_no, record.asn_seq_no, record.expect_qty, record.expect_pack_qty,
      record.received_qty, record.received_pack_qty, record.sku_pack_qty, record.asn_no, record.product_no);
  }
  handleInboundConfirmed = () => {
    const { loginId, tenantId } = this.props;
    this.props.confirm(this.state.inboundHead.inbound_no, this.props.params.asnNo, loginId, tenantId);
    this.setState({
      currentStatus: CWM_INBOUND_STATUS.COMPLETED.step,
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
    dataIndex: 'sku_pack_unit_name',
    render: (puname, row) => (<Tooltip title={`=${row.sku_pack_qty}主单位`} placement="right"><Tag>{puname}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    width: 200,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.expect_pack_qty} pcsQty={record.expect_qty} disabled />),
  }, {
    title: '收货数量',
    width: 200,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.received_pack_qty} pcsQty={record.received_qty}
      alert={record.expect_pack_qty !== record.receive_pack_qty} disabled
    />),
  }, {
    title: '库位号',
    dataIndex: 'location',
    fixed: 'right',
    width: 120,
    render: (o, record) => {
      if (record.location.length <= 1) {
        const Options = this.props.locations.map(location => (<Option value={location.location}>{location.location}</Option>));
        return (<Select value={o[0]} showSearch style={{ width: 100 }} disabled>
          {Options}
        </Select>);
      } else {
        return (<Select className="readonly" mode="tags" defaultValue={o} style={{ width: 100 }} disabled />);
      }
    },
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    fixed: 'right',
    width: 120,
    render: (o) => {
      if (o.length <= 1) {
        return (<Select value={o[0]} style={{ width: 100 }} disabled>
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
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (this.state.receivingMode === 'scan') {
        return (<RowUpdater onHit={this.handleReceive} label="收货明细" row={record} />);
      } else if (this.state.receivingMode === 'manual') {
        return (<RowUpdater onHit={() => this.handleReceive(record)} label="手动收货" row={record} />);
      }
    },
  }]

  render() {
    const { defaultWhse } = this.props;
    const { inboundHead, inboundProducts } = this.state;
    const asnNo = this.props.params.asnNo;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
      getCheckboxProps: record => ({
        disabled: record.trace_id.length > 1,
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
                  {this.state.receivingMode === 'manual' &&
                  <Button size="large" onClick={this.handleExpressReceiving}>
                    快捷收货
                  </Button>
                  }
                </div>
                <div className="toolbar-right">
                  {this.state.receivingMode === 'manual' && this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
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
              <ReceivingModal reload={this.handleReload} receivingMode={this.state.receivingMode} />
              <ExpressReceivingModal reload={this.handleReload} asnNo={this.props.params.asnNo} inboundNo={this.state.inboundHead.inbound_no} data={this.state.selectedRows} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
