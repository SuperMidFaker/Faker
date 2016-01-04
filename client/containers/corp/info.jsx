import React, { PropTypes } from 'react';
import { AntIcon, Button, Form, Input, Radio, Row, Col, Datepicker, Select, Checkbox, Switch } from '../../reusable/ant-ui';
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@Form.formify({
  mapPropsToFields(props) {
    return props.thisCorp;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.changeThisCorpValue(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class CorpInfo extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    thisCorp: PropTypes.object.isRequired,
    handleCorpSubmit: PropTypes.func.isRequired,
    changeThisCorpValue: PropTypes.func.isRequired,
    uploadCorpPics: PropTypes.func.isRequired,
    nonCancel: PropTypes.bool.isRequired,
    readonly: PropTypes.bool.isRequired,
    adminView: PropTypes.bool.isRequired,
    handleModalHide: PropTypes.func
  }
  render() {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <div className="page-panel">
        <div className="panel-heading">
          <h3>企业信息</h3>
        </div>
        <div className="panel-body">
          <Form horizontal>
            <FormItem label="公司类型" labelCol={{span: 6}} wrapperCol={{span: 8}} validateStatus={this.renderValidateStyle('type')}
              help={getFieldError('type')} hasFeedback required>
              <RadioGroup disabled={readonly} {...getFieldProps('type', {rules:[{type: 'number', required: true, message: '请选择公司类型'}],
                transform: toNumber})}>
                <Radio value={1}>企业主</Radio>
                <Radio value={2}>服务商</Radio>
              </RadioGroup>
            </FormItem>
          </Form>
        </div>
        <div className="bottom-fixed-row">
          <Row>
            <Col span="2" offset="8">
              <Button size="large" type="primary" htmlType="submit" onClick={ () => this.handleSubmit() }>确定</Button>
            </Col>
            <Col span="2">
              <Button onClick={ () => this.handleCancel() }>返回</Button>
            </Col>
          </Row>
        </div>
      </div>);
  }
}
