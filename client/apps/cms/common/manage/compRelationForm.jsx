import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Input, Form, Row, Col, Select, message } from 'antd';
import { submitCompRelation } from 'common/reducers/cmsCompRelation';
import { RELATION_TYPES, I_E_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  (state) => {
    return {
      tenant_id: state.account.tenantId,
    };
  },
  { submitCompRelation })

class CompRelationForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleSubmit = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = { ...this.props.form.getFieldsValue() };
        formData.status = 1;
        formData.id = this.props.formData.id;
        formData.tenant_id = this.props.tenant_id;
        this.props.submitCompRelation(formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('保存成功', 5);
            this.handleNavigationTo('/import/manage');
          }
        });
      } else {
        this.forceUpdate();
        message.error('表单数据填写有误', 10);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.props.router.push({ pathname: to, query });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { form: { getFieldProps, getFieldError } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}
        help={rules && getFieldError(field)} hasFeedback required={required}
      >
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, { rules, ...fieldProps })} />
      </FormItem>
    );
  }
  render() {
    const { form: { getFieldProps }, formData, intl } = this.props;
    return (
      <div className="main-content">
        <Form horizontal>
          <Row>
            <Col lg={12} >
              {this.renderTextInput(
                this.msg('comp_code'), this.msg('comp_code_placeholder'), 'comp_code', true, [{
                  required: true,
                  message: this.msg('comp_code_placeholder'),
                  type: 'string',
                  min: 10,
                  max: 18,
                  whitespace: false,
                }], { transform: value => (value.trim()), initialValue: formData.comp_code }
              )}
            </Col>
          </Row>
          <Row>
            <Col lg={12} >
              {this.renderTextInput(
                this.msg('comp_name'), this.msg('comp_name_placeholder'), 'comp_name', true, [{
                  required: true,
                  message: this.msg('comp_name_placeholder'),
                  type: 'string',
                  whitespace: true,
                }], { transform: value => (value.trim()), initialValue: formData.comp_name }
              )}
            </Col>
          </Row>
          <Row>
            <Col lg={12} >
              <FormItem label={this.msg('relation_type')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} required="required">
                <Select key="relation_type" placeholder={this.msg('relation_type_placeholder')} defaultValue={formData.relation_type}
                  {...getFieldProps('relation_type', { initialValue: formData.relation_type,
                rules: [{
                  required: true,
                  message: this.msg('relation_type_placeholder'),
                  type: 'string',
                  whitespace: true,
                }],
              })}
                >
                {
                  RELATION_TYPES.map((item) => {
                    return (<Option value={item.key}>{item.value}</Option>);
                  })
                }
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col lg={12} >
              <FormItem label={this.msg('i_e_type')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} required="required">
                <Select key="i_e_type" placeholder={this.msg('i_e_type_placeholder')} defaultValue={formData.i_e_type}
                  {...getFieldProps('i_e_type', { initialValue: formData.i_e_type,
                rules: [{
                  required: true,
                  message: this.msg('i_e_type_placeholder'),
                  type: 'string',
                  whitespace: true,
                }],
              })}
                >
                {
                  I_E_TYPES.map((item) => {
                    return (<Option value={item.key}>{item.value}</Option>);
                  })
                }
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginTop: 50 }}>
            <Col span="21" offset="3">
              <FormItem wrapperCol={{ span: 16 }}>
                <Button type="primary" size="large" htmlType="submit"
                  onClick={this.handleSubmit}
                >
                {formatContainerMsg(intl, 'save')}
                </Button>
                <Button type="ghost" size="large" className="cancel" style={{ marginLeft: 50 }}
                  onClick={this.handleCancel}
                >
                {formatContainerMsg(intl, 'cancel')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default Form.create()(CompRelationForm);
