import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  Button,
  Form,
  Select,
  Input,
  Row,
  Col,
  Switch,
  message,
  Tabs,
  InputNumber,
  DatePicker
} from
'ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import {isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue} from
'../../../../universal/redux/reducers/task';
import {setNavTitle} from '../../../../universal/redux/reducers/navbar';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
// const Option = Select.Option;
const OptGroup = Select.OptGroup;
const ButtonGroup = Button.Group;

function fetchData({state, dispatch, cookie, params}) {
  const pid = parseInt(params.id, 10);
  const promises = [];
  /* promises.push(dispatch(loadSelectOptions(cookie, {
    delId: params.id,
    tenantId: state.account.tenantId
  })));
  */
  if (pid) {
    if (!isFormDataLoaded(state.task, pid)) {
      promises.push(dispatch(loadForm(cookie, pid)));
    } else {
      promises.push(dispatch(assignForm(state.task, pid)));
    }
  } else {
    promises.push(dispatch(clearForm()));
  }

  return Promise.all(promises);
}

function goBack(router) {
  router.goBack();
}

@connectFetch()(fetchData)
@connect(state => ({formData: state.importdelegate.formData, code: state.account.code, username: state.account.username, loginId: state.account.loginId, tenantId: state.account.tenantId}), {setFormValue})
@connectNav((props, dispatch, router) => {
  if (props.formData.key === -1) {
    return;
  }
  const isCreating = (props.formData.key === undefined || props.formData.key === null);
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating
      ? '录入报关清单'
      : '报关清单详情',
    moduleName: '',
    goBackFn: () => goBack(router),
    withModuleLayout: false
  }));
})
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.setFormValue(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class InputBillEdit extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      goBack(this.context.router);
    }
  }
  handleSubmit(ev) {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        if (this.props.formData.key) {
          this.props.edit(this.props.formData, JSON.stringify({username: this.props.username, tenantId: this.props.tenantId, loginId: this.props.loginId})).then(result => {
            this.onSubmitReturn(result.error);
          });
        } else {
          this.props.submit(this.props.formData, JSON.stringify({username: this.props.username, tenantId: this.props.tenantId, loginId: this.props.loginId})).then(result => {
            this.onSubmitReturn(result.error);
          });
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel() {
    goBack(this.context.router);
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, disabled = false, type = 'text') {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 6
      }} wrapperCol={{
        span: 18
      }} help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} disabled={disabled} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})}/>
      </FormItem>
    );
  }
  renderTextInput2(spanWidth, labelName, placeholder, field, required, rules, fieldProps, disabled = false, type = 'text') {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 24 - spanWidth
      }} wrapperCol={{
        span: spanWidth
      }} help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} disabled={disabled} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})}/>
      </FormItem>
    );
  }
  renderTextInputWithoutName(field, disabled = false, type = 'text') {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem wrapperCol={{
        span: 24
      }} help={getFieldError(field)} hasFeedback>
        <Input type={type} disabled={disabled} {...getFieldProps(field, {})}/>
      </FormItem>
    );
  }
  renderTextInput1(labelName, placeholder, field, required, rules, fieldProps, disabled = false, type = 'text') {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 12
      }} wrapperCol={{
        span: 12
      }} help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} disabled={disabled} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})}/>
      </FormItem>
    );
  }
  renderSwitch(labelName, field) {
    const {formhoc: {
        getFieldProps
      }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 6
      }} wrapperCol={{
        span: 18
      }}>
        <Switch checked={this.props.formData[field] === 1 || this.props.formData[field] === true} onChange={(value) => this.setState(JSON.parse(`{"${field}":"${value}"}`))} {...getFieldProps(field, {})}/>
      </FormItem>
    );
  }
  renderNumber(labelName, field, defalutValue = 0, min = 0, max = 99999999) {
    const {formhoc: {
        getFieldProps
      }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 6
      }} wrapperCol={{
        span: 18
      }}>
        <InputNumber style={{
          width: '100%'
        }} min={min} max={max} defaultValue={defalutValue} {...getFieldProps(field, {})}/>
      </FormItem>
    );
  }
  renderNumber1(labelName, field, defalutValue = 0, min = 0, max = 99999999) {
    const {formhoc: {
        getFieldProps
      }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 12
      }} wrapperCol={{
        span: 12
      }}>
        <InputNumber min={min} max={max} defaultValue={defalutValue} {...getFieldProps(field, {})}/>
      </FormItem>
    );
  }
  renderNumberWithoutName(field, defalutValue = 0, min = 0, max = 99999999) {
    const {formhoc: {
        getFieldProps
      }} = this.props;
    return (
      <FormItem wrapperCol={{
        span: 24
      }}>
        <InputNumber min={min} max={max} defaultValue={defalutValue} {...getFieldProps(field)}/>
      </FormItem>
    );
  }
  renderSelect(labelName, placeholder, field, required, source, rules, disabled = false) {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 6
      }} wrapperCol={{
        span: 18
      }} help={rules && getFieldError(field)} hasFeedback required={required}>
        <Select style={{
          width: '100%'
        }} placeholder={placeholder} disabled={disabled} onChange={(value) => this.setState(JSON.parse(`{"${field}":"${value}"}`))} {...getFieldProps(field, {rules})}>
          <OptGroup label={placeholder}/>
        </Select>
      </FormItem>
    );
  }
  renderSelect1(labelName, placeholder, field, required, source, rules, disabled = false) {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 12
      }} wrapperCol={{
        span: 12
      }} help={rules && getFieldError(field)} hasFeedback required={required}>
        <Select style={{
          width: '100%'
        }} placeholder={placeholder} disabled={disabled} onChange={(value) => this.setState(JSON.parse(`{"${field}":"${value}"}`))} {...getFieldProps(field, {rules})}>
          <OptGroup label={placeholder}/>
        </Select>
      </FormItem>
    );
  }
  renderDatePicker(labelName, field, disabled = false) {
    const {formhoc: {
        getFieldProps
      }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{
        span: 6
      }} wrapperCol={{
        span: 18
      }} hasFeedback>
        <DatePicker disabled={disabled} {...getFieldProps(field)}/>
      </FormItem>
    );
  }
  renderSelectWithoutName(field, source, disabled = false) {
    const {
      formhoc: {
        getFieldProps,
        getFieldError
      }
    } = this.props;
    return (
      <FormItem wrapperCol={{
        span: 24
      }} help={getFieldError(field)} hasFeedback>
        <Select style={{
          width: '100%'
        }} disabled={disabled} onChange={(value) => this.setState(JSON.parse(`{"${field}":"${value}"}`))} {...getFieldProps(field, {})}>
          <OptGroup/>
        </Select>
      </FormItem>
    );
  }
  renderEditForm() {
    const {formhoc} = this.props;
    return (
      <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc} className="form-edit-content">
        <Row>
          <Col span="6">
            {this.renderSelect('方案模板', '选择方案模板', '', false, null, [
              {
                required: false
              }
            ])}
            {this.renderSelect('进口口岸', '选择进口口岸', 'i_e_port', false, null, [
              {
                required: false
              }
            ])}
            {this.renderSelect('经营单位', '选择经营单位', 'trade_co', true, null, [
              {
                required: true,
                message: '请选择经营单位'
              }
            ])}
            {this.renderSelect('收货单位', '选择收货单位', 'owner_code', false, null, [
              {
                required: false
              }
            ])}

            {this.renderTextInput('许可证号', '输入许可证号', 'license_no', false, [
              {
                required: false
              }
            ], null)}
            <Row>
              <Col span="12">
                {this.renderTextInput1('批准文号', '', 'appr_no', false, [
                  {
                    required: false
                  }
                ], null)}
              </Col>
              <Col span="12">
                {this.renderSelect1('成交方式', '', 'trans_mode', false, null, [
                  {
                    required: false
                  }
                ])}
              </Col>
            </Row>
            {this.renderTextInput('合同协议号', '输入合同协议号', 'contr_no', false, [
              {
                required: false
              }
            ], null)}
          </Col>
          <Col span="6">
            {this.renderTextInput('预录入编号', '输入预录入编号', 'pre_entry_id', false, [
              {
                required: false
              }
            ], null)}
            {this.renderSelect('备案号', '选择备案号', 'ems_no', true, null, [
              {
                required: true,
                message: '请选择备案号'
              }
            ])}
            {this.renderSelect('运输方式', '选择运输方式', 'traf_mode', false, null, [
              {
                required: false
              }
            ])}
            {this.renderSelect('贸易方式', '选择贸易方式', 'trade_mode', true, null, [
              {
                required: true,
                message: '请选择贸易方式'
              }
            ])}
            {this.renderSelect('起运国', '选择起运国', 'trade_country', false, null, [
              {
                required: false
              }
            ])}
            <Row>
              <Col span="12">
                {this.renderSelect1('运费', '', 'fee_mark', false, null, [
                  {
                    required: false
                  }
                ])}
              </Col>
              <Col span="6">
                {this.renderNumberWithoutName('fee_rate')}
              </Col>
              <Col span="6">
                {this.renderSelectWithoutName('fee_curr', null)}
              </Col>
            </Row>
            <Row>
              <Col span="12">
                {this.renderNumber1('件数', 'pack_no')}
              </Col>
              <Col span="12">
                {this.renderSelect1('包装种类', '', 'wrap_type', false, null, [
                  {
                    required: false
                  }
                ])}
              </Col>
            </Row>
          </Col>
          <Col span="6">
            {this.renderSelect('申报地海关', '选择申报地海关', 'master_customs', false, null, [
              {
                required: false
              }
            ])}
            {this.renderDatePicker('进口日期', 'i_e_date')}

            {this.renderTextInput('运输工具名称', '输入运输工具名称', 'traf_name', false, [
              {
                required: false
              }
            ], null)}
            {this.renderSelect('征免性质', '选择征免性质', 'cut_mode', false, null, [
              {
                required: false
              }
            ])}
            {this.renderSelect('装货港', '选择装货港', 'distinate_port', false, null, [
              {
                required: false
              }
            ])}
            <Row>
              <Col span="12">
                {this.renderSelect1('保费', '', 'insur_mark', false, null, [
                  {
                    required: false
                  }
                ])}
              </Col>
              <Col span="6">
                {this.renderNumberWithoutName('insur_rate')}
              </Col>
              <Col span="6">
                {this.renderSelectWithoutName('insur_curr', null)}
              </Col>
            </Row>
            {this.renderNumber('毛重(千克)', 'gross_wt')}
          </Col>
          <Col span="6">
            {this.renderTextInput('海关编号', '输入海关编号', 'entry_id', false, [
              {
                required: false
              }
            ], null)}
            {this.renderDatePicker('申报日期', 'd_date')}
            {this.renderTextInput('提运单号', '输入提运单号', 'bill_no', false, [
              {
                required: false
              }
            ], null)}
            {this.renderNumber('征免比例', 'in_ratio')}
            {this.renderSelect('境内目的地', '选择境内目的地', 'district_code', false, null, [
              {
                required: false
              }
            ])}
            <Row>
              <Col span="12">
                {this.renderSelect1('杂费', '', 'other_mark', false, null, [
                  {
                    required: false
                  }
                ])}
              </Col>
              <Col span="6">
                {this.renderNumberWithoutName('other_rate')}
              </Col>
              <Col span="6">
                {this.renderSelectWithoutName('other_curr', null)}
              </Col>
            </Row>
            {this.renderNumber('净重(千克)', 'net_wt')}
          </Col>
        </Row>
        <Row>
          <Col span="6">
            {this.renderTextInput('集装箱号', '输入集装箱号', 'jzxsl', false, [
              {
                required: false
              }
            ], null)}
          </Col>
          <Col span="12">
            {this.renderTextInput2(21, '随附单证', '输入随附单证', 'cert_mark', false, [
              {
                required: false
              }
            ], null)}
          </Col>
          <Col span="6">
            {this.renderSelect('用途', '选择用途', 'use_to', false, null, [
              {
                required: false
              }
            ])}
          </Col>
        </Row>
        <Row>
          <Col span="18">
            {this.renderTextInput2(22, '唛码备注', '输入唛码备注', 'note', false, [
              {
                required: false
              }
            ], null)}
          </Col>

          <Col span="6">
            {this.renderTextInput('航次号', '输入航次号', 'voyage_no', false, [
              {
                required: false
              }
            ], null)}
          </Col>
        </Row>
        <Row>
          <Col span="6">
            {this.renderSelect('申报单位', '选择申报单位', 'agent_code', false, null, [
              {
                required: false
              }
            ])}
          </Col>
          <Col span="6">
            {this.renderTextInput('库号', '输入库号', 'library_no', false, [
              {
                required: false
              }
            ], null)}
          </Col>
          <Col span="6">
            {this.renderTextInput('货场代码', '输入货场代码', 'prdtid', false, [
              {
                required: false
              }
            ], null)}
          </Col>
          <Col span="6">
            {this.renderTextInput('监管仓号', '输入监管仓号', 'storeno', false, [
              {
                required: false
              }
            ], null)}
          </Col>
        </Row>
        <Row>
          <Col span="12">
            {this.renderTextInput2(21, '关联报关单', '输入关联报关单', 'ramanualno', false, [
              {
                required: false
              }
            ], null)}
          </Col>
          <Col span="12">
            {this.renderTextInput2(21, '关联备案号', '输入关联备案号', 'radeclno', false, [
              {
                required: false
              }
            ], null)}
          </Col>
        </Row>
        <Row>
          <Col span="6">
            {this.renderNumber('总金额')}
          </Col>
        </Row>
        <Row style={{
          display: this.props.formData.status === 3
            ? 'hide'
            : 'inline-block'
        }}>
          <Col span="12">
            <Button htmlType="submit" type="primary">保存</Button>
            <Button>生成报关单</Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </Col>
          <Col span="12">
            <ButtonGroup className="pull-right">
              <Button>报关清单表体</Button>
              <Button>集装箱</Button>
              <Button>随附单证</Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Form>
    );
  }
  render() {
    return (
      <div className="main-content">
        <div className="page-body">

          <Tabs defaultActiveKey="tab1">
            <TabPane tab="清单信息" key="tab1">
              {this.renderEditForm()}
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}
