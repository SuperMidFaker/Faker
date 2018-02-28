import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Select, Input, Col, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateArCtmApp } from 'common/reducers/hubIntegration';
import { loadPartners } from 'common/reducers/partner';
import { loadPartnerFlowList } from 'common/reducers/scofFlow';
import { uuidWithoutDash } from 'client/common/uuid';
import { PARTNER_ROLES } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const ButtonGroup = Button.Group;

const OpenapiHost = API_ROOTS.openapi;

@injectIntl
@connect(
  state => ({
    app: state.hubIntegration.arctm,
    flows: state.scofFlow.partnerFlows,
    partners: state.partner.partners,
  }),
  { updateArCtmApp, loadPartners, loadPartnerFlowList }
)
@Form.create()
export default class ParamsForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    formData: PropTypes.shape({ customer_partner_id: PropTypes.number }),
    partners: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })),
  }
  componentDidMount() {
    this.props.loadPartners({ role: PARTNER_ROLES.CUS });
    const customerPartnerId = this.props.formData.customer_partner_id;
    if (customerPartnerId) {
      this.props.loadPartnerFlowList({ partnerId: customerPartnerId });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCustomerChange = (customerPartnerId) => {
    this.props.loadPartnerFlowList({ partnerId: customerPartnerId });
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      const customer = this.props.partners.filter(pt => pt.id === values.customer_partner_id)[0];
      const arctm = {
        customer_partner_id: values.customer_partner_id,
        customer_tenant_id: customer && customer.partner_tenant_id,
        customer_name: customer && customer.name,
        user: values.username,
        password: values.password,
        webservice_url: values.webservice_url,
        flow_id: values.flow_id,
        uuid: values.uuid,
      };
      this.props.updateArCtmApp(arctm).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.success('保存成功');
        }
      });
    });
  }
  handleGenUuid = () => {
    if (!this.props.formData.uuid) {
      const uuid = uuidWithoutDash();
      this.props.form.setFieldsValue({ uuid, hook_url: `${OpenapiHost}ar/hook/${uuid}` });
    }
  }
  render() {
    const {
      partners, flows, formData, form: { getFieldDecorator },
    } = this.props;
    return (
      <Form>
        <Row gutter={16}>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('customerNo')}>
              {getFieldDecorator('customer_partner_id', {
                rules: [{ required: true, message: 'CTM客户必填' }],
                initialValue: formData.customer_partner_id,
              })(<Select optionFilterProp="children" placeholder="选择客户" onChange={this.handleCustomerChange}>
                {partners.map(pt => (<Option key={String(pt.id)} value={pt.id}>
                  {pt.partner_code}|{pt.name}
                </Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem label="订单流程参数">
              {getFieldDecorator('flow_id', {
                rules: [{ required: true, message: '客户流程必填' }],
                initialValue: formData.flow_id,
              })(<Select showSearch allowClear>
                {flows.map(data => <Option key={data.id} value={data.id}>{data.name}</Option>)}
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('username')}>
              {getFieldDecorator('username', {
                initialValue: formData.user,
                rules: [{ required: true, message: '用户名必填' }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('password')}>
              {getFieldDecorator('password', {
                initialValue: formData.password,
                rules: [{ required: true, message: '密码必填' }],
              })(<Input />)}
            </FormItem>
          </Col>
          {getFieldDecorator('uuid', { initialValue: formData.uuid })}
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('hookUrl')} >
              {getFieldDecorator('hook_url', {
                rules: [{ required: true, message: '输入接口地址需要生成' }],
                initialValue: formData.uuid && `${OpenapiHost}ar/hook/${formData.uuid}`,
              })(<Input
                addonAfter={
                  <ButtonGroup size="small">
                    <Button disabled={this.props.form.getFieldValue('uuid')} icon="tag" onClick={this.handleGenUuid} />
                    <Button icon="copy" />
                  </ButtonGroup>
                }
                readOnly
              />)
                  }
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('webserviceUrl')} >
              {getFieldDecorator('webservice_url', {
                rules: [{ required: true, message: 'webservice url必填' }],
                initialValue: formData.webservice_url,
              })(<Input placeholder="https:/stage.easytms.net/webservice/InboundWebService.aspx" />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem>
              <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
