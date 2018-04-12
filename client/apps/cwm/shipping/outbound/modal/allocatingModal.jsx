import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, DatePicker, Table, Form, Modal, Input, Tag, Row, Col, Button, Select, message, Checkbox, Popover } from 'antd';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import LocationSelect from 'client/apps/cwm/common/locationSelect';
import { closeAllocatingModal, loadProductInboundDetail, loadAllocatedDetails, manualAlloc } from 'common/reducers/cwmOutbound';
import { CWM_SO_BONDED_REGTYPES } from 'common/constants';
import QuantityInput from '../../../common/quantityInput';
import UnfreezePopover from '../../../common/popover/unfreezePopover';
import AllocatedPopover from '../../../common/popover/allocatedPopover';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ALLOC_RULE_OPTIONS = {
  serial_no: '序列号',
  virtual_whse: '库别',
  external_lot_no: '批次号',
  po_no: '采购订单号',
  supplier: '供货商',
  attrib_1_string: '扩展属性1',
  attrib_2_string: '扩展属性2',
  attrib_3_string: '扩展属性3',
  attrib_4_string: '扩展属性4',
};

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.allocatingModal.visible,
    submitting: state.cwmOutbound.submitting,
    outboundNo: state.cwmOutbound.allocatingModal.outboundNo,
    outboundProduct: state.cwmOutbound.allocatingModal.outboundProduct,
    inventoryData: state.cwmOutbound.inventoryData,
    allocatedData: state.cwmOutbound.allocatedData,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    loginName: state.account.username,
    outboundHead: state.cwmOutbound.outboundFormHead,
    inventoryDataLoading: state.cwmOutbound.inventoryDataLoading,
    allocatedDataLoading: state.cwmOutbound.allocatedDataLoading,
    outboundProducts: state.cwmOutbound.outboundProducts,
  }),
  {
    closeAllocatingModal,
    loadProductInboundDetail,
    loadAllocatedDetails,
    manualAlloc,
  }
)
export default class AllocatingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired,
    inventoryDataLoading: PropTypes.bool.isRequired,
    allocatedDataLoading: PropTypes.bool.isRequired,
  }
  state = {
    originData: [],
    inventoryData: [],
    allocatedData: [],
    outboundProduct: {},
    searchContent: '',
    filterInventoryColumns: [],
    filterAllocatedColumns: [],
    filters: {
      location: '', startTime: '', endTime: '', searchType: 'external_lot_no',
    },
  }
  componentDidMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: (window.innerHeight - 460) / 2,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.loadProductInboundDetail(
        nextProps.outboundProduct.product_no, nextProps.defaultWhse.code,
        nextProps.outboundHead.owner_partner_id
      );
      this.props.loadAllocatedDetails(
        nextProps.outboundProduct.outbound_no,
        nextProps.outboundProduct.seq_no
      );
      this.setState({
        outboundProduct: nextProps.outboundProduct,
      });
      const phIdx = this.inventoryColumns.findIndex(invc => invc.dataIndex === 'ALLOC_PLACEHOLDER');
      const allocOptions = nextProps.outboundHead.alloc_rules.map(arp => ({
        ...this.inventoryColumns[phIdx],
        title: ALLOC_RULE_OPTIONS[arp.key],
        dataIndex: arp.key,
      }));
      let filterInventoryColumns = [...this.inventoryColumns];
      filterInventoryColumns.splice(phIdx, 1, ...allocOptions);
      let filterAllocatedColumns = this.allocatedColumns;
      if (nextProps.outboundHead.bonded === 0) {
        filterInventoryColumns = filterInventoryColumns.filter(col =>
          !this.bondedColumns[col.dataIndex]);
        filterAllocatedColumns = filterAllocatedColumns.filter(col =>
          !this.bondedColumns[col.dataIndex]);
      }
      this.setState({ filterInventoryColumns, filterAllocatedColumns });
    }
    if (nextProps.inventoryData !== this.props.inventoryData) {
      this.setState({
        inventoryData: nextProps.inventoryData.map(data => ({ ...data })),
        originData: nextProps.inventoryData.map(data => ({ ...data })),
      });
    }
    if (nextProps.allocatedData !== this.props.allocatedData) {
      this.setState({
        allocatedData: nextProps.allocatedData.map(ad => ({
          ...ad,
          allocated_qty: ad.alloc_qty,
          allocated_pack_qty: ad.sku_pack_qty ? ad.alloc_qty / ad.sku_pack_qty : ad.alloc_qty,
          alloced: true,
        })),
      });
    }
  }
  bondedColumns ={
    bonded: true, portion: true, ftz_ent_filed_id: true, ftz_ent_no: true, in_cus_decl_no: true,
  }
  handleReLoad = (traceId, qty) => {
    const inventoryData = [...this.state.inventoryData];
    inventoryData.find(data => data.trace_id === traceId).frozen_qty -= qty;
    inventoryData.find(data => data.trace_id === traceId).avail_qty += qty;
    this.setState({
      inventoryData,
    });
  }
  msg = formatMsg(this.props.intl)
  inventoryColumns = [{
    title: '加入',
    width: 60,
    fixed: 'left',
    render: (o, record) => {
      let disabled = !this.props.editable; // 不可编辑时disable
      let reason = '';
      if (!disabled) {
        const { outboundHead } = this.props;
        const priority = parseFloat(record.priority);
        if (!record.inbound_timestamp) {
          disabled = true;
          reason = '入库日期为空';
        } else if (outboundHead.bonded === 0) {
          disabled = record.bonded;
          reason = disabled ? '保税库存' : '';
        } else if (outboundHead.bonded === 1 && outboundHead.bonded_outtype === 'normal') {
          disabled = !record.ftz_ent_filed_id; // 没有明细ID时disable
          reason = disabled ? '海关入库明细ID为空' : '';
        } else if (outboundHead.bonded === 1 && outboundHead.bonded_outtype === 'portion') {
          disabled = !(record.ftz_ent_filed_id && record.portion); // 有明细ID 且 是分拨库存时不disable
          reason = disabled ? '货物不可分拨' : '';
        } else if (Number.isNaN(priority) || priority === 0) {
          disabled = true;
          reason = '库位封存';
        } else if (!record.avail_qty || record.avail_qty === 0) { // 可用库存为空或等于0时disable
          disabled = true;
          reason = '库存数量不足';
        } else {
          const { outboundProduct } = this.state;
          for (let i = 0; i < outboundHead.alloc_rules.length; i++) {
            const ar = outboundHead.alloc_rules[i];
            if (ar.eigen && record[ar.key] !== ar.eigen) {
              disabled = true;
              reason = `${ALLOC_RULE_OPTIONS[ar.key]}值不等于${ar.eigen}`;
              break;
            } else if (outboundProduct[ar.key] && outboundProduct[ar.key] !== record[ar.key]) {
              disabled = true;
              reason = `${ALLOC_RULE_OPTIONS[ar.key]}值不等于${outboundProduct[ar.key]}`;
              break;
            }
          }
        }
      }
      if (reason) {
        return (<Popover placement="right" title="原因" content={reason}>
          <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddAllocate(record.trace_id)} disabled />
        </Popover>);
      }
      return <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddAllocate(record.trace_id)} disabled={disabled} />;
    },
  }, {
    title: '现分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" onChange={e => this.handleAllocChange(e.target.value, record.trace_id)} packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: o => o && <Button size="small">{o}</Button>,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: o => o && <Tag>{o}</Tag>,
  }, {
    title: '入库日期',
    dataIndex: 'inbound_timestamp',
    width: 100,
    render: inboundts => inboundts && moment(inboundts).format('YYYY.MM.DD'),
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 200,
  }, {
    title: '库存数量',
    dataIndex: 'stock_qty',
    width: 125,
    className: 'cell-align-right text-emphasis',
  }, {
    title: '可用数量',
    dataIndex: 'avail_qty',
    width: 125,
    align: 'right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      }
      return <span className="text-success">{text}</span>;
    },
  }, {
    title: '分配数量',
    dataIndex: 'alloc_qty',
    width: 125,
    align: 'right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      }
      return <AllocatedPopover traceId={record.trace_id} text={text} />;
    },
  }, {
    title: '冻结数量',
    dataIndex: 'frozen_qty',
    width: 125,
    align: 'right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      }
      return <UnfreezePopover reload={this.handleReLoad} traceId={record.trace_id} text={text} />;
    },
  }, {
    title: '',
    dataIndex: 'ALLOC_PLACEHOLDER',
    width: 100,
    render: o => <TrimSpan text={o} maxLen={15} />,
  }, {
    title: '入库客户单号',
    dataIndex: 'cust_order_no',
    width: 100,
    render: o => <TrimSpan text={o} maxLen={15} />,
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 80,
    align: 'center',
    render: bonded => (bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>),
  }, {
    title: '分拨货物',
    dataIndex: 'portion',
    width: 80,
    align: 'center',
    render: portion => (portion ? <Tag color="green">可分拨</Tag> : '否'),
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_filed_id',
    width: 120,
    render: o => (o ? <span className="text-info">{o}</span> : <span className="text-error">无备案信息</span>),
  }, {
    title: '进区凭单号',
    dataIndex: 'ftz_ent_no',
    width: 180,
  }, {
    title: '报关单号',
    dataIndex: 'in_cus_decl_no',
    width: 180,
  }]

  allocatedColumns = [{
    title: '移出',
    width: 60,
    fixed: 'left',
    render: (o, record) => (record.alloced ? null :
    <Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDeleteAllocated(record.trace_id)} disabled={!this.props.editable} />),
  }, {
    title: '已分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: o => o && <Button size="small">{o}</Button>,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: o => o && <Tag>{o}</Tag>,
  }, {
    title: '库别',
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
    width: 125,
    render: o => <TrimSpan text={o} maxLen={15} />,
  }, {
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 125,
    render: o => <TrimSpan text={o} maxLen={15} />,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={15} />,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    width: 120,
  }, {
    title: '入库日期',
    dataIndex: 'inbound_timestamp',
    width: 100,
    render: inboundts => inboundts && moment(inboundts).format('YYYY.MM.DD'),
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 200,
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 80,
    render: bonded => (bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>),
  }, {
    title: '分拨货物',
    dataIndex: 'portion',
    width: 80,
    align: 'center',
    render: portion => (portion ? <Tag color="green">可分拨</Tag> : '否'),
  }, {
    title: '进区凭单号',
    dataIndex: 'ftz_ent_no',
    width: 180,
  }, {
    title: '报关单号',
    dataIndex: 'in_cus_decl_no',
    width: 180,
  }, {
    dataIndex: 'spacer',
    width: 100,
  }]
  handleAllocChange = (value, traceId) => {
    const allocValue = parseFloat(value);
    if (!Number.isNaN(allocValue)) {
      if (allocValue > this.state.inventoryData.find(data =>
        data.trace_id === traceId).avail_pack_qty) {
        message.info('分配数量不能大于可用数量');
      } else {
        const inventoryData = [...this.state.inventoryData];
        const changedOne = inventoryData.find(data => data.trace_id === traceId);
        changedOne.allocated_pack_qty = allocValue;
        changedOne.allocated_qty = allocValue * changedOne.sku_pack_qty;
        this.setState({
          inventoryData,
        });
      }
    }
  }
  handleAddAllocate = (traceId) => {
    const inventoryData = [...this.state.inventoryData];
    const allocatedData = [...this.state.allocatedData];
    const originData = [...this.state.originData];
    const outboundProduct = { ...this.state.outboundProduct };
    const allocatedOne = { ...inventoryData.find(data => data.trace_id === traceId) };
    const index = inventoryData.findIndex(data => data.trace_id === traceId);
    const allocatedAmount = allocatedData.reduce((pre, cur) => (pre + cur.allocated_qty), 0);
    const currAlloc = allocatedOne.allocated_qty ? allocatedOne.allocated_qty
      : allocatedOne.avail_qty;
    if (allocatedAmount + currAlloc > this.props.outboundProduct.order_qty) {
      message.info('分配数量不能大于订单总数');
      return;
    }
    inventoryData[index].alloc_qty += currAlloc;
    inventoryData[index].avail_qty -= currAlloc;
    inventoryData[index].allocated_pack_qty = null;
    inventoryData[index].allocated_qty = null;
    if (inventoryData[index].avail_qty === 0) {
      inventoryData.splice(index, 1);
    }
    const idx = allocatedData.findIndex(item => item.trace_id === traceId);
    if (idx >= 0) {
      allocatedData[idx].allocated_qty += currAlloc;
      allocatedData[idx].allocated_pack_qty += currAlloc / allocatedOne.sku_pack_qty;
      // allocatedData[idx].avail_qty = allocatedOne.allocated_qty;
    } else {
      allocatedData.push({
        ...allocatedOne,
        // alloc_qty: 0,
        allocated_qty: currAlloc,
        allocated_pack_qty: currAlloc / allocatedOne.sku_pack_qty,
      });
    }
    outboundProduct.alloc_qty += currAlloc;
    outboundProduct.alloc_pack_qty = outboundProduct.alloc_qty / allocatedOne.sku_pack_qty;
    const originIndex = originData.findIndex(data => data.trace_id === traceId);
    originData[originIndex].alloc_qty += currAlloc;
    originData[originIndex].avail_qty -= currAlloc;
    if (originData[originIndex].avail_qty === 0) {
      originData.splice(originIndex, 1);
    }
    this.setState({
      inventoryData,
      allocatedData,
      outboundProduct,
      originData,
    });
  }
  handleDeleteAllocated = (traceId) => {
    const { filters } = this.state;
    const inventoryData = [...this.state.inventoryData];
    const allocatedData = [...this.state.allocatedData];
    const originData = [...this.state.originData];
    const outboundProduct = { ...this.state.outboundProduct };
    const deleteOne = allocatedData.find(data => data.trace_id === traceId);
    const index = allocatedData.findIndex(data => data.trace_id === traceId);
    allocatedData.splice(index, 1);
    outboundProduct.alloc_qty -= deleteOne.allocated_qty;
    outboundProduct.alloc_pack_qty = outboundProduct.alloc_qty / deleteOne.sku_pack_qty;
    const originIndex = originData.findIndex(data => data.trace_id === traceId);
    const idx = inventoryData.findIndex(item => item.trace_id === traceId);
    if (idx >= 0) {
      inventoryData[idx].alloc_qty -= deleteOne.allocated_qty;
      inventoryData[idx].avail_qty += deleteOne.allocated_qty;
    } else if (idx === -1 && originIndex === -1) {
      deleteOne.avail_qty = deleteOne.allocated_qty;
      deleteOne.alloc_qty = 0;
      deleteOne.allocated_qty = null;
      deleteOne.allocated_pack_qty = null;
      if (filters.searchContent) {
        const reg = new RegExp(filters.searchContent);
        if (reg.test(deleteOne[filters.searchType])) {
          inventoryData.push(deleteOne);
        }
      }
      if (filters.location && deleteOne.location === filters.location) {
        inventoryData.push(deleteOne);
      }
      if (filters.virtualWhse) {
        const reg = new RegExp(filters.virtualWhse);
        if (reg.test(deleteOne.virtual_whse)) {
          inventoryData.push(deleteOne);
        }
      }
      if (filters.endTime) {
        if (deleteOne.inbound_timestamp >= new Date(`${filters.startTime} 00:00:00`).getTime() && new Date(`${filters.endTime} 00:00:00`).getTime() > deleteOne.inbound_timestamp) {
          inventoryData.push(deleteOne);
        }
      }
      originData.push(deleteOne);
    } else {
      originData[originIndex].alloc_qty -= deleteOne.allocated_qty;
      originData[originIndex].avail_qty += deleteOne.allocated_qty;
    }
    this.setState({
      inventoryData,
      allocatedData,
      outboundProduct,
      originData,
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
      const allocs = this.state.allocatedData.filter(ad => !ad.alloced);
      if (allocs.length > 0) {
        this.props.manualAlloc(
          this.props.outboundNo, this.state.outboundProduct.seq_no,
          allocs.map(ad => ({
            trace_id: ad.trace_id,
            allocated_qty: ad.allocated_qty,
            allocated_pack_qty: ad.allocated_pack_qty,
          })), this.props.loginId, this.props.loginName
        ).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            message.info('保存成功');
            const { outboundProduct, defaultWhse, outboundHead } = this.props;
            this.props.loadProductInboundDetail(
              outboundProduct.product_no,
              defaultWhse.code, outboundHead.owner_partner_id
            );
            this.props.loadAllocatedDetails(
              outboundProduct.outbound_no,
              outboundProduct.seq_no
            );
          }
        });
      } else {
        this.handleCancel();
      }
    }
  }
  handleSelectChangeType = (value) => {
    let muteInvColumns = {};
    if (value) {
      muteInvColumns = {
        external_lot_no: false,
        serial_no: false,
        po_no: false,
        cust_order_no: false,
        asn_no: false,
        ftz_ent_no: false,
        in_cus_decl_no: false,
      };
      muteInvColumns[value] = true;
    }
    const filters = { ...this.props.filters, searchType: value || 'external_lot_no' };
    const { bonded } = this.props.outboundHead;
    const phIdx = this.inventoryColumns.findIndex(invc => invc.dataIndex === 'ALLOC_PLACEHOLDER');
    const allocOptions = this.props.outboundHead.alloc_rules.map(arp => ({
      ...this.inventoryColumns[phIdx],
      title: ALLOC_RULE_OPTIONS[arp.key],
      dataIndex: arp.key,
    }));
    let filterInventoryColumns = [...this.inventoryColumns];
    filterInventoryColumns.splice(phIdx, 1, ...allocOptions);
    filterInventoryColumns = filterInventoryColumns.filter((col) => {
      let filter = true;
      if (bonded === 0) {
        filter = filter && !this.bondedColumns[col.dataIndex];
      }
      return filter && (muteInvColumns[col.dataIndex] !== false);
    });
    this.setState({
      filterInventoryColumns,
      filters,
    });
  }
  handleSearchContentChange = (ev) => {
    this.setState({
      searchContent: ev.target.value || '',
    });
  }
  handleSearchDetails = (type, value, dataString) => {
    let inventoryData = this.state.originData.map(data => ({ ...data }));
    let filters = {};
    if (type !== 'time') {
      filters = { ...this.state.filters, [type]: value };
    } else {
      filters = { ...this.state.filters, startTime: dataString[0], endTime: dataString[1] };
    }
    if (filters.searchContent) {
      if (['external_lot_no', 'serial_no', 'asn_no', 'po_no', 'cust_order_no', 'ftz_ent_no', 'in_cus_decl_no'].indexOf(filters.searchType) > 0) {
        const reg = new RegExp(filters.searchContent);
        inventoryData = inventoryData.filter(data => reg.test(data[filters.searchType]));
      }
    }
    if (filters.location) {
      inventoryData = inventoryData.filter(data => data.location === filters.location);
    }
    if (filters.virtualWhse) {
      const reg = new RegExp(filters.virtualWhse);
      inventoryData = inventoryData.filter(data => reg.test(data.virtual_whse));
    }
    if (filters.startTime && filters.endTime) {
      const startTs = new Date(dataString[0]).setHours(0, 0, 0, 0);
      const endDate = new Date(dataString[1]);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);
      inventoryData = inventoryData.filter(data => data.inbound_timestamp >= startTs &&
        data.inbound_timestamp < endDate.getTime());
    }
    this.setState({
      inventoryData,
      filters,
    });
  }
  handleSeqNoChange = (value) => {
    const {
      outboundProduct, defaultWhse, outboundHead, outboundProducts,
    } = this.props;
    const newOutboundProduct = outboundProducts.find(pro => pro.seq_no === value);
    this.props.loadProductInboundDetail(
      newOutboundProduct.product_no,
      defaultWhse.code, outboundHead.owner_partner_id
    );
    this.props.loadAllocatedDetails(outboundProduct.outbound_no, value);
    this.setState({
      outboundProduct: newOutboundProduct,
    });
  }
  render() {
    const {
      outboundHead, editable, outboundProducts, submitting, visible,
    } = this.props;
    if (!visible) {
      return null;
    }
    const {
      outboundProduct, filterInventoryColumns, filterAllocatedColumns, filters,
    } = this.state;
    const searchOptions = (
      <Select
        value={filters.searchType}
        allowClear
        style={{ width: 120 }}
        onSelect={this.handleSelectChangeType}
        onChange={this.handleSelectChangeType}
      >
        <Option value="external_lot_no">批次号</Option>
        <Option value="serial_no">序列号</Option>
        <Option value="po_no">采购订单号</Option>
        <Option value="asn_no">ASN编号</Option>
        <Option value="cust_order_no">入库客户单号</Option>
        <Option value="ftz_ent_no">进区凭单号</Option>
        <Option value="in_cus_decl_no">报关单号</Option>
      </Select>
    );
    const inventoryQueryForm = (
      <Form layout="inline">
        <FormItem>
          <Input.Search
            addonBefore={searchOptions}
            onChange={this.handleSearchContentChange}
            placeholder="查询条件"
            value={this.state.searchContent}
            style={{ width: 380 }}
            onSearch={() => this.handleSearchDetails('searchContent', this.state.searchContent)}
          />
        </FormItem>
        <FormItem label="库位">
          <LocationSelect showSearch onChange={value => this.handleSearchDetails('location', value)} value={filters.location} style={{ width: 160 }} />
        </FormItem>
        <FormItem label="库别">
          <Input.Search onSearch={value => this.handleSearchDetails('virtualWhse', value)} />
        </FormItem>
        <FormItem label="入库日期">
          <RangePicker onChange={(data, dataString) => this.handleSearchDetails('time', data, dataString)} />
        </FormItem>
        { outboundHead.bonded === 1 &&
          <FormItem label="已备案">
            <Checkbox defaultChecked disabled />
          </FormItem>
        }
        { outboundHead.bonded_outtype === CWM_SO_BONDED_REGTYPES[1].value &&
          <FormItem label="可分拨">
            <Checkbox defaultChecked disabled />
          </FormItem>
        }
      </Form>);

    const title = (<div>
      <span>{outboundHead.so_no} 第{outboundProduct.seq_no}行 出库分配{editable ? '' : '查看'}</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>{editable ? '取消' : '关闭'}</Button>
        {editable && <Button type="primary" onClick={this.handleManualAllocSave} loading={submitting}>保存</Button>}
      </div>
    </div>);
    return (
      <Modal
        maskClosable={false}
        title={title}
        width="100%"
        wrapClassName="fullscreen-modal"
        closable={false}
        visible={visible}
        footer={null}
      >
        <Card bodyStyle={{ paddingBottom: 16 }} >
          <Row className="info-group-inline">
            <Col sm={12} md={8} lg={4}>
              商品货号：
              <Select
                style={{ width: 200 }}
                value={outboundProduct.product_no}
                onChange={this.handleSeqNoChange}
              >
                {outboundProducts.map(pro => (<Option value={pro.seq_no} key={pro.seq_no}>
                  {pro.product_no}</Option>))}
              </Select>
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem label="中文品名" field={outboundProduct.name} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem label="订货总数" field={<QuantityInput packQty={outboundProduct.order_pack_qty} pcsQty={outboundProduct.order_qty} />} />
            </Col>
            <Col sm={12} md={8} lg={6}>
              <InfoItem
                label="已分配总数"
                field={<QuantityInput
                  packQty={outboundProduct.alloc_pack_qty}
                  pcsQty={outboundProduct.alloc_qty}
                  expectQty={outboundProduct.order_qty}
                />}
              />
            </Col>
            {outboundHead.alloc_rules.map((ar) => {
              if (!ar.eigen && outboundProduct[ar.key]) {
                return (
                  <Col sm={12} md={8} lg={6} key={ar.key}>
                    <InfoItem label={ALLOC_RULE_OPTIONS[ar.key]} field={outboundProduct[ar.key]} />
                  </Col>);
              }
              return null;
            })}
            {outboundHead.bonded === 1 && <Col sm={12} md={8} lg={2}>
              <InfoItem label="监管方式" field={CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === outboundHead.bonded_outtype)[0].ftztext} />
            </Col>}
          </Row>
        </Card>
        <Card title="库存记录" extra={inventoryQueryForm} bodyStyle={{ padding: 0 }} >
          <div className="table-panel table-fixed-layout">
            <Table
              size="middle"
              columns={filterInventoryColumns}
              dataSource={this.state.inventoryData}
              scroll={{
 x: filterInventoryColumns.reduce((acc, cur) =>
                acc + (cur.width ? cur.width : 240), 0),
y: this.state.scrollY,
}}
              loading={this.props.inventoryDataLoading}
              rowKey="trace_id"
            />
          </div>
        </Card>
        <Card title="分配明细" bodyStyle={{ padding: 0 }} >
          <div className="table-panel table-fixed-layout">
            <Table
              size="middle"
              columns={filterAllocatedColumns}
              dataSource={this.state.allocatedData}
              scroll={{
 x: filterAllocatedColumns.reduce((acc, cur) =>
                acc + (cur.width ? cur.width : 240), 0),
y: this.state.scrollY,
}}
              loading={this.props.allocatedDataLoading}
              rowKey="id"
            />
          </div>
        </Card>
      </Modal>
    );
  }
}
