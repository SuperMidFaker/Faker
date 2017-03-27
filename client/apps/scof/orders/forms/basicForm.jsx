import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Row, Col, Card, Input, Radio, Select, Popover, Icon, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODSTYPES, WRAP_TYPE, SCOF_CONTAINER_TYPE, SCOF_ORDER_TRANSFER, SCOF_ORDER_TRANSMODES } from 'common/constants';
import { setClientForm } from 'common/reducers/crmOrders';
import { loadPartnerFlowList, loadFlowGraph, loadCustomerQuotes } from 'common/reducers/scofFlow';
import Container from './container';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

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

export default class BasicForm extends Component {
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
          lnodes.sort((na, nb) => na.node_uuid - nb.node_uuid);
          lnodes.forEach((node) => {
            if (node.kind === 'tms') {
              subOrders.push({
                node_uuid: node.id,
                kind: node.kind,
                name: node.name,
                in_degree: node.in_degree,
                out_degree: node.out_degree,
                level,
                transports: [{
                  consigner_name: '',
                  consigner_province: '',
                  consigner_city: '',
                  consigner_district: '',
                  consigner_street: '',
                  consigner_region_code: -1,
                  consigner_addr: '',
                  consigner_email: '',
                  consigner_contact: '',
                  consigner_mobile: '',
                  consignee_name: '',
                  consignee_province: '',
                  consignee_city: '',
                  consignee_district: '',
                  consignee_street: '',
                  consignee_region_code: -1,
                  consignee_addr: '',
                  consignee_email: '',
                  consignee_contact: '',
                  consignee_mobile: '',
                  pack_count: 1,
                  gross_wt: 0,
                  trs_mode_id: -1,
                  trs_mode_code: '',
                  trs_mode: '',
                  remark: '',
                  package: '',
                }],
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

    return (
      <div>
        <Card title="订单需求" bodyStyle={{ padding: 8 }}>
          <Row gutter={16} style={{ padding: 16 }}>
            <Col sm={16}>
              <FormItem label="客户" {...spanFormItemLayout} required="true">
                <Select showSearch optionFilterProp="children"
                  value={formData.customer_partner_id}
                  onChange={value => this.handleClientChange(value)}
                >
                  {formRequires.clients.map(data => (
                    <Option key={data.partner_id} value={data.partner_id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                    )}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Collapse bordered={false} defaultActiveKey={['trading', 'shipment']}>
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
                      <RadioButton value={SCOF_ORDER_TRANSFER[0].value}>{SCOF_ORDER_TRANSFER[0].text}</RadioButton>
                      <RadioButton value={SCOF_ORDER_TRANSFER[1].value}>{SCOF_ORDER_TRANSFER[1].text}</RadioButton>
                      <RadioButton value={SCOF_ORDER_TRANSFER[2].value}>{SCOF_ORDER_TRANSFER[2].text}</RadioButton>
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
                  <FormItem label="包装/件数" {...formItemLayout} required="true">
                    <InputGroup compact>
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
                      <Input type="number" style={{ width: '50%' }} value={formData.cust_shipmt_pieces} onChange={e => this.handleChange('cust_shipmt_pieces', e.target.value)} />
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
              <Row gutter={16}>
                { (formData.cust_shipmt_transfer === 'IMP') &&
                <Col sm={24}>
                收货方
              </Col>
              }
                { (formData.cust_shipmt_transfer === 'EXP') &&
                <Col sm={24}>
                发货方
              </Col>
              }
                { (formData.cust_shipmt_transfer === 'DOM') &&
                <Col sm={12}>
                发货方
              </Col>
              }
                { (formData.cust_shipmt_transfer === 'DOM') &&
                <Col sm={12}>
                收货方
              </Col>
              }
              </Row>
            </Panel>
          </Collapse>
        </Card>
        <Card title={<span>订单流程<Select size="large" placeholder="请选择流程规则" showSearch optionFilterProp="children"
          value={formData.flow_id} onChange={this.handleFlowChange} style={{ width: '50%', marginLeft: 24 }}
        >
          {flows.map(data => (
            <Option key={data.id} value={data.id}>{data.name}</Option>)
                    )}
        </Select></span>} bodyStyle={{ padding: 0 }}
        />
      </div>
    );
  }
}
