import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Collapse, DatePicker, Table, Form, Modal, Select, Tag, Input } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeBatchDeclModal } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    visible: state.cwmShFtz.batchDeclModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { closeBatchDeclModal }
)
export default class BatchDeclModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    modalWidth: 1000,
    modalHeight: 800,
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ modalWidth: window.innerWidth, modalHeight: window.innerHeight });
    }
  }

  msg = key => formatMsg(this.props.intl, key);
  inventoryColumns = [{
    title: '分拨出库单号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '货主',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '收货单位',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '出库日期',
    dataIndex: 'created_date',

    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record, index) => <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddAllocate(index)} />,
  }]

  allocatedColumns = [{
    title: '备案料号',
    dataIndex: 'product_sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: 'HS编码',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '原产国',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '单位',
    dataIndex: 'location',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '数量',
    width: 200,
  }, {
    title: '毛重',
    width: 200,
  }, {
    title: '净重',
    width: 200,
  }, {
    title: '金额',
    width: 200,
  }, {
    title: '币制',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '删除',
    width: 80,
    fixed: 'right',
    render: (o, record, index) => (<span><Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDeleteAllocated(index)} /></span>),
  }]
  handleCancel = () => {
    this.props.closeBatchDeclModal();
  }

  render() {
    const inventoryQueryForm = (<Form layout="inline" style={{ display: 'inline-block' }}>
      <FormItem label="货主">
        <Select onChange={this.handleOwnerChange} style={{ width: 160 }} />
      </FormItem>
      <FormItem label="单号">
        <Input />
      </FormItem>
      <FormItem label="出库日期">
        <RangePicker onChange={this.handleDateChange} />
      </FormItem>
    </Form>);

    return (
      <Modal title="集中报关" width={this.state.modalWidth} maskClosable={false} style={{ top: 0, bottom: 0 }}
        onOk={this.handleManualAllocSave} onCancel={this.handleCancel} visible={this.props.visible}
      >
        <Collapse bordered={false} defaultActiveKey={['1', '2']}>
          <Panel header="分拨出库单" key="1">
            <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.inventoryColumns} dataSource={this.state.inventoryData} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
          <Panel header="报关申请明细" key="2">
            <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }}>
              <Table size="middle" columns={this.allocatedColumns} dataSource={this.state.allocatedData} rowKey="trace_id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
        </Collapse>
      </Modal>
    );
  }
}
