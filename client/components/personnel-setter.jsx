import React, { PropTypes } from 'react';
import cx from '../../reusable/browser-util/classname-join';
import {Button, Form, Input, Row, Col} from '../../reusable/ant-ui';
const FormItem = Form.Item;

@Form.formify({
  mapPropsToFields(props) {
    return props.thisPersonnel;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.changeThisPersonnel(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class PersonnelSetter extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    thisPersonnel: PropTypes.object.isRequired,
    handlePersonnelSubmit: PropTypes.func.isRequired,
    changeThisPersonnel: PropTypes.func.isRequired,
    nonCancel: PropTypes.bool.isRequired,
    readonly: PropTypes.bool.isRequired,
    handleModalHide: PropTypes.func
  }
  static defaultProps = {
    readonly: false,
    nonCancel: false
  }
  handleSubmit(ev) {
    ev.preventDefault();
    this.props.formhoc.validate((errors, values) => {
      if (!errors) {
        this.props.handlePersonnelSubmit(values);
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel() {
    this.props.formhoc.reset();
    this.props.handleModalHide();
  }
  renderValidateStyle(item) {
    const {isFieldValidating, getFieldError, getFieldsValue} = this.props.formhoc;
    return cx({
      'error': getFieldError(item),
      'validating': isFieldValidating(item),
      'success': getFieldsValue([item])[item] && !getFieldError(item) && !isFieldValidating(item)
    });
  }
  renderTextInput(labelName, field, required, rules, fieldProps) {
    const {readonly, formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 8}} validateStatus={rules && this.renderValidateStyle(field)}
        help={ rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" disabled={readonly} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }

  render() {
    const {nonCancel, readonly} = this.props;
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
        { !nonCancel &&
          <div className="actions pull-right">
            <a className="icon" href="#" title="关闭" onClick={ () => this.props.handleModalHide() }><i className="s7-close-circle"></i></a>
          </div>
        }
          <h3>员工信息</h3>
        </div>
        <div className="panel-body">
          <Form horizontal>
            { this.renderTextInput('员工名称', 'name', true, [{required: true, message: '员工名不能为空'}]) }
            { this.renderTextInput('手机', 'phone', true, [{required: true, message: '手机号不能为空'}]) }
            { this.renderTextInput('部门', 'department') }
            { this.renderTextInput('职位', 'position') }
            { !readonly &&
              <Row>
                <Col span="2" offset="8">
                  <Button type="primary" htmlType="submit" onClick={ (ev) => this.handleSubmit(ev) }>确定</Button>
                </Col>
                { !nonCancel &&
                <Col span="2">
                  <Button type="primary" onClick={ () => this.handleCancel() }>取消</Button>
                </Col>
                }
              </Row>
            }
          </Form>
        </div>
      </div>
    );
  }
}
