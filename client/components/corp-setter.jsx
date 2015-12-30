import React, { PropTypes } from 'react';
import cx from '../../reusable/browser-util/classname-join';
import { toNumber } from '../../reusable/common/transformer';
import { corpStatusDesc } from '../../universal/constants';
import { AntIcon, Button, Form, Input, Radio, Row, Col, Datepicker, Select, Checkbox, Switch } from '../../reusable/ant-ui';

const Dropzone = require('react-dropzone');
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
export default class CorpSetter extends React.Component {
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
  static defaultProps = {
    adminView: false,
    readonly: false,
    nonCancel: false
  }
  handleSubmit() {
    this.props.formhoc.validate((errors, values) => {
      if (!errors) {
        this.props.handleCorpSubmit(values);
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
  renderVerifyPicFormgroup(labelName, imgField, verifyField) {
    const dropzonestyle = {
      borderWidth: 2,
      borderColor: 'black',
      borderStyle: 'dashed',
      borderRadius: 4,
      margin: 30,
      padding: 30,
      width: 200,
      transition: 'all 0.5s'
    };
    const {readonly, adminView, thisCorp, uploadCorpPics, formhoc: {getFieldProps}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}>
        { !readonly &&
        <Col span="5">
          <Dropzone onDrop={ (files) => uploadCorpPics(imgField, files) } style={dropzonestyle}>
            <div>{ thisCorp[imgField] ? '如需更改,' : '' }请拖拽或选择证书图片</div>
          </Dropzone>
        </Col>
        }
        { thisCorp[imgField] &&
        <div>
          <Col span="4">
            <img className="drop-img" src={thisCorp[imgField]}/>
          </Col>
          <Col span="6">
            <Switch disabled={!adminView} name={verifyField} checkedChildren={<AntIcon type="check" />}
              unCheckedChildren={<AntIcon type="cross" />} {...getFieldProps(verifyField, {valuePropName: 'checked'})} />
          </Col>
        </div>
        }
      </FormItem>
    );
  }
  render() {
    const {nonCancel, adminView, readonly, formhoc: {getFieldProps, getFieldError}} = this.props;
    // todo email sso_corps sso_account insert/read
    return (
      <div className="panel-corp-setting panel panel-default">
        <div className="panel-heading">
          <h3>企业信息</h3>
        </div>
        <div className="panel-body">
          <Form horizontal>
            { this.renderTextInput('公司名称', 'name', true, [{required: true, message: '公司名不能为空'}]) }
            { this.renderTextInput('公司代号', 'code', true, [{required: true, message: '公司代号不能为空'}]) }
            { this.renderTextInput('移动电话', 'mobile', true, [{required: true, message: '移动号码不能为空'}]) }
            <FormItem label="公司类型" labelCol={{span: 6}} wrapperCol={{span: 8}} validateStatus={this.renderValidateStyle('type')}
              help={getFieldError('type')} hasFeedback required>
              <RadioGroup disabled={readonly} {...getFieldProps('type', {rules:[{type: 'number', required: true, message: '请选择公司类型'}],
                transform: toNumber})}>
                <Radio value={1}>企业主</Radio>
                <Radio value={2}>服务商</Radio>
              </RadioGroup>
            </FormItem>
            { this.renderTextInput('座机', 'telephone') }
            { this.renderTextInput('省', 'province') }
            { this.renderTextInput('市', 'city') }
            { this.renderTextInput('区', 'district') }
            { this.renderTextInput('详细地址', 'address') }
            <FormItem label="成立时间" labelCol={{span: 6}} wrapperCol={{span: 3}}>
              <Datepicker.MonthPicker format="yyyy-MM" disabled={readonly} {...getFieldProps('foundation', {initialValue: null})} />
            </FormItem>
            { adminView &&
            <FormItem label="帐户状态" labelCol={{span: 6}} wrapperCol={{span: 8}}>
              <Select disabled={readonly} {...getFieldProps('status')} style={{width: 120}}>
                <Option value="paid">{ corpStatusDesc.paid }</Option>
                <Option value="free">{ corpStatusDesc.free }</Option>
              </Select>
            </FormItem>
            }
            {/* adminView &&
            <FormItem label="开通服务" labelCol={{span: 6}} wrapperCol={{span: 8}}>
              <label className="ant-checkbox-inline">
                <Checkbox disabled={readonly} {...getFieldProps('che', {
                  valuePropName: 'checked', adapt: (value)=> (!!value)})} />
                云管车
              </label>
              <label className="ant-checkbox-inline">
                <Checkbox disabled={readonly} {...getFieldProps('tms', {
                  valuePropName: 'checked', adapt: (value)=> (!!value)})} />
                WeTMS
              </label>
              <label className="ant-checkbox-inline">
                <Checkbox disabled={readonly} {...getFieldProps('app', {
                  valuePropName: 'checked', adapt: (value)=> (!!value)})} />
                AppBuilder
              </label>
            </FormItem>
            */}
            { this.renderVerifyPicFormgroup('公司账户持有人身份证', 'owner_idcard_pic', 'owner_idcard_verified') }
            { this.renderVerifyPicFormgroup('公司营业执照', 'business_licence_pic', 'business_licence_verified') }
            { this.renderVerifyPicFormgroup('道路运输许可证', 'transport_licence_pic', 'transport_licence_verified') }
            { this.renderVerifyPicFormgroup('公司授权书', 'auth_pic', 'auth_verified') }
          </Form>
        </div>
        { !readonly &&
        <div className="bottom-fixed-row">
          <Row>
            <Col span="2" offset="8">
              <Button size="large" type="primary" htmlType="submit" onClick={ () => this.handleSubmit() }>确定</Button>
            </Col>
            { !nonCancel &&
            <Col span="2">
              <Button onClick={ () => this.handleCancel() }>返回</Button>
            </Col>
            }
          </Row>
        </div>
        }
      </div>
    );
  }
}
