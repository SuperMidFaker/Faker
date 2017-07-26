import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, Collapse, DatePicker, Table, Select, Form, Modal, Input, Tag, Button, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeMovementModal, inventorySearch, createMovement } from 'common/reducers/cwmInventoryStock';
import { loadLocations } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visible: state.cwmInventoryStock.movementModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    loginName: state.account.username,
    owners: state.cwmContext.whseAttrs.owners,
    filter: state.cwmInventoryStock.movementModal.filter,
    tenantId: state.account.tenantId,
    locations: state.cwmWarehouse.locations,
  }),
  { closeMovementModal, inventorySearch, loadLocations, createMovement }
)
export default class MovementModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    stocks: [],
    movements: [],
  }
  componentWillMount() {
    this.props.loadLocations(this.props.defaultWhse.code, '', this.props.tenantId);
  }
  msg = key => formatMsg(this.props.intl, key);
  stocksColumns = [{
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
    title: '当前库位',
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
    width: 180,
    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 200,
  }, {
    title: '目标库位',
    width: 100,
    dataIndex: 'target_location',
    render: (o, record, index) => (<Select style={{ width: 100 }} onSelect={value => this.handleSelect(value, index)}>
      {this.props.locations.map(loc => <Option value={loc.location} key={loc.location}>{loc.location}</Option>)}
    </Select>),
  }, {
    title: '移动数量',
    width: 200,
    dataIndex: 'movement_qty',
    render: (o, record, index) => {
      if (record.trace_id) {
        return <Input disabled value={o} style={{ width: 80 }} />;
      } else {
        return <Input onChange={e => this.handleMovementChange(e.target.value, index)} style={{ width: 80 }} />;
      }
    },
  }, {
    title: '添加',
    width: 80,
    render: (o, record, index) => <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddMovement(index)} />,
  }]

  movementColumns = [{
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
    title: '当前库位',
    dataIndex: 'location',
    width: 100,
    render: o => <Tag>{o}</Tag>,
  }, {
    title: '目标库位',
    dataIndex: 'target_location',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '移库数量',
    width: 200,
    dataIndex: 'movement_qty',
    render: o => <Input disabled value={o} style={{ width: 80 }} />,
  }, {
    title: '删除',
    width: 80,
    render: (o, record, index) => (<span><Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDeleteMovement(index)} /></span>),
  }]

  handleCancel = () => {
    this.props.closeMovementModal();
    this.setState({
    });
  }
  handleSearch = (filter) => {
    this.props.inventorySearch(JSON.stringify(filter), this.props.tenantId).then((result) => {
      if (!result.err) {
        this.setState({
          stocks: result.data,
        });
      }
    });
  }
  handleOwnerChange = (value) => {
    const newFilter = { ...this.props.filter, owner: value };
    this.handleSearch(newFilter);
  }
  handleProductChange = (e) => {
    const newFilter = { ...this.props.filter, productNo: e.target.value };
    this.handleSearch(newFilter);
  }
  handleLocationChange = (e) => {
    const newFilter = { ...this.props.filter, location: e.target.value };
    this.handleSearch(newFilter);
  }
  handleDateChange = (dates, dateString) => {
    const newFilter = { ...this.props.filters, startTime: dateString[0], endTime: dateString[1] };
    this.handleSearch(newFilter);
  }
  handleMovementChange = (value, index) => {
    const stocks = [...this.state.stocks];
    stocks[index].movement_qty = value;
    this.setState({
      stocks,
    });
  }
  handleAddMovement = (index) => {
    const stocks = [...this.state.stocks];
    const movements = [...this.state.movements];
    const movementOne = stocks[index];
    if (!movementOne.target_location) {
      message.info('请选择目标库位');
    }
    stocks.splice(index, 1);
    movements.push(movementOne);
    this.setState({
      stocks,
      movements,
    });
  }
  handleDeleteMovement = (index) => {
    const stocks = [...this.state.stocks];
    const movements = [...this.state.movements];
    const deleteOne = movements[index];
    movements.splice(index, 1);
    stocks.push(deleteOne);
    this.setState({
      stocks,
      movements,
    });
  }
  handleSelect = (value, index) => {
    const stocks = [...this.state.stocks];
    stocks[index].target_location = value;
    this.setState({
      stocks,
    });
  }
  handleCreateMovement = () => {
    this.props.createMovement(this.props.filter.owner, '', '', this.state.movements);
  }
  render() {
    const { owners } = this.props;
    const { stocks, movements } = this.state;
    const inventoryQueryForm = (<Form layout="inline" style={{ display: 'inline-block' }}>
      <FormItem label="货品">
        <Input onChange={this.handleProductChange} />
      </FormItem>
      <FormItem label="库位">
        <Input onChange={this.handleLocationChange} />
      </FormItem>
      <FormItem label="入库日期">
        <RangePicker onChange={this.handleDateChange} />
      </FormItem>
    </Form>);

    return (
      <Modal title="创建库存移动单" width="100%" maskClosable={false} wrapClassName="fullscreen-modal"
        onOk={this.handleCreateMovement} onCancel={this.handleCancel} visible={this.props.visible}
      >
        <Card>
          <Form layout="inline" style={{ display: 'inline-block' }}>
            <FormItem label="货主">
              <Select onChange={this.handleOwnerChange} style={{ width: 160 }} dropdownMatchSelectWidth={false}>
                {owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))}
              </Select>
            </FormItem>
            <FormItem label="移库类型">
              <Select style={{ width: 160 }} />
            </FormItem>
            <FormItem label="原因">
              <Input />
            </FormItem>
          </Form>
        </Card>
        <Collapse bordered={false} defaultActiveKey={['query', 'detail']}>
          <Panel header="库存查询" key="query">
            <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 8 }}>
              <Table size="middle" columns={this.stocksColumns} dataSource={stocks} rowKey="id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
          <Panel header="库存移动明细" key="detail">
            <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 8 }}>
              <Table size="middle" columns={this.movementColumns} dataSource={movements} rowKey="id" scroll={{ y: 220 }} />
            </Card>
          </Panel>
        </Collapse>
      </Modal>
    );
  }
}
