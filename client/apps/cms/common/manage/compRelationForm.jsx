import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Input, Form, Row, Col, Select, message } from 'ant-ui';
import { submitCompRelation } from 'common/reducers/cms';
import { ACCOUNT_STATUS, RELATION_TYPES } from 'common/constants';
const FormItem = Form.Item;
const Option = Select.Option;
@connect(
  () => ({
  }),
  { submitCompRelation })

class CompRelationForm extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleSubmit = (e) => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = {...this.props.form.getFieldsValue()};
        formData.status = ACCOUNT_STATUS.normal.id;
        this.props.submitCompRelation(formData).then(result => {
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
    const { form: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 16}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { form: { getFieldProps }, formData } = this.props;
    return (
      <div className="main-content">
        <Form horizontal>
          <Row>
            <Col lg={12} >
              {this.renderTextInput(
                '社会信用代码', '请填写社会信用代码', 'comp_code', true, [{
                  required: true,
                  message: '联系人姓名填写有误',
                  type: 'string',
                  length:18,
                  whitespace: false
                }], {transform: (value) => (value.trim()), initialValue: formData.comp_code}
              )}
            </Col>
          </Row>
          <Row>
            <Col lg={12} >
              {this.renderTextInput(
                '企业名称', '请填写企业名称', 'comp_name', true, [{
                  required: true,
                  message: '企业名称填写有误',
                  type: 'string',
                  whitespace: true
                }], {transform: (value) => (value.trim()), initialValue: formData.comp_name}
              )}
            </Col>
          </Row>
          <Row>
            <Col lg={12} >
              <FormItem label="关联单位类型" labelCol={{span: 6}} wrapperCol={{span: 16}} required="required">
                <Select key="relation_type" placeholder="请选择关联单位类型"
                {...getFieldProps('relation_type', { initialValue: formData.relation_type,
                rules: [{
                  required: true,
                  message: '关联单位类型填写有误',
                  type: 'string',
                  whitespace: true
                }]
              })}>
                {
                  RELATION_TYPES.map((item) => {
                    return (<Option value={item.key}>{item.value}</Option>);
                  })
                }
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row style={{marginTop:50}}>
            <Col span="21" offset="3">
              <FormItem wrapperCol={{ span: 16 }}>
                <Button type="primary" size="large" htmlType="submit"
                 onClick={this.handleSubmit}
                >
                保存
                </Button>
                <Button type="ghost" size="large" className="cancel" style={{ marginLeft:50 }}
                  onClick={this.handleCancel}
                >
                取消
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
