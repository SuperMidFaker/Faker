import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, Collapse, DatePicker, Table, Form, Modal, Input, Tag, Button } from 'antd';
import { format } from 'client/common/i18n/helpers';
import QuantityInput from '../../../common/quantityInput';
import messages from '../../message.i18n';
import { closeMovementModal } from 'common/reducers/cwmStock';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    visible: state.cwmStock.movementModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    loginName: state.account.username,

  }),
  { closeMovementModal }
)
export default class MovementModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
  }

  msg = key => formatMsg(this.props.intl, key);
  inventoryColumns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
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
    title: '库别',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '入库日期',
    dataIndex: 'created_date',
    width: 180,
    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 200,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.avail_pack_qty} pcsQty={record.avail_qty} />),
  }, {
    title: '出库数量',
    width: 200,
    fixed: 'right',
    render: (o, record, index) => (<QuantityInput onChange={e => this.handleAllocChange(e.target.value, index)} packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record, index) => <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddAllocate(index)} />,
  }]

  allocatedColumns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
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
    render: (o, record) => (<QuantityInput packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '删除',
    width: 80,
    fixed: 'right',
    render: (o, record, index) => (<span><Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDeleteAllocated(index)} /></span>),
  }]

  handleCancel = () => {
    this.props.closeMovementModal();
    this.setState({
    });
  }

  render() {
    const inventoryQueryForm = (<Form layout="inline" style={{ display: 'inline-block' }}>
      <FormItem label="库位">
        <Input onChange={this.handleLocationChange} value={'filters.location'} />
      </FormItem>
      <FormItem label="批次号">
        <Input onChange={this.handleLotnoChange} value={'filters.external_lot_no'} />
      </FormItem>
      <FormItem label="序列号">
        <Input onChange={this.handleSonoChange} value={'filters.serial_no'} />
      </FormItem>
      <FormItem label="入库日期">
        <RangePicker onChange={this.handleDateChange} />
      </FormItem>
    </Form>);

    return (
      <Modal title="创建库存移动单" width="100%" maskClosable={false} wrapClassName="fullscreen-modal"
        onOk={this.handleManualAllocSave} onCancel={this.handleCancel} visible={this.props.visible}
      >
        <Collapse bordered={false} defaultActiveKey={['1', '2']}>
          <Panel header="库存查询" key="1">
            <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.inventoryColumns} dataSource={this.state.inventoryData} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
          <Panel header="移库明细" key="2">
            <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.allocatedColumns} dataSource={this.state.allocatedData} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
        </Collapse>
      </Modal>
    );
  }
}
