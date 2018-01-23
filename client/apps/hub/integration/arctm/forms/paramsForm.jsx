import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Select, Input, Col, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateArCtmApp } from 'common/reducers/hubIntegration';
import { uuidWithoutDash } from 'client/common/uuid';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const ButtonGroup = Button.Group;

@injectIntl
@connect(
  state => ({
    app: state.hubIntegration.arctm,
  }),
  { updateArCtmApp }
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
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      const arctm = {
        user: values.username,
        password: values.password,
        webservice_url: values.webservice_url,
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
      this.props.form.setFieldsValue({ uuid, hook_url: `https://openapi.welogix.cn/ar/hook/${uuid}` });
    }
  }
  render() {
    const { partners, formData, form: { getFieldDecorator } } = this.props;
    return (
      <Form>
        <Row gutter={16}>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('customerNo')}>
              {getFieldDecorator('customer_partner_id', {
                rules: [{ required: true, message: 'CTM客户必填' }],
                initialValue: formData.customer_partner_id,
              })(<Select optionFilterProp="search" placeholder="选择客户">
                {
                      partners.map(pt => (
                        <Option key={pt.code} value={pt.id} search={`${pt.code}${pt.name}`}>
                          {pt.code}|{pt.name}
                        </Option>))
                    }
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
                initialValue: formData.uuid && `https://openapi.welogix.cn/ar/hook/${formData.uuid}`,
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
