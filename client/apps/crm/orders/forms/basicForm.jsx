import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Select, Popover, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODSTYPES, TRANS_MODE } from 'common/constants';
import { setClientForm } from 'common/reducers/crmOrders';
import { loadBusinessModels } from 'common/reducers/crmCustomers';
import Container from './container';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

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
    businessModels: PropTypes.array.isRequired,
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
        shipmt_order_mode: '',
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
    modelArray.forEach((item) => {
      if (item === 'transport') {
        subOrders.push({
          _mode: item,
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
      } else if (item === 'clearance') {
        subOrders.push({
          _mode: item,
          files: [],
          delgBills: [{
            decl_way_code: '',
            pack_count: 1,
            gross_wt: 0,
            ccb_need_exchange: 0,
            remark: '',
            package: '',
          }],
        });
      }
    });
    this.props.setClientForm(-1, { shipmt_order_mode: businessModel.model, subOrders });
  }
  handleChange = (key, value) => {
    this.props.setClientForm(-1, { [key]: value });
    if (key === 'cust_shipmt_is_container') {
      this.props.setClientForm(-1, { containers: [] });
    }
  }
  changeModelForm = (model) => {
    return model.replace(/transport/g, '运输').replace(/clearance/g, '清关');
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
            <FormItem label="业务类型" {...formItemLayout} required="true">
              <Select showSearch optionFilterProp="children"
                value={this.changeModelForm(formData.shipmt_order_mode)}
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
          <Col sm={8}>
            { formData.cust_shipmt_trans_mode === '2' &&
              <FormItem label="船名航次号" {...formItemLayout}>
                <Input value={formData.cust_shipmt_vessel_voy} onChange={e => this.handleChange('cust_shipmt_vessel_voy', e.target.value)} />
              </FormItem>
            }
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
            <FormItem label="提货单号" {...formItemLayout}>
              <Input value={formData.cust_shipmt_bill_lading_no} onChange={e => this.handleChange('cust_shipmt_bill_lading_no', e.target.value)} />
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
            <FormItem label="总件数" {...formItemLayout} required="true">
              <Input value={formData.cust_shipmt_pieces} onChange={e => this.handleChange('cust_shipmt_pieces', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="总毛重" {...formItemLayout} required="true">
              <Input value={formData.cust_shipmt_weight} onChange={e => this.handleChange('cust_shipmt_weight', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="总体积" {...formItemLayout}>
              <Input value={formData.cust_shipmt_volume} onChange={e => this.handleChange('cust_shipmt_volume', e.target.value)} />
            </FormItem>
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
            <FormItem label="装箱类型" {...formItemLayout} required="true">
              <Select value={formData.cust_shipmt_is_container} onChange={value => this.handleChange('cust_shipmt_is_container', value)}>
                <Option value="FCL">整箱</Option>
                <Option value="LCL">散货</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24}>
            {formData.cust_shipmt_is_container === 'FCL' && (
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

        </Row>
      </Card>
    );
  }
}
