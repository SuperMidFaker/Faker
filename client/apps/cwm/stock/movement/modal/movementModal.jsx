import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, DatePicker, Table, Select, Form, Modal, Input, Tag, Button, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeMovementModal, inventorySearch, createMovement, loadMovements, setMovementsFilter } from 'common/reducers/cwmMovement';
import { CWM_MOVE_TYPE } from 'common/constants';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visible: state.cwmMovement.movementModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    loginName: state.account.username,
    owners: state.cwmContext.whseAttrs.owners,
    filter: state.cwmMovement.movementModal.filter,
    tenantId: state.account.tenantId,
    movements: state.cwmMovement.movements,
    movementFilter: state.cwmMovement.movementFilter,
  }),
  { closeMovementModal, inventorySearch, createMovement, loadMovements, setMovementsFilter }
)
export default class MovementModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    stocks: [],
    movements: [],
    moveType: 1,
    owner: {},
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: (window.innerHeight - 460) / 2,
      });
    }
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
    dataIndex: 'inbound_timestamp',
    width: 100,
    render: o => o && moment(o).format('YYYY.MM.DD'),
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 100,
  }, {
    title: '待移库数量',
    dataIndex: 'moving_qty',
    width: 100,
  }, {
    title: '目标库位',
    width: 150,
    dataIndex: 'target_location',
    render: (o, record, index) => (<LocationSelect style={{ width: 100 }} value={o} onSelect={value => this.handleSelect(value, index)} showSearch />),
  }, {
    title: '移动数量',
    width: 200,
    dataIndex: 'movement_qty',
    render: (o, record, index) => {
      if (record.trace_pack_qty === -1) {
        return <Input value={o} type="number" onChange={ev => this.handleMoveQtyChange(ev.target.value, index)} style={{ width: 80 }} />;
      } else {
        return <span>{record.avail_qty}</span>;
      }
    },
  }, {
    title: '添加',
    width: 80,
    render: (o, record, index) => <Button disabled={record.avail_qty === 0} type="primary" size="small" icon="plus" onClick={() => this.handleAddMovement(index)} />,
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
    width: 150,
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
    if (!this.state.owner.id) {
      message.info('请选择货主');
      return;
    }
    if (!filter.productNo && !filter.location) {
      message.info('请填写货品或库位');
      return;
    }
    this.props.inventorySearch(JSON.stringify(filter), this.props.tenantId,
      this.props.defaultWhse.code, this.state.owner.id).then((result) => {
        if (!result.err) {
          this.setState({
            stocks: result.data.map(item => ({ ...item, moving_qty: 0 })),
          });
        }
      });
  }
  handleOwnerChange = (value) => {
    const owner = this.props.owners.find(item => item.id === value);
    if (owner) {
      this.setState({ owner });
    }
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
  handleAddMovement = (index) => {
    const stocks = [...this.state.stocks];
    const movements = [...this.state.movements];
    const movementOne = { ...stocks[index] };
    if (!movementOne.target_location) {
      message.info('请选择目标库位');
      return;
    }
    if (movementOne.trace_pack_qty !== -1) {
      movementOne.movement_qty = movementOne.avail_qty;
    } else if (isNaN(parseFloat(movementOne.movement_qty))) {
      message.info('请输入移动数量');
      return;
    }
    stocks[index].avail_qty -= movementOne.movement_qty;
    stocks[index].moving_qty += movementOne.movement_qty;
    stocks[index].movement_qty = '';
    stocks[index].target_location = '';
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
    this.props.createMovement(this.state.owner.id, this.state.owner.name, this.state.moveType, '', this.props.defaultWhse.code, this.props.tenantId,
      this.props.loginName, this.state.movements).then((result) => {
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
    const qty = parseFloat(value);
    if (isNaN(qty) || qty > stocks[index].avail_qty || qty < 0) {
      message.info('请输入正确的数量');
      return;
    }
    stocks[index].movement_qty = qty;
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
    const { owners } = this.props;
    const { stocks, movements, owner } = this.state;
    const inventoryQueryForm = (<Form layout="inline">
      <FormItem label="货品">
        <Input onChange={this.handleProductChange} placeholder="按货号模糊匹配" disabled={!owner.id} />
      </FormItem>
      <FormItem label="库位">
        <LocationSelect style={{ width: 160 }} value={this.props.filter.location} onSelect={this.handleLocationChange} disabled={!owner.id} />
      </FormItem>
      <FormItem label="入库日期">
        <RangePicker onChange={this.handleDateChange} />
      </FormItem>
      <FormItem>
        <Button type="primary" ghost onClick={this.handleSearch} disabled={!owner.id}>库存查询</Button>
      </FormItem>
    </Form>);
    const title = (<div>
      <span>库存移动单</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" disabled={!movements.length > 0} onClick={this.handleCreateMovement}>保存</Button>
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card bodyStyle={{ padding: 16 }} noHovering>
          <Form layout="inline">
            <FormItem label="货主">
              <Select onChange={this.handleOwnerChange} style={{ width: 300 }} placeholder="请选择货主">
                {owners.map(own => (<Option value={own.id} key={own.name}>{own.name}</Option>))}
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
        <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} noHovering>
          <div className="table-panel table-fixed-layout">
            <Table size="middle" columns={this.stocksColumns} dataSource={stocks} rowKey="id"
              scroll={{ x: this.stocksColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
            />
          </div>
        </Card>
        <Card title="移库明细" bodyStyle={{ padding: 0 }} noHovering>
          <div className="table-panel table-fixed-layout">
            <Table size="middle" columns={this.movementColumns} dataSource={movements.map((movement, index) => ({ ...movement, index }))} rowKey="index"
              scroll={{ x: this.movementColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
            />
          </div>
        </Card>
      </Modal>
    );
  }
}
