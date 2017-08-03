import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, DatePicker, Table, Select, Form, Modal, Input, Tag, Button, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeMovementModal, inventorySearch, createMovement, loadMovements, setMovementsFilter } from 'common/reducers/cwmInventoryStock';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import { CWM_MOVE_TYPE } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
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
    movements: state.cwmInventoryStock.movements,
    movementFilter: state.cwmInventoryStock.movementFilter,
  }),
  { closeMovementModal, inventorySearch, loadLocations, createMovement, loadMovements, setMovementsFilter }
)
export default class MovementModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    stocks: [],
    movements: [],
    moveType: 1,
  }
  componentWillMount() {
    this.props.loadLocations(this.props.defaultWhse.code, '', this.props.tenantId);
  }
  msg = key => formatMsg(this.props.intl, key);
  stocksColumns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
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
    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 200,
  }, {
    title: '目标库位',
    width: 100,
    dataIndex: 'target_location',
    render: (o, record, index) => (<Select style={{ width: 100 }} value={o} onSelect={value => this.handleSelect(value, index)} showSearch>
      {this.props.locations.map(loc => <Option value={loc.location} key={loc.location}>{loc.location}</Option>)}
    </Select>),
  }, {
    title: '移动数量',
    width: 200,
    dataIndex: 'movement_qty',
    render: (o, record, index) => {
      if (record.trace_pack_qty) {
        return <Input value={o} onChange={e => this.handleMoveQtyChange(e.target.value, index)} style={{ width: 80 }} />;
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
    width: 160,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
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
    dataIndex: 'spacer',
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
  handleSearch = () => {
    const { filter } = this.props;
    if (!filter.ownerCode) {
      message.info('请选择货主');
      return;
    }
    if (!filter.productNo && !filter.location) {
      message.info('请填写货品或库位');
      return;
    }
    this.props.inventorySearch(JSON.stringify(filter), this.props.tenantId, this.props.defaultWhse.code).then((result) => {
      if (!result.err) {
        this.setState({
          stocks: result.data,
        });
      }
    });
  }
  handleOwnerChange = (value) => {
    const owner = this.props.owners.find(item => item.id === value);
    const newFilter = { ...this.props.filter, ownerCode: value, ownerName: owner.name };
    this.props.setMovementsFilter(newFilter);
  }
  handleProductChange = (e) => {
    const newFilter = { ...this.props.filter, productNo: e.target.value };
    this.props.setMovementsFilter(newFilter);
  }
  handleLocationChange = (value) => {
    const newFilter = { ...this.props.filter, location: value };
    this.props.setMovementsFilter(newFilter);
  }
  handleDateChange = (dates, dateString) => {
    const newFilter = { ...this.props.filter, startTime: dateString[0], endTime: dateString[1] };
    this.props.setMovementsFilter(newFilter);
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
      return;
    }
    if (!movementOne.movement_qty) {
      message.info('请输入移动数量');
      return;
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
    this.props.createMovement(this.props.filter.ownerCode, this.props.filter.ownerName, this.state.moveType, '', this.props.defaultWhse.code, this.props.tenantId,
      this.props.loginId, this.state.movements).then((result) => {
        if (!result.err) {
          this.props.closeMovementModal();
          this.props.loadMovements({
            whseCode: this.props.defaultWhse.code,
            tenantId: this.props.tenantId,
            pageSize: this.props.movements.pageSize,
            current: this.props.movements.current,
            filter: this.props.movementFilter,
          });
          this.setState({
            stocks: [],
            movements: [],
          });
        }
      });
  }
  handleMoveQtyChange = (value, index) => {
    const stocks = [...this.state.stocks];
    if (value > stocks[index].avail_qty || value < 0) {
      message.info('请输入正确的数量');
      return;
    }
    stocks[index].movement_qty = value;
    this.setState({
      stocks,
    });
  }
  handleSelectMoveType = (value) => {
    this.setState({
      moveType: value,
    });
  }
  render() {
    const { owners, filter, locations } = this.props;
    const { stocks, movements } = this.state;
    const inventoryQueryForm = (<Form layout="inline">
      <FormItem label="货品">
        <Input onChange={this.handleProductChange} placeholder="按货号模糊匹配" disabled={!filter.ownerCode} />
      </FormItem>
      <FormItem label="库位">
        <Select showSearch style={{ width: 160 }} onSelect={this.handleLocationChange} disabled={!filter.ownerCode}>
          {locations.map(loc => <Option value={loc.location} key={loc.location}>{loc.location}</Option>)}
        </Select>
      </FormItem>
      <FormItem label="入库日期">
        <RangePicker onChange={this.handleDateChange} />
      </FormItem>
      <FormItem>
        <Button type="primary" ghost onClick={this.handleSearch} disabled={!filter.ownerCode}>库存查询</Button>
      </FormItem>
    </Form>);

    return (
      <Modal title="创建库存移动单" width="100%" maskClosable={false} wrapClassName="fullscreen-modal"
        onOk={this.handleCreateMovement} onCancel={this.handleCancel} visible={this.props.visible}
      >
        <Card title="库存移动单" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
          <Form layout="inline">
            <FormItem label="货主">
              <Select onChange={this.handleOwnerChange} style={{ width: 300 }} placeholder="请选择货主">
                {owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))}
              </Select>
            </FormItem>
            <FormItem label="移库类型">
              <Select style={{ width: 320 }} onSelect={this.handleSelectMoveType} value={this.state.moveType}>
                {CWM_MOVE_TYPE.map(item => <Option value={item.value} key={item.value}>{item.text}</Option>)}
              </Select>
            </FormItem>
            <FormItem label="原因">
              <Input />
            </FormItem>
          </Form>
        </Card>
        <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 16 }}>
          <div className="table-fixed-layout">
            <Table size="middle" columns={this.stocksColumns} dataSource={stocks} rowKey="id" scroll={{ y: 220 }} />
          </div>
        </Card>
        <Card title="移库明细" bodyStyle={{ padding: 0 }}>
          <div className="table-fixed-layout">
            <Table size="middle" columns={this.movementColumns} dataSource={movements} rowKey="id" scroll={{ y: 220 }} />
          </div>
        </Card>
      </Modal>
    );
  }
}
