import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Card, Table, Icon, Modal, Input, Row, Col, Select, Button, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import { format } from 'client/common/i18n/helpers';
import QuantityInput from '../../../common/quantityInput';
import LocationSelect from 'client/apps/cwm/common/locationSelect';
import messages from '../../message.i18n';
import { hideReceiveModal, loadProductDetails, receiveProduct } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    visible: state.cwmReceive.receiveModal.visible,
    editable: state.cwmReceive.receiveModal.editable,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundNo: state.cwmReceive.receiveModal.inboundNo,
    inboundProduct: state.cwmReceive.receiveModal.inboundProduct,
  }),
  { hideReceiveModal, loadProductDetails, receiveProduct }
)
export default class ReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired,
  }
  state = {
    dataSource: [],
    receivedQty: 0,
    receivedPackQty: 0,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.inboundProduct.asn_seq_no) {
      this.props.loadProductDetails(nextProps.inboundNo, nextProps.inboundProduct.asn_seq_no).then(
        (result) => {
          if (!result.error) {
            let dataSource = [];
            if (result.data.length === 0 && nextProps.inboundHead.rec_mode === 'manual') {
              dataSource = [{
                id: `${this.props.productNo}1`,
                inbound_qty: 0,
                inbound_pack_qty: 0,
                location: '',
                damage_level: 0,
              }];
            } else {
              dataSource = result.data.map(data => ({
                id: data.trace_id,
                trace_id: data.trace_id,
                location: data.location,
                damage_level: data.damage_level,
                inbound_qty: data.inbound_qty,
                inbound_pack_qty: data.inbound_pack_qty,
                convey_no: data.convey_no,
              }));
            }
            this.setState({
              dataSource,
              receivedQty: nextProps.inboundProduct.received_qty,
              receivedPackQty: nextProps.inboundProduct.received_pack_qty,
            });
          }
        });
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
    const receivePack = Number(parseFloat(value));
    if (!isNaN(receivePack)) {
      const inboundProduct = this.props.inboundProduct;
      const { receivedQty, receivedPackQty } = this.state;
      const dataSource = [...this.state.dataSource];
      const remainQty = inboundProduct.expect_qty - receivedQty;
      const remainPackQty = inboundProduct.expect_pack_qty - receivedPackQty;
      const changeQty = receivePack * inboundProduct.sku_pack_qty - dataSource[index].inbound_qty;
      const changePackQty = receivePack - dataSource[index].inbound_pack_qty;
      let newRecQty;
      let newRecPackQty;
      if (changeQty > remainQty) {
        dataSource[index].inbound_pack_qty = remainPackQty + Number(dataSource[index].inbound_pack_qty);
        dataSource[index].inbound_qty = remainQty + dataSource[index].inbound_qty;
        newRecQty = inboundProduct.expect_qty;
        newRecPackQty = inboundProduct.expect_pack_qty;
      } else {
        dataSource[index].inbound_pack_qty = receivePack;
        dataSource[index].inbound_qty = receivePack * inboundProduct.sku_pack_qty;
        newRecQty = receivedQty + changeQty;
        newRecPackQty = receivedPackQty + changePackQty;
      }
      this.setState({
        dataSource,
        receivedQty: newRecQty,
        receivedPackQty: newRecPackQty,
      });
    }
  }
  handleDamageLevelChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].damage_level = value;
    this.setState({ dataSource });
  }
  handleAdd = () => {
    const dataSource = [...this.state.dataSource];
    const newDetail = {
      id: `${this.props.productNo}${dataSource.length + 1}`,
      inbound_qty: 0,
      inbound_pack_qty: 0,
      location: '',
      damage_level: 0,
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
    const dataSource = [...this.state.dataSource];
    if (dataSource.find(data => data.inbound_pack_qty === 0)) {
      message.error('收货数量不能等于零');
      return;
    }
    if (dataSource.find(data => data.inbound_pack_qty === 0 || data.location === '')) {
      message.error('收货库位不能为空');
      return;
    }
    const { loginId, inboundNo, inboundProduct, inboundHead } = this.props;
    this.props.receiveProduct(dataSource.filter(data => !data.trace_id).map(data => ({
      location: data.location,
      damage_level: data.damage_level,
      inbound_qty: data.inbound_qty,
      inbound_pack_qty: data.inbound_pack_qty,
      convey_no: data.convey_no,
    })), inboundNo, inboundProduct.asn_seq_no, inboundHead.asn_no, loginId).then((result) => {
      if (!result.error) {
        this.props.hideReceiveModal();
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
    dataIndex: 'inbound_qty',
    render: (o, record) => (<QuantityInput packQty={record.inbound_pack_qty} pcsQty={record.inbound_qty} />),
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    render: o => (<Select value={o} style={{ width: 60 }} disabled>
      <Option value={0}>完好</Option>
      <Option value={1}>轻微擦痕</Option>
      <Option value={2}>中度</Option>
      <Option value={3}>重度</Option>
      <Option value={4}>严重磨损</Option>
    </Select>),
  }, {
    title: '收货库位',
    dataIndex: 'location',
    width: 100,
    render: o => (<Select value={o} showSearch style={{ width: 100 }} disabled />),
  }]

  manualColumns = [{
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 180,
    render: (convey, row, index) => (
      <Input value={convey} onChange={ev => this.handleConveyChange(index, ev.target.value)}
        disabled={!!row.trace_id}
      />),
  }, {
    title: '收货数量',
    dataIndex: 'inbound_qty',
    width: 180,
    render: (o, record, index) => (
      <QuantityInput packQty={record.inbound_pack_qty} pcsQty={o}
        onChange={e => this.handleProductReceive(index, e.target.value)} disabled={!!record.trace_id}
      />),
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    width: 180,
    render: (o, record, index) => (
      <Select value={o} onChange={value => this.handleDamageLevelChange(index, value)} style={{ width: 160 }}
        disabled={!!record.trace_id}
      >
        <Option value={0}>完好</Option>
        <Option value={1}>轻微擦痕</Option>
        <Option value={2}>中度</Option>
        <Option value={3}>重度</Option>
        <Option value={4}>严重磨损</Option>
      </Select>),
  }, {
    title: '收货库位',
    dataIndex: 'location',
    width: 180,
    render: (o, record, index) => (
      <LocationSelect value={o} style={{ width: 160 }} onChange={value => this.handleProductPutAway(index, value)}
        disabled={!!record.trace_id}
      />),
  }, {
    title: '操作',
    width: 50,
    render: (o, record, index) => !record.trace_id && (<RowUpdater onHit={() => this.handleDeleteDetail(index)} label={<Icon type="delete" />} row={record} />),
  }]
  render() {
    const { inboundProduct, inboundHead, editable } = this.props;
    const { receivedQty, receivedPackQty } = this.state;
    let footer;
    if (inboundHead.rec_mode === 'manual' && receivedQty < inboundProduct.expect_qty) {
      footer = () => <Button type="dashed" icon="plus" style={{ width: '100%' }} onClick={this.handleAdd} />;
    }
    const title = (<div>
      <span>{editable ? '收货确认' : '收货记录'}</span>
      <div className="toolbar-right">
        {!editable && <Button onClick={this.handleCancel}>关闭</Button>}
        {editable && <Button onClick={this.handleCancel}>取消</Button>}
        {editable && <Button type="primary" onClick={this.handleSubmit}>保存</Button>}
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        visible={this.props.visible} footer={null}
      >
        <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
          <Row className="info-group-inline">
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="商品货号" field={inboundProduct.product_no} style={{ marginBottom: 0 }} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="中文品名" field={inboundProduct.name} style={{ marginBottom: 0 }} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="预期数量" field={<QuantityInput packQty={inboundProduct.expect_pack_qty} pcsQty={inboundProduct.expect_qty} disabled />} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="现收数量" field={<QuantityInput packQty={receivedPackQty} pcsQty={receivedQty} disabled />} />
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="middle" columns={inboundHead.rec_mode === 'scan' ? this.scanColumns : this.manualColumns}
            dataSource={this.state.dataSource.map((item, index) => ({ ...item, index }))} rowKey="index" footer={footer}
          />
        </Card>
      </Modal>
    );
  }
}
