import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Select, Radio } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODSTYPES, TRANS_MODE } from 'common/constants';
import { setClientForm } from 'common/reducers/crmOrders';
import { loadBusinessModels } from 'common/reducers/crmCustomers';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.crmOrders.formData,
    formRequires: state.crmOrders.formRequires,
    businessModels: state.crmCustomers.businessModels,
  }),
  { setClientForm, loadBusinessModels }
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
    loadBusinessModels: PropTypes.func.isRequired,
    businessModels: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleClientChange = (value) => {
    const selPartnerId = Number(value);
    const { tenantId } = this.props;
    const client = this.props.formRequires.clients.find(cl => cl.partner_id === selPartnerId);
    if (client) {
      this.props.setClientForm({
        customer_name: client.name,
        customer_tenant_id: client.tid,
        customer_partner_id: selPartnerId,
        customer_partner_code: client.partner_code,
      });
      this.props.loadBusinessModels({
        partnerId: selPartnerId,
        tenantId,
      });
    }
  }
  handleBusinessModelChange = (value) => {
    const { businessModels } = this.props;
    const businessModel = businessModels.find(item => item.id === value);
    const subOrders = [];
    const modelArray = businessModel.model.split(',');
    modelArray.forEach(item => {
      if (item === 'transport') {
        subOrders.push({
          _mode: item,
          trs_mode_id: -1,
          trs_mode_code: '',
          trs_mode: '',
          shipments: [{
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
          }],
        });
      } else if (item === 'clearance') {
        subOrders.push({
          _mode: item,
          ccb_need_exchange: 0,
          files: [],
          delegations: [{
            decl_way_code: '',
            manual_no: '',
            pack_count: 1,
            gross_wt: 0,
          }],
        });
      }
    });
    this.props.setClientForm({ model: businessModel.model, subOrders });
  }
  handleChange = (key, value) => {
    this.props.setClientForm({ [key]: value });
  }
  changeModelForm = (model) => {
    return model.replace(/transport/g, '运输').replace(/clearance/g, '清关')
  }
  render() {
    const { formRequires, formData, businessModels } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    return (
      <Card bodyStyle={{ padding: 16 }}>
        <Row>
          <Col sm={8}>
            <FormItem label="业务类型" {...formItemLayout} required="true">
              <RadioGroup value={formData.shipmt_order_mode} onChange={e => this.handleChange('shipmt_order_mode', e.target.value)}>
                <RadioButton value={0}>清关</RadioButton>
                <RadioButton value={1}>运输</RadioButton>
                <RadioButton value={2}>清关运输</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="客户名称" {...formItemLayout} required="true">
              <Select showSearch optionFilterProp="children"
                value={formData.customer_name}
                onChange={value => this.handleClientChange(value)}
              >
                {formRequires.clients.map(data => (
                  <Option key={data.partner_id} value={data.partner_id}>{data.partner_unique_code ? `${data.partner_unique_code} | ${data.name}` : data.name}</Option>)
                )}
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="业务规则" {...formItemLayout} required="true">
              <Select showSearch optionFilterProp="children"
                value={this.changeModelForm(formData.model)}
                onChange={value => this.handleBusinessModelChange(value)}
              >
                {businessModels.map(data => (
                  <Option key={data.id} value={data.id}>{this.changeModelForm(data.model)}</Option>)
                )}
              </Select>
            </FormItem>
          </Col>
          
        </Row>
        <Row>
          
          <Col sm={8}>
            <FormItem label="客户订单号" {...formItemLayout} required="true">
              <Input value={formData.cust_order_no} onChange={e => this.handleChange('cust_order_no', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="客户发票号" {...formItemLayout}>
              <Input value={formData.cust_invoice_no} onChange={e => this.handleChange('cust_invoice_no', e.target.value)} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label="运输方式" {...formItemLayout} required="true">
              <Select value={formData.cust_shipmt_trans_mode} onChange={value => this.handleChange('cust_shipmt_trans_mode', value)}>
                {
                TRANS_MODE.map(tr =>
                  <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            { formData.cust_shipmt_trans_mode === '2' &&
            <FormItem label="提单号" {...formItemLayout}>
              <Input value={formData.cust_shipmt_bill_lading} onChange={e => this.handleChange('cust_shipmt_bill_lading', e.target.value)} />
            </FormItem>
          }
            { formData.cust_shipmt_trans_mode === '5' &&
            <FormItem label="主运单号" {...formItemLayout}>
              <Input value={formData.cust_shipmt_mawb} onChange={e => this.handleChange('cust_shipmt_mawb', e.target.value)} />
            </FormItem>
          }
          </Col>
          <Col sm={8}>
            { formData.cust_shipmt_trans_mode === '2' &&
            <FormItem label="船名航次号" {...formItemLayout}>
              <Input value={formData.cust_shipmt_vessel_voy} onChange={e => this.handleChange('cust_shipmt_vessel_voy', e.target.value)} />
            </FormItem>
          }
            { formData.cust_shipmt_trans_mode === '5' &&
            <FormItem label="分运单号" {...formItemLayout}>
              <Input value={formData.cust_shipmt_hawb} onChange={e => this.handleChange('cust_shipmt_hawb', e.target.value)} />
            </FormItem>
          }
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label="货物类型" {...formItemLayout} required="true">
              <Select value={formData.cust_shipmt_goods_type} onChange={value => this.handleChange('cust_shipmt_goods_type', value)}>
                {
                GOODSTYPES.map(gt =>
                  <Option value={gt.value} key={gt.value}>{gt.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="毛重" {...formItemLayout} required="true">
              <Input value={formData.cust_shipmt_weight} onChange={e => this.handleChange('cust_shipmt_weight', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="件数" {...formItemLayout} required="true">
              <Input value={formData.cust_shipmt_pieces} onChange={e => this.handleChange('cust_shipmt_pieces', e.target.value)} />
            </FormItem>
          </Col>

        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label="包装方式" {...formItemLayout}>
              <Select value={formData.cust_shipmt_package} onChange={value => this.handleChange('cust_shipmt_package', value)}>
                {formRequires.packagings.map(
                  pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="总体积" {...formItemLayout}>
              <Input value={formData.cust_shipmt_volume} onChange={e => this.handleChange('cust_shipmt_volume', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="备注" {...formItemLayout}>
              <Input value={formData.remark} onChange={e => this.handleChange('remark', e.target.value)} />
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
