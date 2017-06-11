import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Card, Table, Form, Modal, Input, Tooltip, Row, Col, Button } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideReceiveModal } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmReceive.receiveModal.visible,
  }),
  { hideReceiveModal }
)
export default class AllocatingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    receivingMode: PropTypes.string.isRequired,
  }
  getInitialState() {
    return { modalWidth: 1000 };
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ modalWidth: window.innerWidth - 48 });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideReceiveModal();
  }
  inventoryColumns = [{
    title: '库位',
    dataIndex: 'location',
    width: 180,
  }, {
    title: '入库日期',
    dataIndex: 'inbound_date',
    width: 180,
  }, {
    title: '收货状态',
    dataIndex: 'packing_code',
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 200,
    fixed: 'right',
    render: o => (<span><Tooltip title="包装单位数量"><Input size="small" className="readonly" style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input size="small" value={o} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '分配',
    width: 80,
    fixed: 'right',
    render: () => (<span><Button type="primary" size="small" icon="plus" /></span>),
  }]

  allocatedColumns = [{
    title: '库位',
    dataIndex: 'location',
    width: 180,
  }, {
    title: '入库日期',
    dataIndex: 'inbound_date',
    width: 180,
  }, {
    title: '收货状态',
    dataIndex: 'packing_code',
  }, {
    title: '分配数量',
    dataIndex: 'allocated_qty',
    width: 200,
    fixed: 'right',
    render: () => (<span><Input size="small" style={{ width: 80 }} disabled />
      <Input size="small" style={{ width: 80 }} disabled /></span>),
  }, {
    title: '取消',
    width: 80,
    fixed: 'right',
    render: () => (<span><Button type="danger" size="small" ghost icon="minus" /></span>),
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
    trace_id: 'T04601170521',
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
    return (
      <Modal title="分配" width={this.state.modalWidth} maskClosable={false} style={{ top: 24 }} onCancel={this.handleCancel} visible={this.props.visible}>
        <Card bodyStyle={{ padding: 0 }}>
          <Form layout="inline" style={{ padding: 16 }}>
            <FormItem label="商品货号" style={{ marginBottom: 0 }}>
              <Input value="I096120170603223-01" disabled />
            </FormItem>
            <FormItem label="库位" style={{ marginBottom: 0 }}>
              <Input />
            </FormItem>
            <FormItem label="批次号" style={{ marginBottom: 0 }}>
              <Input />
            </FormItem>
            <FormItem label="序列号" style={{ marginBottom: 0 }}>
              <Input />
            </FormItem>
            <FormItem label="" style={{ marginBottom: 0 }}>
              <Input />
            </FormItem>
            <FormItem style={{ marginBottom: 0 }}>
              <Button type="primary" ghost size="large">库存查询</Button>
            </FormItem>
          </Form>
          <Table size="middle" columns={this.inventoryColumns} dataSource={this.dataSource} rowKey="trace_id" scroll={{ y: 220 }} />
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Row style={{ padding: 16 }}>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="商品货号" field="I096120170603223-01" style={{ marginBottom: 0 }} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="订单数量" field={<span>
                <Tooltip title="包装单位数量"><Input value={3} className="readonly" style={{ width: 80 }} /></Tooltip>
                <Tooltip title="主单位数量"><Input value={300} style={{ width: 80 }} disabled /></Tooltip></span>}
                style={{ marginBottom: 0 }}
              />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem addonBefore="累计分配数量" field={<span className="mdc-text-red">
                <Tooltip title="包装单位数量"><Input value={1} className="readonly" style={{ width: 80 }} /></Tooltip>
                <Tooltip title="主单位数量"><Input value={100} style={{ width: 80 }} disabled /></Tooltip></span>}
                style={{ marginBottom: 0 }}
              />
            </Col>
            <Col sm={12} md={8} lg={6} />
          </Row>
          <Table size="middle" columns={this.allocatedColumns} dataSource={this.dataSource} rowKey="trace_id" scroll={{ y: 220 }} />
        </Card>
      </Modal>
    );
  }
}
