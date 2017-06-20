import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Table, Icon, Modal, Input, Row, Col, Select, Button } from 'antd';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import { format } from 'client/common/i18n/helpers';
import QuantityInput from '../../../common/quantityInput';
import messages from '../../message.i18n';
import { hideReceiveModal, loadProductDetails, updateProductDetails } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    visible: state.cwmReceive.receiveModal.visible,
    inboundNo: state.cwmReceive.receiveModal.inboundNo,
    seqNo: state.cwmReceive.receiveModal.seqNo,
    expectQty: state.cwmReceive.receiveModal.expectQty,
    expectPackQty: state.cwmReceive.receiveModal.expectPackQty,
    receivedQty: state.cwmReceive.receiveModal.receivedQty,
    receivedPackQty: state.cwmReceive.receiveModal.receivedPackQty,
    skuPackQty: state.cwmReceive.receiveModal.skuPackQty,
    asnNo: state.cwmReceive.receiveModal.asnNo,
    productNo: state.cwmReceive.receiveModal.productNo,
    name: state.cwmReceive.receiveModal.name,
    locations: state.cwmWarehouse.locations,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { hideReceiveModal, loadProductDetails, updateProductDetails }
)
export default class ReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    receivingMode: PropTypes.string.isRequired,
    inboundNo: PropTypes.string.isRequired,
  }
  state = {
    dataSource: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.inboundNo && nextProps.seqNo) {
      this.props.loadProductDetails(nextProps.inboundNo, nextProps.seqNo).then(
        (result) => {
          if (!result.error) {
            if (result.data.length === 0 && this.state.dataSource.length === 0) {
              this.handleAdd();
            } else {
              this.setState({
                dataSource: result.data.map(data => ({
                  id: data.trace_id,
                  trace_id: data.trace_id,
                  location: data.location,
                  damage_level: data.damage_level,
                  inbound_qty: data.inbound_qty,
                  inbound_pack_qty: data.inbound_pack_qty,
                  convey_no: data.convey_no,
                })),
              });
            }
          }
        }
      );
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideReceiveModal();
  }
  handleProductPutAway = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].location = value;
    this.setState({ dataSource });
  }
  handleConveyChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].convey_no = value;
    this.setState({ dataSource });
  }
  handleProductReceive = (index, value) => {
    const { expectQty, expectPackQty, skuPackQty } = this.props;
    const { dataSource } = this.state;
    if (dataSource.length === 1) {
      let receiveQty = value * skuPackQty;
      if (receiveQty > expectQty) receiveQty = expectQty;
      dataSource.splice(index, 1, { ...dataSource[index], inbound_pack_qty: value, inbound_qty: receiveQty });
    } else {
      let receivedQty = 0;
      let receivedPackQty = 0;
      for (let i = 0; i < dataSource.length; i++) {
        if (i !== index) {
          receivedQty += Number(dataSource[i].inbound_qty);
          receivedPackQty += Number(dataSource[i].inbound_pack_qty);
        }
      }
      console.log(expectQty, receivedQty, expectPackQty, receivedPackQty);
      const remainQty = expectQty - receivedQty;
      const remainPackQty = expectPackQty - receivedPackQty;
      let receiveQty = value * skuPackQty;
      if (receiveQty > remainQty) {
        receiveQty = remainQty;
        dataSource.splice(index, 1, { ...dataSource[index], inbound_pack_qty: remainPackQty, inbound_qty: receiveQty });
      } else {
        dataSource.splice(index, 1, { ...dataSource[index], inbound_pack_qty: value, inbound_qty: receiveQty });
      }
    }
    this.setState({ dataSource });
  }
  handleDamageLevelChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].damage_level = value;
    this.setState({ dataSource });
  }
  handleAdd = () => {
    const { dataSource } = this.state;
    const newDetail = {
      id: `${this.props.productNo}${dataSource.length + 1}`,
      trace_id: '',
      inbound_qty: '',
      inbound_pack_qty: '',
      location: '',
      damage_level: '',
    };
    dataSource.push(newDetail);
    this.setState({ dataSource });
  }
  handleDeleteDetail = (index) => {
    const dataSource = [...this.state.dataSource];
    dataSource.splice(index, 1);
    this.setState({ dataSource });
  }
  handleSubmit = () => {
    const { dataSource } = this.state;
    const { loginId, inboundNo, seqNo, asnNo } = this.props;
    this.props.updateProductDetails(dataSource.map(data => ({
      trace_id: data.trace_id,
      location: data.location,
      damage_level: data.damage_level,
      inbound_qty: data.inbound_qty,
      inbound_pack_qty: data.inbound_pack_qty,
      convey_no: data.convey_no,
    })), inboundNo, seqNo, asnNo, loginId).then((result) => {
      if (!result.error) {
        this.props.hideReceiveModal();
        this.props.reload();
      }
    });
  }
  scanColumns = [{
    title: '商品条码',
    dataIndex: 'product_tag',
    width: 180,
    render: o => (<Input className="readonly" prefix={<Icon type="barcode" />} value={o} />),
  }, {
    title: '追踪号',
    dataIndex: 'trace_id',
    width: 180,
    render: o => (<Input className="readonly" prefix={<Icon type="qrcode" />} value={o} />),
  }, {
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 180,
    render: o => (<Input className="readonly" value={o} />),
  }, {
    title: '收货数量',
    width: 180,
    dataIndex: 'received_qty',
    render: (o, record) => (<QuantityInput packQty={record.received_pack_qty} pcsQty={record.received_qty} />),
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: o => (<Select defaultValue={o} showSearch style={{ width: 100 }} disabled />),
  }, {
    title: '收货状态',
    dataIndex: 'damage_level',
    render: o => (<Select defaultValue={o} style={{ width: 60 }} disabled >
      <Option value="0">完好</Option>
      <Option value="1">轻微擦痕</Option>
      <Option value="2">中度</Option>
      <Option value="3">重度</Option>
      <Option value="4">严重磨损</Option>
    </Select>),
  }]

  manualColumns = [{
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 180,
    render: (convey, row, index) => (<Input value={convey} onChange={ev => this.handleConveyChange(index, ev.target.value)} />),
  }, {
    title: '收货数量',
    dataIndex: 'inbound_qty',
    width: 180,
    render: (o, record, index) => (<QuantityInput packQty={record.inbound_pack_qty} pcsQty={o} onChange={e => this.handleProductReceive(index, e.target.value)} />),
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 180,
    render: (o, record, index) => {
      const Options = this.props.locations.map(location => (<Option value={location.location}>{location.location}</Option>));
      return (<Select value={o} showSearch style={{ width: 160 }} onChange={value => this.handleProductPutAway(index, value)}>
        {Options}
      </Select>);
    },
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    width: 180,
    render: (o, record, index) => (<Select value={o} onChange={value => this.handleDamageLevelChange(index, value)} style={{ width: 160 }} >
      <Option value={0}>完好</Option>
      <Option value={1}>轻微擦痕</Option>
      <Option value={2}>中度</Option>
      <Option value={3}>重度</Option>
      <Option value={4}>严重磨损</Option>
    </Select>),
  }, {
    title: '操作',
    width: 50,
    render: (o, record, index) => (<RowUpdater onHit={() => this.handleDeleteDetail(index)} label={<Icon type="delete" />} row={record} />),
  }]
  render() {
    const { receivingMode, expectQty, expectPackQty, receivedQty, receivedPackQty, productNo, name } = this.props;
    const title = this.props.receivingMode === 'scan' ? '扫码收货' : '手动收货';
    return (
      <Modal title={title} width={960} maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Row>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="商品货号" field={productNo} style={{ marginBottom: 0 }} />
          </Col>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="中文品名" field={name} style={{ marginBottom: 0 }} />
          </Col>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="预期数量" field={<QuantityInput packQty={expectPackQty} pcsQty={expectQty} disabled />} />
          </Col>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="现收数量" field={<QuantityInput packQty={receivedPackQty} pcsQty={receivedQty} disabled />} />
          </Col>
        </Row>
        <Table size="middle" columns={receivingMode === 'scan' ? this.scanColumns : this.manualColumns}
          dataSource={this.state.dataSource.map((item, index) => ({ ...item, index }))} rowKey="index"
          footer={() => receivingMode === 'manual' && <Button type="dashed" icon="plus" style={{ width: '100%' }} onClick={this.handleAdd} />}
        />
      </Modal>
    );
  }
}
