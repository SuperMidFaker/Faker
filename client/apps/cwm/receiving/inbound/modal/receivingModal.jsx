import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Table, Icon, Modal, Input, Tooltip, Row, Col, Select } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideReceiveModal } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cwmReceive.receiveModal.visible,
  }),
  { hideReceiveModal }
)
export default class ReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    receivingMode: PropTypes.string.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideReceiveModal();
  }
  columns = [{
    title: '追踪号',
    dataIndex: 'trace_id',
    width: 200,
    render: o => (<Input className="readonly" prefix={<Icon type="qrcode" />} value={o} />),
  }, {
    title: '箱/托盘编号',
    dataIndex: 'convey_no',
    width: 180,
    render: o => (<Input className="readonly" value={o} />),
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 180,
    render: o => (<Select defaultValue={o} showSearch style={{ width: 180 }} disabled />),
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
    title: '收货状态',
    dataIndex: 'packing_code',
    render: o => (<Select defaultValue={o} style={{ width: 60 }} disabled />),
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
    return (
      <Modal title="收货" width={900} maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible}>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <InfoItem label="商品货号" field="I096120170603223-01" />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem label="预期数量" field={<span>
              <Tooltip title="包装单位数量"><Input value={3} className="readonly" style={{ width: 80 }} /></Tooltip>
              <Tooltip title="主单位数量"><Input value={300} style={{ width: 80 }} disabled /></Tooltip></span>}
            />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem label="累计收货数量" field={<span className="mdc-text-red">
              <Tooltip title="包装单位数量"><Input value={1} className="readonly" style={{ width: 80 }} /></Tooltip>
              <Tooltip title="主单位数量"><Input value={100} style={{ width: 80 }} disabled /></Tooltip></span>}
            />
          </Col>
        </Row>
        <Table size="middle" columns={this.columns} dataSource={receivingMode === 'scan' ? this.dataSource : null} rowKey="trace_id" />
      </Modal>
    );
  }
}
