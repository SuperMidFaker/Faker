import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Checkbox, Form, Row, Col, Card, Input, Select, Steps, Popover, Icon, Tag, Table, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODSTYPES, WRAP_TYPE, EXPEDITED_TYPES, SCOF_ORDER_TRANSFER, TRANS_MODES } from 'common/constants';
import { setClientForm } from 'common/reducers/crmOrders';
import { loadPartnerFlowList, loadFlowGraph, loadCustomerCmsQuotes, loadCwmBizParams } from 'common/reducers/scofFlow';
import { loadOperators } from 'common/reducers/crmCustomers';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import RowAction from 'client/components/RowAction';
import CMSDelegateForm from './cmsDelegateForm';
import TMSConsignForm from './tmsConsignForm';
import CwmReceivingForm from './cwmReceivingForm';
import CwmShippingForm from './cwmShippingForm';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
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
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.crmOrders.formData,
    formRequires: state.crmOrders.formRequires,
    flows: state.scofFlow.partnerFlows,
    graphLoading: state.scofFlow.graphLoading,
  }),
  {
    setClientForm,
    loadPartnerFlowList,
    loadFlowGraph,
    loadCustomerCmsQuotes,
    loadOperators,
    loadCwmBizParams,
  }
)
export default class OrderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
    formRequires: PropTypes.shape({
      clients: PropTypes.shape({ partner_id: PropTypes.number }),
    }).isRequired,
    setClientForm: PropTypes.func.isRequired,
    graphLoading: PropTypes.bool.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.customer_partner_id !== this.props.formData.customer_partner_id) {
      this.props.loadPartnerFlowList({
        partnerId: nextProps.formData.customer_partner_id,
        tenantId: nextProps.tenantId,
      });
      this.props.loadCwmBizParams(nextProps.tenantId, nextProps.formData.customer_partner_id);
      this.props.loadCustomerCmsQuotes(nextProps.tenantId, nextProps.formData.customer_partner_id);
      this.props.loadOperators(nextProps.formData.customer_partner_id, nextProps.tenantId);
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  containerColumns = [{
    title: '集装箱号',
    dataIndex: 'cntnr_no',
  }, {
    title: '集装箱规格',
    dataIndex: 'cntnr_spec',
  }, {
    title: '是否拼箱',
    dataIndex: 'is_consolidated',
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
  }];
  invoiceColumns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '订单号',
    dataIndex: 'order_no',
  }, {
    title: '合同号',
    dataIndex: 'contract_no',
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
  }];
  handleClientChange = (value) => {
    const selPartnerId = Number(value);
    const client = this.props.formRequires.clients.find(cl => cl.partner_id === selPartnerId);
    if (client) {
      this.props.setClientForm(-1, {
        flow_id: null,
        customer_name: client.name,
        customer_tenant_id: client.tid,
        customer_partner_id: selPartnerId,
        customer_partner_code: client.partner_code,
        subOrders: [],
      });
    }
  }
  handleFlowChange = (value) => {
    this.props.loadFlowGraph(value).then((result) => {
      if (!result.error) {
        const subOrders = [];
        const { nodes, edges } = result.data;
        const nodeEndMap = {};
        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i];
          const targetNode = nodes.filter(node => node.id === edge.target)[0];
          if (nodeEndMap[edge.source]) {
            nodeEndMap[edge.source].push(targetNode);
          } else {
            nodeEndMap[edge.source] = [targetNode];
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
    if (key === 'cust_shipmt_is_container') {
      this.props.setClientForm(-1, { containers: [] });
    }
  }
  handleKvChange = (key, value, prefix) => {
    this.props.setClientForm(-1, { [key]: value, [`${key}_name`]: SeletableKeyNameMap[`${prefix}-${value}`] });
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
  render() {
    const { formRequires, formData, flows } = this.props;
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
      cust_shipmt_goods_type: formData.cust_shipmt_goods_type,
      cust_shipmt_is_container: formData.cust_shipmt_is_container,
      cust_shipmt_wrap_type: formData.cust_shipmt_wrap_type,
    };
    const current = formData.subOrders.length || 0;
    const cargoTransferHint = (
      <ul>
        根据货物是否有实际国际运输区分
        <li>货物进口: 有实际进境运输</li>
        <li>货物出口: 有实际出境运输</li>
        <li>国内流转: 无实际进出境运输</li>
      </ul>
    );
    return (
      <Form layout="horizontal" className="order-flow-form form-layout-compact">
        <Card bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="main">
            <TabPane tab="基本信息" key="main">
              <FormPane>
                <Card >
                  <Row>
                    <Col span={12}>
                      <FormItem label="客户" {...formItemSpan2Layout} required>
                        <Select
                          placeholder="请选择客户"
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          value={formData.customer_partner_id}
                          onChange={value => this.handleClientChange(value)}
                          style={{ width: '100%' }}
                        >
                          {formRequires.clients.map(data => (
                            <Option key={data.partner_id} value={data.partner_id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="客户单号" {...formItemLayout}>
                        <Input value={formData.cust_order_no} onChange={e => this.handleChange('cust_order_no', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="紧急程度" {...formItemLayout}>
                        <Select value={formData.cust_shipmt_expedited} onChange={value => this.handleKvChange('cust_shipmt_expedited', value, '0')}>
                          <Option value={EXPEDITED_TYPES[0].value}>
                            <Tag>{EXPEDITED_TYPES[0].text}</Tag></Option>
                          <Option value={EXPEDITED_TYPES[1].value}>
                            <Tag color="#ffbf00">{EXPEDITED_TYPES[1].text}</Tag></Option>
                          <Option value={EXPEDITED_TYPES[2].value}>
                            <Tag color="#f04134">{EXPEDITED_TYPES[2].text}</Tag></Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        label={(
                          <span>
                              订单类型&nbsp;
                            <Popover content={cargoTransferHint} title="提示" trigger="hover">
                              <Icon type="question-circle-o" />
                            </Popover>
                          </span>
                          )}
                        {...formItemLayout}
                        required
                      >
                        <Select
                          value={formData.cust_shipmt_transfer}
                          onChange={value =>
                            this.handleKvChange('cust_shipmt_transfer', value, 'transfer')}
                        >
                          {SCOF_ORDER_TRANSFER.map(sot =>
                            (<Option value={sot.value} key={sot.value}>
                              {sot.text}</Option>))}
                        </Select>
                      </FormItem>
                    </Col>
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
                              if (!Number.isNaN(Number(pieces))) {
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
                            const weight = parseFloat(ev.target.value);
                            if (!Number.isNaN(weight)) {
                              this.handleChange('cust_shipmt_weight', weight);
                            } else {
                              this.handleChange('cust_shipmt_weight', null);
                            }
                          }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label={this.msg('CBM')} {...formItemLayout}>
                        <Input
                          type="number"
                          addonAfter={this.msg('cubicMeter')}
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
                    <Col span={6}>
                      <FormItem label="扩展单号1" {...formItemLayout}>
                        <Input value={formData.ext_attr_1} onChange={e => this.handleChange('ext_attr_1', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="扩展单号2" {...formItemLayout}>
                        <Input value={formData.ext_attr_2} onChange={e => this.handleChange('ext_attr_2', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="扩展单号3" {...formItemLayout}>
                        <Input value={formData.ext_attr_3} onChange={e => this.handleChange('ext_attr_3', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="扩展单号4" {...formItemLayout}>
                        <Input value={formData.ext_attr_4} onChange={e => this.handleChange('ext_attr_4', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="扩展单号5" {...formItemLayout}>
                        <Input value={formData.ext_attr_5} onChange={e => this.handleChange('ext_attr_5', e.target.value)} />
                      </FormItem>
                    </Col>
                  </Row>
                </Card>
              </FormPane>
            </TabPane>
            <TabPane tab="SHIPMENT" key="shipment" disabled={formData.cust_shipmt_transfer === 'DOM'}>
              <FormPane>
                <Card >
                  <Row>
                    <Col span={6}>
                      {formData.cust_shipmt_transfer && formData.cust_shipmt_transfer !== 'DOM' &&
                      <FormItem label="运输方式" {...formItemLayout}>
                        <Select value={formData.cust_shipmt_trans_mode} onChange={value => this.handleKvChange('cust_shipmt_trans_mode', value, 'transmode')}>
                          { (formData.cust_shipmt_transfer === 'IMP' || formData.cust_shipmt_transfer === 'EXP') &&
                          <Option value={TRANS_MODES[0].value}>
                            <i className={TRANS_MODES[0].icon} /> {TRANS_MODES[0].text}
                          </Option>
                          }
                          { (formData.cust_shipmt_transfer === 'IMP' || formData.cust_shipmt_transfer === 'EXP') &&
                          <Option value={TRANS_MODES[1].value}>
                            <i className={TRANS_MODES[1].icon} />
                            {TRANS_MODES[1].text}</Option>
                          }
                          { (formData.cust_shipmt_transfer === 'IMP' || formData.cust_shipmt_transfer === 'EXP') &&
                          <Option value={TRANS_MODES[3].value}>
                            <i className={TRANS_MODES[3].icon} /> {TRANS_MODES[3].text}
                          </Option>
                          }
                        </Select>
                      </FormItem>}
                    </Col>
                    <Col span={6}>
                      { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                      <FormItem label="提单号" {...formItemLayout}>
                        <Input
                          placeholder="提单号*分提单号"
                          value={formData.cust_shipmt_bill_lading}
                          onChange={e => this.handleChange('cust_shipmt_bill_lading', e.target.value)}
                        />
                      </FormItem>
                    }
                      { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                      <FormItem label="主运单号" {...formItemLayout}>
                        <Input value={formData.cust_shipmt_mawb} onChange={e => this.handleChange('cust_shipmt_mawb', e.target.value)} />
                      </FormItem>
                    }
                    </Col>
                    <Col span={6}>
                      { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                      <FormItem label="海运单号" {...formItemLayout}>
                        <Input value={formData.cust_shipmt_bill_lading_no} onChange={e => this.handleChange('cust_shipmt_bill_lading_no', e.target.value)} />
                      </FormItem>
                    }
                      { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                      <FormItem label="分运单号" {...formItemLayout}>
                        <Input value={formData.cust_shipmt_hawb} onChange={e => this.handleChange('cust_shipmt_hawb', e.target.value)} />
                      </FormItem>
                    }
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
                      <FormItem label="货运代理" {...formItemLayout}>
                        <Input value={formData.cust_shipmt_forwarder} onChange={e => this.handleChange('cust_shipmt_forwarder', e.target.value)} />
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="运费" {...formItemLayout}>
                        <InputGroup compact>
                          <Input style={{ width: '50%' }} value={formData.cust_shipmt_freight} onChange={e => this.handleChange('cust_shipmt_freight', e.target.value)} />
                          <Select style={{ width: '50%' }} />
                        </InputGroup>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="保费" {...formItemLayout}>
                        <InputGroup compact>
                          <Input style={{ width: '50%' }} value={formData.cust_shipmt_insurance} onChange={e => this.handleChange('cust_shipmt_insurance', e.target.value)} />
                          <Select style={{ width: '50%' }} />
                        </InputGroup>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label="杂费" {...formItemLayout}>
                        <InputGroup compact>
                          <Input style={{ width: '50%' }} value={formData.cust_shipmt_misc} onChange={e => this.handleChange('cust_shipmt_misc', e.target.value)} />
                          <Select style={{ width: '50%' }} />
                        </InputGroup>
                      </FormItem>
                    </Col>
                  </Row>
                </Card>
              </FormPane>
            </TabPane>
            <TabPane tab="集装箱" key="container" disabled={formData.cust_shipmt_transfer === 'DOM' || formData.cust_shipmt_trans_mode === '5'} >
              <FormPane>
                <Row>
                  <Col span={6}>
                    <FormItem label="集装箱号" {...formItemLayout}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="集装箱规格" {...formItemLayout}>
                      <Select />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="是否拼箱" {...formItemLayout}>
                      <Checkbox />
                    </FormItem>
                  </Col>
                  <Col span={4} offset={2}>
                    <Button type="primary" ghost icon="plus-circle-o">添加</Button>
                  </Col>
                </Row>
                <Card bodyStyle={{ padding: 0 }}>
                  <Table size="small" columns={this.containerColumns} />
                </Card>
              </FormPane>
            </TabPane>
            <TabPane tab="发票合同" key="invoice">
              <FormPane>
                <Row>
                  <Col span={6}>
                    <FormItem label="发票号" {...formItemLayout}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="合同号" {...formItemLayout}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="订单号" {...formItemLayout}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={4} offset={2}>
                    <Button type="primary" ghost icon="plus-circle-o">添加</Button>
                  </Col>
                </Row>
                <Card bodyStyle={{ padding: 0 }}>
                  <Table size="small" columns={this.invoiceColumns} />
                </Card>
              </FormPane>
            </TabPane>
          </Tabs>
        </Card>
        <Card
          title={<span>流程
            <Select
              placeholder="请选择流程规则"
              showSearch
              allowClear
              optionFilterProp="children"
              value={formData.flow_id}
              onChange={this.handleFlowChange}
              style={{ width: '50%', marginLeft: 24 }}
            >
              {flows.map(data => <Option key={data.id} value={data.id}>{data.name}</Option>)}
            </Select>
          </span>}
          loading={this.props.graphLoading}
          bodyStyle={{ padding: 16 }}
        >
          <Steps direction="vertical" current={current}>
            {this.renderSteps(formData.subOrders, orderShipment)}
          </Steps>
        </Card>
      </Form>
    );
  }
}
