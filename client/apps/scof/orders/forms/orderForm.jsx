import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Row, Col, Card, Input, Radio, Select, Steps, Popover, Icon, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODSTYPES, WRAP_TYPE, SCOF_CONTAINER_TYPE, SCOF_ORDER_TRANSFER, SCOF_ORDER_TRANSMODES } from 'common/constants';
import { setClientForm } from 'common/reducers/crmOrders';
import { loadPartnerFlowList, loadFlowGraph, loadCustomerQuotes } from 'common/reducers/scofFlow';
import Container from './container';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import ClearanceForm from './clearanceForm';
import TransportForm from './transportForm';
import WarehouseForm from './warehouseForm';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;
const Step = Steps.Step;

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
  }),
  { setClientForm, loadPartnerFlowList, loadFlowGraph, loadCustomerQuotes }
)

export default class OrderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    formRequires: PropTypes.object.isRequired,
    setClientForm: PropTypes.func.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleClientChange = (value) => {
    const selPartnerId = Number(value);
    const { tenantId } = this.props;
    const client = this.props.formRequires.clients.find(cl => cl.partner_id === selPartnerId);
    if (client) {
      this.props.setClientForm(-1, {
        customer_name: client.name,
        customer_tenant_id: client.tid,
        customer_partner_id: selPartnerId,
        customer_partner_code: client.partner_code,
      });
      this.props.loadPartnerFlowList({
        partnerId: selPartnerId,
        tenantId,
      });
      this.props.loadCustomerQuotes(tenantId, selPartnerId);
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
        while (Object.keys(visitedMap).length < nodes.length) {
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
          lnodes.sort((na, nb) => na.id < nb.id ? -1 : 1);
          lnodes.forEach((node) => {
            if (node.kind === 'tms') {
              subOrders.push({
                node: {
                  node_uuid: node.id,
                  kind: node.kind,
                  name: node.name,
                  in_degree: node.in_degree,
                  out_degree: node.out_degree,
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
                  node_uuid: node.id,
                  kind: node.kind,
                  name: node.name,
                  in_degree: node.in_degree,
                  out_degree: node.out_degree,
                  level,
                  pack_count: null,
                  gross_wt: null,
                  remark: '',
                  package: '',
                },
                files: [],
              });
            } else if (node.kind === 'cwm') {
              subOrders.push({
                node: {
                  node_uuid: node.id,
                  kind: node.kind,
                  name: node.name,
                  in_degree: node.in_degree,
                  out_degree: node.out_degree,
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
  renderSteps = (subOrders, shipment) => {
    const { operation } = this.props;
    const steps = [];
    // steps.push(<Step key={1} status="process" description={<StepNodeForm formData={formData.subOrders[0]} index={0} operation={operation} />} />);
    for (let i = 0; i < subOrders.length; i++) {
      const order = subOrders[i];
      const node = order.node;
      if (node.kind === 'import' || node.kind === 'export') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<ClearanceForm formData={order} shipment={shipment} index={i} operation={operation} />} />);
      } else if (node.kind === 'tms') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<TransportForm formData={order} shipment={shipment} index={i} operation={operation} />} />);
      } else if (node.kind === 'cwm') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<WarehouseForm formData={order} index={i} operation={operation} />} />);
      }
    }
    return steps;
  }
  render() {
    const { formRequires, formData, flows } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const spanFormItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
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
      cust_shipmt_goods_type: formData.cust_shipmt_goods_type,
      cust_shipmt_is_container: formData.cust_shipmt_is_container,
      cust_shipmt_wrap_type: formData.cust_shipmt_wrap_type,
    };
    const current = formData.subOrders.length || 0;
    return (
      <Form layout="horizontal" className="order-flow-form">
        <Card title={<span>客户需求
          <Select size="large" placeholder="请选择客户" showSearch optionFilterProp="children"
            value={formData.customer_partner_id}
            onChange={value => this.handleClientChange(value)}
            style={{ width: '50%', marginLeft: 24 }}
          >
            {formRequires.clients.map(data => (
              <Option key={data.partner_id} value={data.partner_id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
            )}
          </Select></span>}
          bodyStyle={{ padding: 8 }}
        >
          <Collapse bordered={false} defaultActiveKey={['trading', 'shipment', 'consignment']}>
            <Panel header="贸易信息" key="trading">
              <Row gutter={16}>
                <Col sm={8}>
                  <FormItem label="订单号" {...formItemLayout}>
                    <Input value={formData.cust_order_no} onChange={e => this.handleChange('cust_order_no', e.target.value)} />
                  </FormItem>
                </Col>
                <Col sm={8}>
                  <FormItem label="发票号" {...formItemLayout}>
                    <Input placeholder="可用逗号分隔填写多个" value={formData.cust_invoice_no} onChange={e => this.handleChange('cust_invoice_no', e.target.value)} />
                  </FormItem>
                </Col>
                <Col sm={8}>
                  <FormItem label="合同号" {...formItemLayout}>
                    <Input value={formData.cust_contract_no} onChange={e => this.handleChange('cust_contract_no', e.target.value)} />
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header="货运信息" key="shipment">
              <Row gutter={16}>
                <Col sm={8}>
                  <FormItem label="货物流向" {...formItemLayout} required="true">
                    <RadioGroup value={formData.cust_shipmt_transfer} onChange={ev => this.handleChange('cust_shipmt_transfer', ev.target.value)}>
                      {SCOF_ORDER_TRANSFER.map(sot => <RadioButton value={sot.value}>{sot.text}</RadioButton>)}
                    </RadioGroup>
                  </FormItem>
                </Col>
                <Col sm={16}>
                  <FormItem label="运输方式" {...spanFormItemLayout} required="true">
                    <RadioGroup value={formData.cust_shipmt_trans_mode} onChange={ev => this.handleChange('cust_shipmt_trans_mode', ev.target.value)}>
                      { (formData.cust_shipmt_transfer === 'IMP' || formData.cust_shipmt_transfer === 'EXP') &&
                      <RadioButton value={SCOF_ORDER_TRANSMODES[0].value}><i className={SCOF_ORDER_TRANSMODES[0].icon} /> {SCOF_ORDER_TRANSMODES[0].text}</RadioButton>
                    }
                      { (formData.cust_shipmt_transfer === 'IMP' || formData.cust_shipmt_transfer === 'EXP') &&
                      <RadioButton value={SCOF_ORDER_TRANSMODES[1].value}><i className={SCOF_ORDER_TRANSMODES[1].icon} /> {SCOF_ORDER_TRANSMODES[1].text}</RadioButton>
                    }
                      { (formData.cust_shipmt_transfer === 'DOM') &&
                      <RadioButton value={SCOF_ORDER_TRANSMODES[2].value}><i className={SCOF_ORDER_TRANSMODES[2].icon} /> {SCOF_ORDER_TRANSMODES[2].text}</RadioButton>
                    }
                      { (formData.cust_shipmt_transfer === 'DOM') &&
                      <RadioButton value={SCOF_ORDER_TRANSMODES[3].value}><i className={SCOF_ORDER_TRANSMODES[3].icon} /> {SCOF_ORDER_TRANSMODES[3].text}</RadioButton>
                    }
                    </RadioGroup>
                  </FormItem>
                </Col>
                <Col sm={8}>
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                  <FormItem label="提单号" {...formItemLayout}>
                    <Input placeholder="格式：提单号*分提单号" value={formData.cust_shipmt_bill_lading} onChange={e => this.handleChange('cust_shipmt_bill_lading', e.target.value)} />
                  </FormItem>
              }
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                  <FormItem label="主运单号" {...formItemLayout}>
                    <Input value={formData.cust_shipmt_mawb} onChange={e => this.handleChange('cust_shipmt_mawb', e.target.value)} />
                  </FormItem>
              }
                </Col>
                <Col sm={8}>
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
                <Col sm={8}>
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                  <FormItem label="需要换单" {...formItemLayout}>
                    <Switch checkedChildren={'是'} unCheckedChildren={'否'} onChange={value => this.handleChange('ccb_need_exchange', value ? 1 : 0)} checked={formData.ccb_need_exchange} />
                  </FormItem>
                }
                </Col>
                <Col sm={8}>
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                  <FormItem label="装箱类型" {...formItemLayout}>
                    <RadioGroup value={formData.cust_shipmt_is_container} onChange={ev => this.handleChange('cust_shipmt_is_container', ev.target.value)}>
                      <RadioButton value={SCOF_CONTAINER_TYPE[0].value}>{SCOF_CONTAINER_TYPE[0].text}</RadioButton>
                      <RadioButton value={SCOF_CONTAINER_TYPE[1].value}>{SCOF_CONTAINER_TYPE[1].text}</RadioButton>
                      <RadioButton value={SCOF_CONTAINER_TYPE[2].value}>{SCOF_CONTAINER_TYPE[2].text}</RadioButton>
                    </RadioGroup>
                  </FormItem>
                }
                </Col>
                <Col sm={8}>
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                  <FormItem label="船名" {...formItemLayout}>
                    <Input placeholder="船舶英文名称或编号" value={formData.cust_shipmt_vessel} onChange={e => this.handleChange('cust_shipmt_vessel', e.target.value)} />
                  </FormItem>
                }
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '5') &&
                  <FormItem label="航班号" {...formItemLayout}>
                    <Input value={formData.cust_shipmt_vessel} onChange={e => this.handleChange('cust_shipmt_vessel', e.target.value)} />
                  </FormItem>
                }
                </Col>
                <Col sm={8}>
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') &&
                  <FormItem label="航次号" {...formItemLayout}>
                    <Input placeholder="航次号" value={formData.cust_shipmt_voy} onChange={e => this.handleChange('cust_shipmt_voy', e.target.value)} />
                  </FormItem>
                }
                </Col>
                <Col sm={24}>
                  { (formData.cust_shipmt_transfer !== 'DOM' && formData.cust_shipmt_trans_mode === '2') && formData.cust_shipmt_is_container === 'FCL' && (
                  <FormItem label="箱型箱号" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                    <Popover
                      placement="rightBottom"
                      title="箱型箱号"
                      trigger="click"
                      content={<Container value={formData.containers} onChange={value => this.handleChange('containers', value)} />}
                    >
                      <span>
                        <a><Icon type="edit" style={{ marginRight: 10 }} /></a>
                        {formData.containers.map(item => `${item.container_num} x ${item.container_type}`).join('; ')}
                      </span>
                    </Popover>
                  </FormItem>
                )}
                </Col>
                <Col sm={8}>
                  <FormItem label="货物类型" {...formItemLayout} required="true">
                    <RadioGroup value={formData.cust_shipmt_goods_type} onChange={ev => this.handleChange('cust_shipmt_goods_type', ev.target.value)}>
                      <RadioButton value={GOODSTYPES[0].value}>{GOODSTYPES[0].text}</RadioButton>
                      <RadioButton value={GOODSTYPES[1].value}>{GOODSTYPES[1].text}</RadioButton>
                      <RadioButton value={GOODSTYPES[2].value}>{GOODSTYPES[2].text}</RadioButton>
                    </RadioGroup>
                  </FormItem>
                </Col>
                <Col sm={8}>
                  <FormItem label="件数/包装" {...formItemLayout} required="true">
                    <InputGroup compact>
                      <Input type="number" style={{ width: '50%' }} value={formData.cust_shipmt_pieces} onChange={e => this.handleChange('cust_shipmt_pieces', e.target.value)} />
                      <Select size="large" style={{ width: '50%' }} placeholder="选择包装方式"
                        onChange={value => this.handleChange('cust_shipmt_wrap_type', value)}
                        value={formData.cust_shipmt_wrap_type}
                      >
                        {
                          WRAP_TYPE.map(wt =>
                            <Option value={wt.value} key={wt.value}>{wt.text}</Option>
                          )
                        }
                      </Select>
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col sm={8}>
                  <FormItem label="总毛重" {...formItemLayout} required="true">
                    <Input type="number" addonAfter="KG" value={formData.cust_shipmt_weight} onChange={e => this.handleChange('cust_shipmt_weight', e.target.value)} />
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header="收发货信息" key="consignment">
              <Steps size="small">
                <Step status="wait" title="发货方" icon={<Icon type="logout" />} />
                <Step status="wait" title="收货方" icon={<Icon type="login" />} />

              </Steps>
            </Panel>
          </Collapse>
        </Card>
        <Card title={<span>订单流程
          <Select size="large" placeholder="请选择流程规则" showSearch allowClear optionFilterProp="children"
            value={formData.flow_id} onChange={this.handleFlowChange} style={{ width: '50%', marginLeft: 24 }}
          >
            {flows.map(data => <Option key={data.id} value={data.id}>{data.name}</Option>)}
          </Select></span>}
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
