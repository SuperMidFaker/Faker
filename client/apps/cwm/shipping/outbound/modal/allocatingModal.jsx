import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, Collapse, DatePicker, Table, Form, Modal, Input, Tag, Tooltip, Row, Col, Button } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeAllocatingModal } from 'common/reducers/cwmOutbound';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Panel = Collapse.Panel;

const dateFormat = 'YYYY/MM/DD';

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.allocatingModal.visible,
  }),
  { closeAllocatingModal }
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
    this.props.closeAllocatingModal();
  }
  inventoryColumns = [{
    title: 'SKU',
    dataIndex: 'sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'lot_no',
    width: 100,
  }, {
    title: '序列号',
    dataIndex: 'sn_no',
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
    title: '库别',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '入库日期',
    dataIndex: 'inbound_date',
    width: 180,
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 200,
    fixed: 'right',
    render: o => (<span><Tooltip title="包装单位数量"><Input size="small" className="readonly" style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input size="small" value={o} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '出库数量',
    width: 200,
    fixed: 'right',
    render: () => (<span><Tooltip title="包装单位数量"><Input size="small" style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input size="small" style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: () => (<span><Button type="primary" size="small" icon="plus" /></span>),
  }]

  allocatedColumns = [{
    title: 'SKU',
    dataIndex: 'sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'lot_no',
    width: 100,
  }, {
    title: '序列号',
    dataIndex: 'sn_no',
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
    title: '库别',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<span><Tooltip title="包装单位数量"><Input value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '删除',
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
    desc_cn: '微纤维止血胶原粉',
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
    desc_cn: '微纤维止血胶原粉',
    packing_code: '残次',
    unit: '个',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }];
  render() {
    const inventoryQueryForm = (<Form layout="inline" style={{ display: 'inline-block' }}>
      <FormItem label="库位">
        <Input />
      </FormItem>
      <FormItem label="批次号">
        <Input />
      </FormItem>
      <FormItem label="序列号">
        <Input />
      </FormItem>
      <FormItem label="入库日期">
        <RangePicker
          defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
          format={dateFormat}
        />
      </FormItem>
      <FormItem>
        <Button type="primary" ghost size="large">查询</Button>
      </FormItem>
    </Form>);

    return (
      <Modal title="分配" width={this.state.modalWidth} maskClosable={false} style={{ top: 24 }} onCancel={this.handleCancel} visible={this.props.visible}>
        <Row>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="商品货号" field="I096120170603223-01" style={{ marginBottom: 0 }} />
          </Col>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="中文品名" field="微纤维止血胶原粉" style={{ marginBottom: 0 }} />
          </Col>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="订货总数" field={<span>
              <Tooltip title="包装单位数量"><Input value={3} className="readonly" style={{ width: 80 }} /></Tooltip>
              <Tooltip title="主单位数量"><Input value={300} style={{ width: 80 }} disabled /></Tooltip></span>}
              style={{ marginBottom: 0 }}
            />
          </Col>
          <Col sm={12} md={8} lg={6}>
            <InfoItem addonBefore="分配总数" field={<span className="mdc-text-red">
              <Tooltip title="包装单位数量"><Input value={1} className="readonly" style={{ width: 80 }} /></Tooltip>
              <Tooltip title="主单位数量"><Input value={100} style={{ width: 80 }} disabled /></Tooltip></span>}
              style={{ marginBottom: 0 }}
            />
          </Col>
          <Col sm={12} md={8} lg={6} />
        </Row>
        <Collapse bordered={false} defaultActiveKey={['2']}>
          <Panel header="库存查询" key="1">
            <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.inventoryColumns} dataSource={this.dataSource} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
          <Panel header="分配明细" key="2">
            <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.allocatedColumns} dataSource={this.dataSource} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
        </Collapse>
      </Modal>
    );
  }
}
