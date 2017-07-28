import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, DatePicker, Table, Form, Modal, Input, Tag, Row, Col, Button, message, Checkbox } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import QuantityInput from '../../../common/quantityInput';
import messages from '../../message.i18n';
import { closeAllocatingModal, loadProductInboundDetail, loadAllocatedDetails, manualAlloc } from 'common/reducers/cwmOutbound';
import { CWM_SO_BONDED_REGTYPES } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.allocatingModal.visible,
    outboundNo: state.cwmOutbound.allocatingModal.outboundNo,
    outboundProduct: state.cwmOutbound.allocatingModal.outboundProduct,
    filters: state.cwmOutbound.inventoryFilter,
    inventoryData: state.cwmOutbound.inventoryData,
    allocatedData: state.cwmOutbound.allocatedData,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    loginName: state.account.username,
    outboundHead: state.cwmOutbound.outboundFormHead,
  }),
  { closeAllocatingModal, loadProductInboundDetail, loadAllocatedDetails, manualAlloc }
)
export default class AllocatingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    seqNo: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired,
  }
  state = {
    inventoryData: [],
    allocatedData: [],
    outboundProduct: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      const { outboundHead } = nextProps;
      this.props.loadProductInboundDetail(nextProps.outboundProduct.product_sku, nextProps.defaultWhse.code, nextProps.filters,
        outboundHead.bonded, outboundHead.bonded_outtype);
      this.props.loadAllocatedDetails(nextProps.outboundProduct.outbound_no, nextProps.outboundProduct.seq_no);
      this.setState({
        outboundProduct: nextProps.outboundProduct,
      });
    }
    if (nextProps.inventoryData !== this.props.inventoryData) {
      this.setState({
        inventoryData: nextProps.inventoryData,
      });
    }
    if (nextProps.allocatedData !== this.props.allocatedData) {
      this.setState({
        allocatedData: nextProps.allocatedData.map(ad => ({ ...ad,
          allocated_qty: ad.alloc_qty,
          allocated_pack_qty: ad.sku_pack_qty ? ad.alloc_qty / ad.sku_pack_qty : ad.alloc_qty,
        })),
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  inventoryColumns = [{
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: (o) => {
      if (o) {
        return <Button size="small">{o}</Button>;
      }
    },
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '入库日期',
    dataIndex: 'created_date',
    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 100,
    render: bonded => bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>,
  }, {
    title: '库存数量',
    dataIndex: 'total_qty',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.total_pack_qty} pcsQty={record.total_qty} />),
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.avail_pack_qty} pcsQty={record.avail_qty} />),
  }, {
    title: '待分配数量',
    width: 200,
    render: (o, record, index) => (<QuantityInput size="small" onChange={e => this.handleAllocChange(e.target.value, index)} packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record, index) => (this.props.editable && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddAllocate(index)} />),
  }]

  allocatedColumns = [{
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: (o) => {
      if (o) {
        return <Button size="small">{o}</Button>;
      }
    },
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    dataIndex: 'spacer',
  }, {
    title: '已分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '删除',
    width: 80,
    fixed: 'right',
    render: (o, record, index) => (this.props.editable && <Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDeleteAllocated(index)} />),
  }]
  handleAllocChange = (value, index) => {
    const inventoryData = [...this.state.inventoryData];
    if (value > inventoryData[index].avail_pack_qty) {
      message.info('分配数量不能大于可用数量');
    } else {
      inventoryData[index].allocated_pack_qty = value;
      inventoryData[index].allocated_qty = value * inventoryData[index].sku_pack_qty;
      this.setState({
        inventoryData,
      });
    }
  }
  handleLocationChange = (e) => {
    const filters = { ...this.props.filters, location: e.target.value };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters);
  }
  handleLotnoChange = (e) => {
    const filters = { ...this.props.filters, external_lot_no: e.target.value };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters);
  }
  handleSonoChange = (e) => {
    const filters = { ...this.props.filters, serial_no: e.target.value };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters);
  }
  handleDateChange = (dates, dateString) => {
    const filters = { ...this.props.filters, date: dateString };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters);
  }
  handleAddAllocate = (index) => {
    const inventoryData = [...this.state.inventoryData];
    const allocatedData = [...this.state.allocatedData];
    const outboundProduct = { ...this.state.outboundProduct };
    const allocatedOne = inventoryData[index];
    const allocatedAmount = allocatedData.reduce((pre, cur) => (pre + cur.allocated_qty), 0);
    if (allocatedAmount + (allocatedOne.allocated_qty ? allocatedOne.allocated_qty : allocatedOne.avail_qty) > this.props.outboundProduct.order_qty) {
      message.info('分配数量不能大于订单总数');
      return;
    }
    inventoryData.splice(index, 1);
    allocatedData.push({
      ...allocatedOne,
      allocated_qty: allocatedOne.allocated_qty ? allocatedOne.allocated_qty : allocatedOne.avail_qty,
      allocated_pack_qty: allocatedOne.allocated_pack_qty ? Number(allocatedOne.allocated_pack_qty) : allocatedOne.avail_pack_qty,
    });
    outboundProduct.alloc_qty += allocatedOne.allocated_qty ? allocatedOne.allocated_qty : allocatedOne.avail_qty;
    outboundProduct.alloc_pack_qty = outboundProduct.alloc_qty / allocatedOne.sku_pack_qty;
    this.setState({
      inventoryData,
      allocatedData,
      outboundProduct,
    });
  }
  handleDeleteAllocated = (index) => {
    const inventoryData = [...this.state.inventoryData];
    const allocatedData = [...this.state.allocatedData];
    const outboundProduct = { ...this.state.outboundProduct };
    const deleteOne = allocatedData[index];
    allocatedData.splice(index, 1);
    outboundProduct.alloc_qty -= deleteOne.allocated_qty;
    outboundProduct.alloc_pack_qty = outboundProduct.alloc_qty / deleteOne.sku_pack_qty;
    inventoryData.push(deleteOne);
    this.setState({
      inventoryData,
      allocatedData,
      outboundProduct,
    });
  }
  handleCancel = () => {
    this.props.closeAllocatingModal();
    this.setState({
      inventoryData: [],
      allocatedData: [],
    });
  }
  handleManualAllocSave = () => {
    this.props.manualAlloc(this.props.outboundNo, this.props.outboundProduct.seq_no, this.state.allocatedData.map(ad => ({
      trace_id: ad.trace_id,
      allocated_qty: ad.allocated_qty,
      allocated_pack_qty: ad.allocated_pack_qty,
    })), this.props.loginId, this.props.loginName).then((result) => {
      if (!result.error) {
        this.handleCancel();
      }
    });
  }
  render() {
    const { filters, outboundHead } = this.props;
    const { outboundProduct } = this.state;
    const inventoryQueryForm = (
      <Form layout="inline">
        <FormItem label="库位">
          <Input onChange={this.handleLocationChange} value={filters.location} />
        </FormItem>
        <FormItem label="批次号">
          <Input onChange={this.handleLotnoChange} value={filters.external_lot_no} />
        </FormItem>
        <FormItem label="序列号">
          <Input onChange={this.handleSonoChange} value={filters.serial_no} />
        </FormItem>
        <FormItem label="入库日期">
          <RangePicker onChange={this.handleDateChange} />
        </FormItem>
        { outboundHead.bonded === 1 &&
          <FormItem label="已备案">
            <Checkbox defaultChecked disabled />
          </FormItem>
        }
        { outboundHead.bonded_outtype === CWM_SO_BONDED_REGTYPES[1].value &&
        <FormItem label="已分拨">
          <Checkbox defaultChecked disabled />
        </FormItem>
        }
      </Form>);

    return (
      <Modal title="分配" width="100%" maskClosable={false} wrapClassName="fullscreen-modal"
        onOk={this.handleManualAllocSave} onCancel={this.handleCancel} visible={this.props.visible}
      >
        <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
          <Row className="info-group-inline">
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="商品货号" field={outboundProduct.product_no} style={{ marginBottom: 0 }} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="中文品名" field={outboundProduct.name} style={{ marginBottom: 0 }} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="订货总数" field={<QuantityInput packQty={outboundProduct.order_pack_qty} pcsQty={outboundProduct.order_qty} />}
                style={{ marginBottom: 0 }}
              />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="已分配总数" field={<QuantityInput packQty={outboundProduct.alloc_pack_qty} pcsQty={outboundProduct.alloc_qty} />}
                style={{ marginBottom: 0 }}
              />
            </Col>
            <Col sm={12} md={8} lg={6} />
          </Row>
        </Card>
        <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 16 }}>
          <div className="table-fixed-layout">
            <Table size="middle" columns={this.inventoryColumns} dataSource={this.state.inventoryData} rowKey="trace_id" scroll={{ y: 220 }} />
          </div>
        </Card>
        <Card title="分配明细" bodyStyle={{ padding: 0 }}>
          <div className="table-fixed-layout">
            <Table size="middle" columns={this.allocatedColumns} dataSource={this.state.allocatedData} rowKey="trace_id" scroll={{ y: 220 }} />
          </div>
        </Card>
        {/*
        <Collapse defaultActiveKey={['query', 'details']}>
          <Panel header="库存查询" key="query">
            <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.inventoryColumns} dataSource={this.state.inventoryData} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
          <Panel header="分配明细" key="details">
            <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.allocatedColumns} dataSource={this.state.allocatedData} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
        </Collapse>*/}
      </Modal>
    );
  }
}
