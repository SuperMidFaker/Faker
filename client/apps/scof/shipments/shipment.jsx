import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Row, Col, Card, Input, Select, Steps, Tag, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODSTYPES, WRAP_TYPE, EXPEDITED_TYPES, SCOF_ORDER_TRANSFER, TRANS_MODES, SAAS_PARAM_TYPE } from 'common/constants';
import { setClientForm } from 'common/reducers/sofOrders';
import { loadPartnerFlowList, loadFlowGraph, loadCwmBizParams } from 'common/reducers/scofFlow';
import { loadOperators } from 'common/reducers/sofCustomers';
import { loadParams } from 'common/reducers/saasParams';
import FormPane from 'client/components/FormPane';
import UserAvatar from 'client/components/UserAvatar';
import CMSDelegateForm from './forms/cmsDelegateForm';
import TMSConsignForm from './forms/tmsConsignForm';
import CwmReceivingForm from './forms/cwmReceivingForm';
import CwmShippingForm from './forms/cwmShippingForm';
import ContainerPane from './tabpane/containerPane';
import InvoicePane from './tabpane/invoicePane';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const InputGroup = Input.Group;
const { Step } = Steps;

const SeletableKeyNameMap = {};
GOODSTYPES.forEach((gt) => { SeletableKeyNameMap[`goods-${gt.value}`] = gt.text; });
WRAP_TYPE.forEach((wt) => { SeletableKeyNameMap[`wrap-${wt.value}`] = wt.text; });
SCOF_ORDER_TRANSFER.forEach((ot) => { SeletableKeyNameMap[`transfer-${ot.value}`] = ot.text; });
TRANS_MODES.forEach((ot) => { SeletableKeyNameMap[`transmode-${ot.value}`] = ot.text; });

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.sofOrders.formData,
    formRequires: state.sofOrders.formRequires,
    flows: state.scofFlow.partnerFlows,
    graphLoading: state.scofFlow.graphLoading,
    serviceTeam: state.sofCustomers.operators,
    orderTypes: state.sofOrderPref.requireOrderTypes,
    partners: state.partner.partners,
    countries: state.saasParams.countries,
  }),
  {
    setClientForm,
    loadPartnerFlowList,
    loadFlowGraph,
    loadOperators,
    loadCwmBizParams,
    loadParams,
  }
)
export default class OrderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formData: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
    formRequires: PropTypes.shape({
      clients: PropTypes.arrayOf(PropTypes.shape({ partner_id: PropTypes.number })),
    }).isRequired,
    setClientForm: PropTypes.func.isRequired,
    graphLoading: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    this.handleOrderParamsLoad(this.props.formData);
    this.props.loadParams([SAAS_PARAM_TYPE.COUNTRY]);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.customer_partner_id !== this.props.formData.customer_partner_id) {
      this.handleOrderParamsLoad(nextProps.formData);
    }
  }
  handleOrderParamsLoad = (formData) => {
    if (formData.customer_partner_id) {
      this.props.loadPartnerFlowList({
        partnerId: formData.customer_partner_id,
      });
      this.props.loadCwmBizParams(formData.customer_partner_id);
      this.props.loadOperators(formData.customer_partner_id, this.props.tenantId);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleClientChange = (value) => {
    const selPartnerId = Number(value);
    const client = this.props.partners.find(cl => cl.id === selPartnerId) || {
      name: '',
      partner_tenant_id: null,
      id: null,
      partner_code: null,
    };
    this.props.setClientForm(-1, {
      flow_id: null,
      customer_name: client.name,
      customer_tenant_id: client.partner_tenant_id,
      customer_partner_id: client.id,
      customer_partner_code: client.partner_code,
      subOrders: [],
    });
  }
  handleProviderChange = (value) => {
    const selPartnerId = Number(value);
    const client = this.props.partners.find(cl => cl.id === selPartnerId) || {
      name: '',
      partner_tenant_id: null,
      id: null,
    };
    this.props.setClientForm(-1, {
      provider_name: client.name,
      provider_tenant_id: client.partner_tenant_id,
      provider_partner_id: client.id,
    });
  }
  handleFlowChange = (value) => {
    const flow = this.props.flows.filter(flw => flw.id === value)[0];
    this.props.loadFlowGraph(value, flow.main_flow_id).then((result) => {
      if (!result.error) {
        const subOrders = [];
        let { nodes } = result.data;
        if (flow.main_flow_id) {
          nodes = nodes.filter(nd => nd.provider_tenant_id === this.props.tenantId);
        }
        const { edges } = result.data;
        const nodeEndMap = {};
        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i];
          const targetNode = nodes.filter(node => node.id === edge.target)[0];
          if (targetNode) {
            if (nodeEndMap[edge.source]) {
              nodeEndMap[edge.source].push(targetNode);
            } else {
              nodeEndMap[edge.source] = [targetNode];
            }
          }
        }
        const levelNodes = [nodes.filter(node => node.in_degree === 0)];
        let nlevel = 0;
        const visitedMap = {};
        while (levelNodes.length > 0 && Object.keys(visitedMap).length < nodes.length) {
          const visitNodes = [];
          levelNodes[nlevel].forEach((node) => {
            visitNodes.push(node);
            visitedMap[node.id] = true;
          });
          nlevel += 1;
          levelNodes.push([]);
          while (visitNodes.length) {
            const vn = visitNodes.shift();
            const vnEnds = nodeEndMap[vn.id];
            if (Array.isArray(vnEnds)) {
              for (let j = 0; j < vnEnds.length; j++) {
                const vne = vnEnds[j];
                if (!visitedMap[vne.id]) {
                  levelNodes[nlevel].push(vne);
                  visitedMap[vne.id] = true;
                }
              }
            }
          }
        }
        levelNodes.forEach((lnodes, level) => {
          lnodes.sort((na, nb) => (na.id < nb.id ? -1 : 1));
          lnodes.forEach((node) => {
            const nodeAttr = {
              node_uuid: node.id,
              kind: node.kind,
              name: node.name,
              in_degree: node.in_degree,
              out_degree: node.out_degree,
              multi_bizobj: node.multi_bizobj,
              demander_tenant_id: node.demander_tenant_id,
              demander_partner_id: node.demander_partner_id,
              provider_tenant_id: node.provider_tenant_id,
              person_id: node.person_id,
              person: node.person,
            };
            if (node.kind === 'tms') {
              subOrders.push({
                node: {
                  ...nodeAttr,
                  level,
                  consigner_id: null,
                  consignee_id: null,
                  pack_count: null,
                  gross_wt: null,
                  trs_mode_id: null,
                  trs_mode_code: null,
                  trs_mode: '',
                  remark: '',
                  package: '',
                },
              });
            } else if (node.kind === 'import' || node.kind === 'export') {
              subOrders.push({
                node: {
                  ...nodeAttr,
                  level,
                  pack_count: null,
                  gross_wt: null,
                  remark: '',
                  package: '',
                },
                files: [],
              });
            } else if (node.kind === 'cwmrec' || node.kind === 'cwmship') {
              subOrders.push({
                node: {
                  ...nodeAttr,
                  level,
                },
              });
            } else if (node.kind === 'terminal') {
              subOrders.push({
                node: {
                  node_uuid: node.id,
                  kind: node.kind,
                  in_degree: node.in_degree,
                  out_degree: node.out_degree,
                  level,
                },
              });
            }
          });
        });
        this.props.setClientForm(-1, { flow_id: value, subOrders });
      }
    });
  }
  handleChange = (key, value) => {
    this.props.setClientForm(-1, { [key]: value });
  }
  handleKvChange = (key, value, prefix) => {
    this.props.setClientForm(-1, { [key]: value, [`${key}_name`]: SeletableKeyNameMap[`${prefix}-${value}`] });
  }
  handleOrderTypeChange = (value) => {
    const orderType = this.props.orderTypes.filter(ort => ort.id === Number(value))[0];
    if (orderType) {
      this.props.setClientForm(-1, {
        cust_shipmt_order_type: Number(value),
        cust_shipmt_transfer: orderType.transfer,
      });
    }
  }
  renderSteps = (subOrders, shipment) => {
    const { operation } = this.props;
    const steps = [];
    // steps.push(<Step key={1} status="process"
    // description={<StepNodeForm formData={formData.subOrders[0]} index={0}
    // operation={operation} />} />);
    for (let i = 0; i < subOrders.length; i++) {
      const order = subOrders[i];
      const { node } = order;
      if (node.kind === 'import' || node.kind === 'export') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<CMSDelegateForm formData={order} shipment={shipment} index={i} operation={operation} />} />);
      } else if (node.kind === 'tms') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<TMSConsignForm formData={order} shipment={shipment} index={i} operation={operation} />} />);
      } else if (node.kind === 'cwmrec') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<CwmReceivingForm formData={order} index={i} operation={operation} />} />);
      } else if (node.kind === 'cwmship') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<CwmShippingForm formData={order} index={i} operation={operation} />} />);
      }
    }
    return steps;
  }
  renderPartnerSelect = (selItemProps) => {
    const { partners } = this.props;
    return (
      <Select
        showSearch
        allowClear
        optionFilterProp="children"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
        style={{ width: '100%' }}
        {...selItemProps}
      >
        {partners.map(data => (
          <Option key={String(data.id)} value={String(data.id)}>{
            data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
    );
  }
  render() {
    const {
      formRequires, formData, flows, serviceTeam, orderTypes, tenantId,
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      colon: false,
    };
    const orderShipment = {
      cust_shipmt_trans_mode: formData.cust_shipmt_trans_mode,
      cust_shipmt_mawb: formData.cust_shipmt_mawb,
      cust_shipmt_hawb: formData.cust_shipmt_hawb,
      cust_shipmt_bill_lading: formData.cust_shipmt_bill_lading,
      cust_shipmt_bill_lading_no: formData.cust_shipmt_bill_lading_no,
      cust_shipmt_vessel: formData.cust_shipmt_vessel,
      cust_shipmt_voy: formData.cust_shipmt_voy,
      cust_shipmt_pieces: formData.cust_shipmt_pieces,
      cust_shipmt_weight: formData.cust_shipmt_weight,
      cust_shipmt_volume: formData.cust_shipmt_volume,
      cust_shipmt_expedited: formData.cust_shipmt_expedited,
      cust_shipmt_goods_type: formData.cust_shipmt_goods_type,
      cust_shipmt_wrap_type: formData.cust_shipmt_wrap_type,
    };
    const current = formData.subOrders.length || 0;
    /*
    const cargoTransferHint = (
      <ul>
        根据货物是否有实际国际运输区分
        <li>货物进口: 有实际进境运输</li>
        <li>货物出口: 有实际出境运输</li>
        <li>国内流转: 无实际进出境运输</li>
      </ul>
    );
    */
    // const shipmentDisabled = !formData.cust_shipmt_transfer
    // || formData.cust_shipmt_transfer === 'DOM';
    // const shipmentActiveKey = shipmentDisabled ? [] : ['shipment'];
    let ext1Label = { label: '扩展字段1' };
    let ext2Label = { label: '扩展字段2' };
    let ext3Label = { label: '扩展字段3' };
    let ext4Label = { label: '扩展字段4' };
    if (formData.cust_shipmt_order_type) {
      const orderType = orderTypes.filter(ort =>
        ort.id === Number(formData.cust_shipmt_order_type))[0];
      const ext1 = orderType.ext1_params ? JSON.parse(orderType.ext1_params) : {};
      if (ext1.enabled) {
        ext1Label = {
          label: ext1.title || ext1Label.label,
          required: ext1.required,
        };
      } else {
        ext1Label = null;
      }
      const ext2 = orderType.ext2_params ? JSON.parse(orderType.ext2_params) : {};
      if (ext2.enabled) {
        ext2Label = {
          label: ext2.title || ext2Label.label,
          required: ext2.required,
        };
      } else {
        ext2Label = null;
      }
      const ext3 = orderType.ext3_params ? JSON.parse(orderType.ext3_params) : {};
      if (ext3.enabled) {
        ext3Label = {
          label: ext3.title || ext3Label.label,
          required: ext3.required,
        };
      } else {
        ext3Label = null;
      }
      const ext4 = orderType.ext4_params ? JSON.parse(orderType.ext4_params) : {};
      if (ext4.enabled) {
        ext4Label = {
          label: ext4.title || ext4Label.label,
          required: ext4.required,
        };
      } else {
        ext4Label = null;
      }
    }
    let labelCountry = this.msg('originCountry');
    let labelIEPort = this.msg('importPort');
    if (formData.cust_shipmt_transfer === 'EXP') {
      labelCountry = this.msg('destCountry');
      labelIEPort = this.msg('exportPort');
    }
    const customerName = [formData.customer_partner_code, formData.customer_name].filter(fd => fd).join('|');
    let customerFormItem = <Input value={customerName} disabled />;
    let provderFormItem = <Input value={formData.provider_name} disabled />;
    if (!formData.shipmt_order_no) {
      if (formData.provider_tenant_id === tenantId) {
        customerFormItem = this.renderPartnerSelect({
          placeholder: '请选择货主',
          onChange: this.handleClientChange,
          value: String(formData.customer_partner_id || ''),
        });
      } else if (formData.customer_tenant_id === tenantId) {
        provderFormItem = this.renderPartnerSelect({
          placeholder: '请选择服务商',
          onChange: this.handleProviderChange,
          value: String(formData.provider_partner_id || ''),
        });
      }
    }
    return (
      <div>
        <Card bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="main">
            <TabPane tab="基本信息" key="main">
              <FormPane>
                <Card>
                  <Row>
                    <Col span={6}>
                      <FormItem label={this.msg('shipper')} {...formItemLayout} required>
                        {customerFormItem}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label={this.msg('serviceProvider')} {...formItemLayout}>
                        {provderFormItem}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="订单参考号" {...formItemLayout}>
                        <Input value={formData.cust_order_no} onChange={e => this.handleChange('cust_order_no', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label={this.msg('执行人员')} {...formItemLayout}>
                        <Select value={formData.exec_login_id} onChange={value => this.handleChange('exec_login_id', value)}>
                          {serviceTeam.map(st => <Option value={st.lid} key={st.lid}><UserAvatar size="small" loginId={st.lid} showName /></Option>)}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="加急状态" {...formItemLayout}>
                        <Select value={formData.cust_shipmt_expedited} onChange={value => this.handleChange('cust_shipmt_expedited', value)}>
                          <Option value={EXPEDITED_TYPES[0].value}>
                            <Tag>{EXPEDITED_TYPES[0].text}</Tag></Option>
                          <Option value={EXPEDITED_TYPES[1].value}>
                            <Tag color="#ffbf00">{EXPEDITED_TYPES[1].text}</Tag></Option>
                          <Option value={EXPEDITED_TYPES[2].value}>
                            <Tag color="#f04134">{EXPEDITED_TYPES[2].text}</Tag></Option>
                        </Select>
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem label="备注" {...formItemSpan2Layout}>
                        <Input value={formData.cust_remark} onChange={e => this.handleChange('cust_remark', e.target.value)} />
                      </FormItem>
                    </Col>

                  </Row>
                </Card>
                <Card
                  title={<span>货运类型
                    {orderTypes.length === 0 ?
                      <Select
                        value={formData.cust_shipmt_transfer}
                        onChange={value =>
                        this.handleKvChange('cust_shipmt_transfer', value, 'transfer')}
                        style={{ width: '30%', marginLeft: 32 }}
                      >
                        {SCOF_ORDER_TRANSFER.map(sot =>
                        (<Option value={sot.value} key={sot.value}>
                          {sot.text}</Option>))}
                      </Select> :
                      <Select
                        value={formData.cust_shipmt_order_type &&
                            String(formData.cust_shipmt_order_type)}
                        onChange={this.handleOrderTypeChange}
                        style={{ width: '30%', marginLeft: 32 }}
                      >
                        {orderTypes.map(ort =>
                        (<Option value={String(ort.id)} key={ort.id}>
                          {ort.name}</Option>))}
                      </Select>
                    }
                  </span>}
                  bodyStyle={{ padding: 0 }}
                >
                  <Collapse bordered={false} defaultActiveKey="shipment">
                    <Panel header="货运信息" key="shipment">
                      <Row>
                        <Col span={6}>
                          <FormItem label="货物类型" {...formItemLayout}>
                            <Select value={formData.cust_shipmt_goods_type} onChange={value => this.handleKvChange('cust_shipmt_goods_type', value, 'goods')}>
                              <Option value={GOODSTYPES[0].value}>
                                <Tag>GN</Tag>{GOODSTYPES[0].text}</Option>
                              <Option value={GOODSTYPES[1].value}>
                                <Tag color="#2db7f5">FR</Tag>{GOODSTYPES[1].text}</Option>
                              <Option value={GOODSTYPES[2].value}>
                                <Tag color="#f50">DG</Tag>{GOODSTYPES[2].text}</Option>
                            </Select>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="件数/包装" {...formItemLayout}>
                            <InputGroup compact>
                              <Input
                                type="number"
                                style={{ width: '50%' }}
                                value={formData.cust_shipmt_pieces}
                                onChange={(ev) => {
                              const pieces = parseFloat(ev.target.value);
                              if (!Number.isNaN(pieces)) {
                                this.handleChange('cust_shipmt_pieces', ev.target.value);
                              } else {
                                this.handleChange('cust_shipmt_pieces', null);
                              }
                            }}
                              />
                              <Select
                                style={{ width: '50%' }}
                                placeholder="选择包装方式"
                                onChange={value => this.handleKvChange('cust_shipmt_wrap_type', value, 'wrap')}
                                value={formData.cust_shipmt_wrap_type}
                              >
                                {WRAP_TYPE.map(wt => (<Option value={wt.value} key={wt.value}>
                                  {wt.text}</Option>))}
                              </Select>
                            </InputGroup>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="总毛重" {...formItemLayout}>
                            <Input
                              type="number"
                              addonAfter="KG"
                              value={formData.cust_shipmt_weight}
                              onChange={(ev) => {
                            let weight = parseFloat(ev.target.value);
                            if (Number.isNaN(weight)) {
                              weight = null;
                            }
                              this.handleChange('cust_shipmt_weight', weight);
                          }}
                            />
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label={this.msg('CBM')} {...formItemLayout}>
                            <Input
                              type="number"
                              addonAfter={this.msg('立方米')}
                              value={formData.cust_shipmt_volume}
                              onChange={(ev) => {
                            const volume = parseFloat(ev.target.value);
                            if (!Number.isNaN(volume)) {
                              this.handleChange('cust_shipmt_volume', volume);
                            } else {
                              this.handleChange('cust_shipmt_volume', null);
                            }
                          }}
                            />
                          </FormItem>
                        </Col>
                      </Row>
                      {formData.cust_shipmt_transfer !== 'DOM' &&
                      <Row>
                        <Col span={6}>
                          <FormItem label="国际运输方式" {...formItemLayout}>
                            <Select
                              value={formData.cust_shipmt_trans_mode}
                              onChange={value => this.handleKvChange('cust_shipmt_trans_mode', value, 'transmode')}
                              disabled={!formData.cust_shipmt_transfer || formData.cust_shipmt_transfer === 'DOM'}
                            >
                              <Option value={TRANS_MODES[0].value}>
                                <i className={TRANS_MODES[0].icon} /> {TRANS_MODES[0].text}
                              </Option>
                              <Option value={TRANS_MODES[1].value}>
                                <i className={TRANS_MODES[1].icon} /> {TRANS_MODES[1].text}</Option>
                              <Option value={TRANS_MODES[3].value}>
                                <i className={TRANS_MODES[3].icon} /> {TRANS_MODES[3].text}
                              </Option>
                            </Select>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                          <FormItem label="提单号" {...formItemLayout}>
                            <Input
                              placeholder="提单号*分提单号"
                              value={formData.cust_shipmt_bill_lading}
                              onChange={e => this.handleChange('cust_shipmt_bill_lading', e.target.value)}
                            />
                          </FormItem>}
                          { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                          <FormItem label="主运单号" {...formItemLayout}>
                            <Input value={formData.cust_shipmt_mawb} onChange={e => this.handleChange('cust_shipmt_mawb', e.target.value)} />
                          </FormItem>}
                        </Col>
                        <Col span={6}>
                          { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                          <FormItem label="海运单号" {...formItemLayout}>
                            <Input value={formData.cust_shipmt_bill_lading_no} onChange={e => this.handleChange('cust_shipmt_bill_lading_no', e.target.value)} />
                          </FormItem>}
                          { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                          <FormItem label="分运单号" {...formItemLayout}>
                            <Input value={formData.cust_shipmt_hawb} onChange={e => this.handleChange('cust_shipmt_hawb', e.target.value)} />
                          </FormItem>}
                        </Col>
                        <Col span={6}>
                          { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                          <FormItem label="航班号" {...formItemLayout}>
                            <Input value={formData.cust_shipmt_vessel} onChange={e => this.handleChange('cust_shipmt_vessel', e.target.value)} />
                          </FormItem>}
                          { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                          <FormItem label="船名航次" {...formItemLayout}>
                            <InputGroup compact>
                              <Input
                                style={{ width: '60%' }}
                                placeholder="船舶英文名称"
                                value={formData.cust_shipmt_vessel}
                                onChange={e => this.handleChange('cust_shipmt_vessel', e.target.value)}
                              />
                              <Input
                                style={{ width: '40%' }}
                                placeholder="航次号"
                                value={formData.cust_shipmt_voy}
                                onChange={e => this.handleChange('cust_shipmt_voy', e.target.value)}
                              />
                            </InputGroup>
                          </FormItem>}
                        </Col>

                        <Col span={6}>
                          <FormItem label={labelCountry} {...formItemLayout}>
                            <Select
                              showSearch
                              allowClear
                              optionFilterProp="children"
                              value={formData.cust_shipmt_orig_dest_country}
                              onChange={value =>
                                this.handleChange('cust_shipmt_orig_dest_country', value)}
                            >
                              {this.props.countries.map(cntry => (
                                <Option key={cntry.cntry_co} value={cntry.cntry_co}>
                                  {cntry.cntry_co} | {cntry.cntry_name_cn}
                                </Option>))}
                            </Select>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label={labelIEPort} {...formItemLayout}>
                            <Select
                              showSearch
                              allowClear
                              optionFilterProp="children"
                              value={formData.cust_shipmt_i_e_port}
                              onChange={value =>
                                this.handleChange('cust_shipmt_i_e_port', value)}
                            >
                              {this.props.formRequires.declPorts.map(custport => (
                                <Option key={custport.code} value={custport.code}>
                                  {custport.code} | {custport.name}
                                </Option>))}
                            </Select>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="起运港" {...formItemLayout}>
                            <Input value={formData.cust_shipmt_dept_port} onChange={e => this.handleChange('cust_shipmt_dept_port', e.target.value)} />
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="抵运港" {...formItemLayout}>
                            <Input value={formData.cust_shipmt_dest_port} onChange={e => this.handleChange('cust_shipmt_dest_port', e.target.value)} />
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="国际货运代理" {...formItemLayout}>
                            <Select
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              value={formData.cust_shipmt_forwarder}
                              onChange={value => this.handleChange('cust_shipmt_forwarder', value)}
                            >
                              {formRequires.customsBrokers.map(cb =>
                      (<Option value={String(cb.partner_id)} key={String(cb.partner_id)}>
                        {cb.partner_code}|{cb.name}</Option>)) }
                            </Select>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="运费" {...formItemLayout}>
                            <InputGroup compact>
                              <Input style={{ width: '50%' }} value={formData.cust_shipmt_freight} onChange={e => this.handleChange('cust_shipmt_freight', e.target.value)} />
                              <Select
                                style={{ width: '50%' }}
                                value={formData.cust_shipmt_freight_currency}
                                onChange={value => this.handleChange('cust_shipmt_freight_currency', value)}
                              >
                                {formRequires.customsCurrency.map(data => (
                                  <Option key={data.code} value={data.code}>{data.name}</Option>))}
                              </Select>
                            </InputGroup>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="保费" {...formItemLayout}>
                            <InputGroup compact>
                              <Input style={{ width: '50%' }} value={formData.cust_shipmt_insur_fee} onChange={e => this.handleChange('cust_shipmt_insur_fee', e.target.value)} />
                              <Select
                                style={{ width: '50%' }}
                                value={formData.cust_shipmt_insur_currency}
                                onChange={value => this.handleChange('cust_shipmt_insur_currency', value)}
                              >
                                {formRequires.customsCurrency.map(data => (
                                  <Option key={data.code} value={data.code}>{data.name}</Option>))}
                              </Select>
                            </InputGroup>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="杂费" {...formItemLayout}>
                            <InputGroup compact>
                              <Input style={{ width: '50%' }} value={formData.cust_shipmt_misc_fee} onChange={e => this.handleChange('cust_shipmt_misc_fee', e.target.value)} />
                              <Select
                                style={{ width: '50%' }}
                                value={formData.cust_shipmt_misc_currency}
                                onChange={value => this.handleChange('cust_shipmt_misc_currency', value)}
                              >
                                {formRequires.customsCurrency.map(data => (
                                  <Option key={data.code} value={data.code}>{data.name}</Option>))}
                              </Select>
                            </InputGroup>
                          </FormItem>
                        </Col>
                      </Row>}
                    </Panel>
                    <Panel header="扩展属性" key="ext" style={{ borderBottom: 'none' }} >
                      <Row>
                        {ext1Label &&
                        <Col span={6}>
                          <FormItem {...ext1Label} {...formItemLayout}>
                            <Input value={formData.ext_attr_1} onChange={e => this.handleChange('ext_attr_1', e.target.value)} />
                          </FormItem>
                        </Col>}
                        {ext2Label &&
                        <Col span={6}>
                          <FormItem {...ext2Label} {...formItemLayout}>
                            <Input value={formData.ext_attr_2} onChange={e => this.handleChange('ext_attr_2', e.target.value)} />
                          </FormItem>
                        </Col>}
                        {ext3Label &&
                        <Col span={6}>
                          <FormItem {...ext3Label} {...formItemLayout}>
                            <Input value={formData.ext_attr_3} onChange={e => this.handleChange('ext_attr_3', e.target.value)} />
                          </FormItem>
                        </Col>}
                        {ext4Label &&
                        <Col span={6}>
                          <FormItem {...ext4Label} {...formItemLayout}>
                            <Input value={formData.ext_attr_4} onChange={e => this.handleChange('ext_attr_4', e.target.value)} />
                          </FormItem>
                        </Col>}
                      </Row>
                    </Panel>
                  </Collapse>
                </Card>
                <Card
                  title={<span>订单流程
                    <Select
                      placeholder="请选择流程规则"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      value={formData.flow_id}
                      onChange={this.handleFlowChange}
                      style={{ width: '30%', marginLeft: 32 }}
                    >
                      {flows.map(data =>
                        <Option key={data.id} value={data.id}>{data.name}</Option>)}
                    </Select>
                  </span>}
                  loading={this.props.graphLoading}
                  bodyStyle={{ padding: 16 }}
                >
                  <Steps direction="vertical" current={current}>
                    {this.renderSteps(formData.subOrders, orderShipment)}
                  </Steps>
                </Card>
              </FormPane>
            </TabPane>
            <TabPane tab="商业发票" key="invoice" disabled={!formData.shipmt_order_no}>
              <InvoicePane />
            </TabPane>
            <TabPane
              tab="集装箱"
              key="container"
              disabled={
              !formData.shipmt_order_no || formData.cust_shipmt_transfer === 'DOM' || formData.cust_shipmt_trans_mode === '5'
            }
            >
              <ContainerPane />
            </TabPane>
            <TabPane tab="货物明细" key="details" disabled={!formData.shipmt_order_no}>
              <OrderDetailsPane orderNo={formData.shipmt_order_no} />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    );
  }
}
