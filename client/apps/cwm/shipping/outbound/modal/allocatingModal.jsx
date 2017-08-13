import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, DatePicker, Table, Form, Modal, Input, Tag, Row, Col, Button, Select, message, Checkbox } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import QuantityInput from '../../../common/quantityInput';
import messages from '../../message.i18n';
import { closeAllocatingModal, loadProductInboundDetail, loadAllocatedDetails, manualAlloc, setInventoryFilter, changeColumns } from 'common/reducers/cwmOutbound';
import { CWM_SO_BONDED_REGTYPES } from 'common/constants';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;

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
    tenantId: state.account.tenantId,
    inventoryColumns: state.cwmOutbound.inventoryColumns,
    inventoryDataLoading: state.cwmOutbound.inventoryDataLoading,
    allocatedDataLoading: state.cwmOutbound.allocatedDataLoading,
  }),
  { closeAllocatingModal,
    loadProductInboundDetail,
    loadAllocatedDetails,
    manualAlloc,
    setInventoryFilter,
    changeColumns }
)
export default class AllocatingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    seqNo: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired,
    inventoryDataLoading: PropTypes.bool.isRequired,
    allocatedDataLoading: PropTypes.bool.isRequired,
  }
  state = {
    inventoryData: [],
    allocatedData: [],
    outboundProduct: {},
    searchContent: '',

  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: (window.innerHeight - 460) / 2,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      const { outboundHead } = nextProps;
      this.props.loadProductInboundDetail(nextProps.outboundProduct.product_sku, nextProps.defaultWhse.code, nextProps.filters,
        outboundHead.bonded, outboundHead.bonded_outtype, nextProps.outboundHead.owner_partner_id);
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
          deleteDisabled: true,
        })),
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  inventoryColumns = [{
    title: '加入',
    width: 60,
    render: (o, record, index) => {
      let disabled = !this.props.editable || !record.location;  // 不可编辑 或 没有库位时disable
      if (!disabled) {
        const outboundHead = this.props.outboundHead;
        if (outboundHead.bonded && outboundHead.bonded_outtype === 'normal') {
          disabled = !record.ftz_ent_filed_id;                  // 没有明细ID时disable
        }
        if (outboundHead.bonded && outboundHead.bonded_outtype === 'portion') {
          disabled = !(record.ftz_ent_filed_id && record.portion); // 有明细ID 且 是分拨库存时不disable
        }
        if (!record.avail_qty || record.avail_qty === 0) {  // 可用库存为空或等于0时disable
          disabled = true;
        }
      }
      return <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddAllocate(index)} disabled={disabled} />;
    },
  }, {
    title: '现分配数量',
    width: 200,
    render: (o, record, index) => (<QuantityInput size="small" onChange={e => this.handleAllocChange(e.target.value, index)} packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
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
    title: '库存数量',
    dataIndex: 'stock_qty',
    width: 100,
    className: 'cell-align-right text-emphasis',
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 100,
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <span className="text-success">{text}</span>;
      }
    },
  }, {
    title: '分配数量',
    dataIndex: 'alloc_qty',
    width: 100,
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <span className="text-warning">{text}</span>;
      }
    },
  }, {
    title: '冻结数量',
    dataIndex: 'frozen_qty',
    width: 100,
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <span className="text-error">{text}</span>;
      }
    },
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
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 160,
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 80,
    render: bonded => bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_filed_id',
    width: 120,
  }, {
    title: '分拨货物',
    dataIndex: 'portion',
    width: 80,
    className: 'cell-align-center',
    render: portion => portion ? '是' : '否',
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 150,
  }, {
    title: '产品序列号',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
    width: 100,
  }, {
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 100,
  }, {
    title: '海关入库单号',
    dataIndex: 'ftz_ent_no',
    width: 100,
  }, {
    title: '报关单号',
    dataIndex: 'cus_decl_no',
    width: 100,
  }, {
    title: '入库日期',
    dataIndex: 'inbound_timestamp',
    render: inboundts => inboundts && moment(inboundts).format('YYYY.MM.DD'),
  }]

  allocatedColumns = [{
    title: '移出',
    width: 60,
    render: (o, record, index) => (record.deleteDisabled === true ? '' : <Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDeleteAllocated(index)} disabled={!this.props.editable} />),
  }, {
    title: '已分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
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
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 160,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 150,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 80,
    render: bonded => bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>,
  }, {
    title: '入库日期',
    dataIndex: 'inbound_timestamp',
    width: 100,
    render: inboundts => inboundts && moment(inboundts).format('YYYY.MM.DD'),
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
    width: 150,
  }, {
    title: '海关入库单号',
    dataIndex: 'ftz_ent_no',
    width: 150,
  }, {
    title: '报关单号',
    dataIndex: 'cus_decl_no',
    width: 150,
  }, {
    dataIndex: 'spacer',
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
  handleLocationChange = (value) => {
    const { outboundHead } = this.props;
    const filters = { ...this.props.filters, location: value };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters,
      outboundHead.bonded, outboundHead.bonded_outtype, outboundHead.owner_partner_id);
  }
  handleDateChange = (dates, dateString) => {
    const { outboundHead } = this.props;
    const filters = { ...this.props.filters, startTime: new Date(dateString[0]).setHours(0, 0, 0, 0), endTime: new Date(dateString[1]).setHours(0, 0, 0, 0) };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters,
      outboundHead.bonded, outboundHead.bonded_outtype, outboundHead.owner_partner_id);
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
    if (this.state.allocatedData.length === 0) {
      message.info('请分配数量');
    } else {
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
  }
  handleSelectChangeType = (value) => {
    const filters = { ...this.props.filters, searchType: value };
    this.props.setInventoryFilter(filters);
    this.props.changeColumns(value);
  }
  handleSearchContentChange = (e) => {
    this.setState({
      searchContent: e.target.value,
    });
  }
  handleSearchDetails = () => {
    const { outboundHead } = this.props;
    const filters = { ...this.props.filters, searchContent: this.state.searchContent };
    this.props.loadProductInboundDetail(this.props.outboundProduct.product_sku, this.props.defaultWhse.code, filters,
      outboundHead.bonded, outboundHead.bonded_outtype, outboundHead.owner_partner_id);
  }
  render() {
    const { filters, outboundHead, inventoryColumns, editable } = this.props;
    const { outboundProduct } = this.state;
    const filterColumns = this.inventoryColumns.filter(col => inventoryColumns[col.dataIndex] !== false);
    const searchOptions = (
      <Select defaultValue={filters.searchType} style={{ width: 120 }} onSelect={this.handleSelectChangeType}>
        <Option value="external_lot_no">批次号</Option>
        <Option value="serial_no">序列号</Option>
        <Option value="po_no">采购订单号</Option>
        <Option value="asn_no">ASN编号</Option>
        <Option value="ftz_ent_no">海关入库单号</Option>
        <Option value="cus_decl_no">报关单号</Option>
      </Select>
    );
    const inventoryQueryForm = (
      <Form layout="inline">
        <FormItem>
          <Input.Search addonBefore={searchOptions} onChange={this.handleSearchContentChange} placeholder="查询条件"
            value={this.state.searchContent} style={{ width: 380 }} onSearch={this.handleSearchDetails}
          />
        </FormItem>
        <FormItem label="库位">
          <LocationSelect showSearch onChange={this.handleLocationChange} value={filters.location} style={{ width: 160 }} />
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

    const title = (<div>
      <span>出库分配</span>
      <div className="toolbar-right">
        {!editable && <Button onClick={this.handleCancel}>关闭</Button>}
        {editable && <Button onClick={this.handleCancel}>取消</Button>}
        {editable && <Button type="primary" onClick={this.handleManualAllocSave}>保存</Button>}
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        visible={this.props.visible} footer={null}
      >
        <Card bodyStyle={{ paddingBottom: 16 }} style={{ marginBottom: 16 }} noHovering>
          <Row className="info-group-inline">
            <Col sm={12} md={8} lg={4}>
              <InfoItem label="商品货号" field={outboundProduct.product_no} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem label="中文品名" field={outboundProduct.name} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem label="订货总数" field={<QuantityInput packQty={outboundProduct.order_pack_qty} pcsQty={outboundProduct.order_qty} />} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem label="已分配总数"
                field={<QuantityInput packQty={outboundProduct.alloc_pack_qty} pcsQty={outboundProduct.alloc_qty} expectQty={outboundProduct.order_qty} />}
              />
            </Col>
            {outboundHead.bonded && <Col sm={12} md={8} lg={2}>
              <InfoItem label="监管方式" field={outboundHead.bonded_outtype} />
            </Col>}
          </Row>
        </Card>
        <Card title={inventoryQueryForm} bodyStyle={{ padding: 0 }} style={{ marginBottom: 16 }} noHovering>
          <div className="table-panel table-fixed-layout">
            <Table size="middle" columns={filterColumns} dataSource={this.state.inventoryData} rowKey="trace_id"
              scroll={{ x: filterColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
              loading={this.props.inventoryDataLoading}
            />
          </div>
        </Card>
        <Card title="分配明细" bodyStyle={{ padding: 0 }} noHovering>
          <div className="table-panel table-fixed-layout">
            <Table size="middle" columns={this.allocatedColumns} dataSource={this.state.allocatedData} rowKey="trace_id"
              scroll={{ x: this.allocatedColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
              loading={this.props.allocatedDataLoading}
            />
          </div>
        </Card>
      </Modal>
    );
  }
}
