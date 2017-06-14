import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Table, Icon, Modal, Input, Tooltip, Row, Col, Select, Button } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideReceiveModal, updateInboundMultiple } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    visible: state.cwmReceive.receiveModal.visible,
    locations: state.cwmWarehouse.locations,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { hideReceiveModal, updateInboundMultiple }
)
export default class ReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    receivingMode: PropTypes.string.isRequired,
  }
  state = {
    data: {},
    dataSource: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      dataSource: [nextProps.data],
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideReceiveModal();
  }
  handleProductPutAway = (value, index) => {
    const dataSource = [...this.state.dataSource];
    dataSource.splice(index, 1, { ...dataSource[index], location: value });
    this.setState({ dataSource });
  }
  handleProductReceive = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource.splice(index, 1, { ...dataSource[index], received_pack_qty: value });
    this.setState({ dataSource });
  }
  handleAdd = () => {
    const { data, dataSource } = this.state;
    const newDataSource = dataSource;
    newDataSource.push(data);
    this.setState({
      dataSource: newDataSource,
    });
  }
  handleSubmit = () => {
    const { dataSource } = this.state;
    const { loginId, tenantId, defaultWhse } = this.props;
    this.props.updateInboundMultiple(dataSource, loginId, tenantId, defaultWhse.code);
    this.props.hideReceiveModal();
  }
  columns = [{
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
    render: o => (<Input className="readonly" prefix={<Icon type="tag" />} value={o} />),
  }, {
    title: '商品条码',
    dataIndex: 'product_tag',
    width: 200,
    render: o => (<Input className="readonly" prefix={<Icon type="barcode" />} value={o} />),
  }, {
    title: '追踪号',
    dataIndex: 'trace_id',
    width: 200,
    render: o => (<Input className="readonly" prefix={<Icon type="qrcode" />} value={o} />),
  }, {
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 180,
    render: o => (<Input className="readonly" value={o} />),
  }, {
    title: '收货数量',
    dataIndex: 'received_qty',
    render: (o, record) => {
      if (record.expect_pack_qty === record.received_pack_qty) {
        return (<span className="mdc-text-green"><Tooltip title="包装单位数量"><Input className="readonly" style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      } else {
        return (<span className="mdc-text-red"><Tooltip title="包装单位数量"><Input className="readonly" style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      }
    },
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: o => (<Select defaultValue={o} showSearch style={{ width: 100 }} disabled />),
  }, {
    title: '收货状态',
    dataIndex: 'packing_code',
    render: o => (<Select defaultValue={o} style={{ width: 60 }} disabled >
      <Option value="0">完好</Option>
      <Option value="1">轻微擦痕</Option>
      <Option value="2">中度</Option>
      <Option value="3">重度</Option>
      <Option value="4">严重磨损</Option>
    </Select>),
  }]
  solutionColumns = [{
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '商品条码',
    dataIndex: 'product_tag',
    width: 200,
    render: o => (<Input prefix={<Icon type="barcode" />} value={o} />),
  }, {
    title: '追踪号',
    dataIndex: 'trace_id',
    width: 200,
    render: o => (<Input prefix={<Icon type="qrcode" />} value={o} />),
  }, {
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 180,
    render: o => (<Input value={o} />),
  }, {
    title: '收货数量',
    dataIndex: 'received_qty',
    render: (o, record, index) => {
      const expectQty = record.expect_qty;
      const receivedPackQty = record.received_pack_qty;
      const packQty = record.sku_pack_qty;
      let receiveQty = '';
      if (receivedPackQty) {
        receiveQty = receivedPackQty * packQty;
        if (receiveQty > expectQty) receiveQty = expectQty;
      }
      if (record.expect_pack_qty === record.received_pack_qty) {
        return (<span className="mdc-text-green"><Tooltip title="包装单位数量"><Input value={record.received_pack_qty} style={{ width: 80 }} onChange={e => this.handleProductReceive(index, e.target.value)} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={receiveQty} style={{ width: 80 }} disabled /></Tooltip></span>);
      } else {
        return (<span className="mdc-text-red"><Tooltip title="包装单位数量"><Input value={record.received_pack_qty} style={{ width: 80 }} onChange={e => this.handleProductReceive(index, e.target.value)} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={receiveQty} style={{ width: 80 }} disabled /></Tooltip></span>);
      }
    },
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: (o, record, index) => {
      const Options = this.props.locations.map(location => (<Option value={location.location}>{location.location}</Option>));
      return (<Select value={o} showSearch style={{ width: 100 }} onChange={value => this.handleProductPutAway(value, index)}>
        {Options}
      </Select>);
    },
  }, {
    title: '收货状态',
    dataIndex: 'packing_code',
    render: o => (<Select defaultValue={o} style={{ width: 60 }} >
      <Option value="0">完好</Option>
      <Option value="1">轻微擦痕</Option>
      <Option value="2">中度</Option>
      <Option value="3">重度</Option>
      <Option value="4">严重磨损</Option>
    </Select>),
  }]
  dataSource = [{
    trace_id: 'T04601170548',
    convey_no: 'N0170548',
    order_qty: 15,
    desc_cn: '微纤维止血胶原粉',
    packing_code: '良品',
    unit: '件',
    receive_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 15,
    received_qty: 15,
  }, {
    trace_id: 'T04601170547',
    convey_no: 'N0170547',
    order_qty: 1000,
    desc_cn: 'PTA球囊扩张导管',
    packing_code: '良品',
    unit: '件',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    trace_id: 'T04601170546',
    convey_no: 'N0170546',
    order_qty: 1000,
    desc_cn: '临时起搏电极导管',
    packing_code: '残次',
    unit: '个',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }];
  render() {
    const { receivingMode } = this.props;
    const { dataSource, data } = this.state;
    return (
      <Modal title="收货" width={1200} maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Row gutter={16}>
          <Col sm={24} lg={6}>
            <InfoItem label="预期数量" field={<span>
              <Tooltip title="包装单位数量"><Input value={data.expect_pack_qty} className="readonly" style={{ width: 80 }} /></Tooltip>
              <Tooltip title="主单位数量"><Input value={data.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>}
            />
          </Col>
          <Col sm={24} lg={6}>
            <InfoItem label="现收数量" field={<span className="mdc-text-red">
              <Tooltip title="包装单位数量"><Input value={data.received_pack_qty} className="readonly" style={{ width: 80 }} /></Tooltip>
              <Tooltip title="主单位数量"><Input value={data.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>}
            />
          </Col>
        </Row>
        <Button className="editable-add-btn" onClick={this.handleAdd}>Add</Button>
        <Table size="middle" columns={receivingMode === 'scan' ? this.columns : this.solutionColumns} dataSource={receivingMode === 'scan' ? this.dataSource : dataSource} rowKey="trace_id" />
      </Modal>
    );
  }
}
