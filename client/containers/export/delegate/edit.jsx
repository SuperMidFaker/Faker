import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Switch, message, Select, Tabs, Row, Col } from
'ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue, edit, submit, loadSelectOptions, uploadFiles } from
'../../../../universal/redux/reducers/delegate';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { TENANT_USEBOOK, TENANT_LEVEL } from '../../../../universal/constants';
const Option = Select.Option;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const OptGroup = Select.OptGroup;
const Dropzone = require('react-dropzone');

function fetchData({state, dispatch, cookie, params}) {
  const pid = parseInt(params.id, 10);
  const promises = [];
   promises.push(dispatch(loadSelectOptions(cookie)));
  if (pid) {
    if (!isFormDataLoaded(state.delegate, pid)) {
      promises.push(dispatch(loadForm(cookie, pid)));
    } else {
      promises.push(dispatch(assignForm(state.delegate, pid)));
    }
  } else {
    promises.push(dispatch(clearForm()));
  }
}

function goBack(props) {
  props.history.goBack();
}

@connectFetch()(fetchData)
@connect(
  state => ({
    selectedIndex: state.delegate.selectedIndex,
    formData: state.delegate.formData,
    code: state.account.code,
    tenant: state.delegate.tenant,
    customs_code: state.delegate.customs_code,
    selectOptions: state.delegate.selectOptions
  }),
  { setFormValue, edit, submit, uploadFiles })
@connectNav((props, dispatch) => {
  if (props.formData.key === -1) {
    return;
  }
  const isCreating = props.formData.key === null;
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating ? '新增业务单' : `业务单详情`,
    moduleName: '',
    goBackFn: () => goBack(props),
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
export default class CorpEdit extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    tenant: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    selectOptions: PropTypes.object.isRequired,
    uploadFiles: PropTypes.func.isRequired
  }
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      goBack(this.props);
    }
  }
  handleSubmit() {
    this.props.formhoc.validateFields((errors) => {
        if (!errors) {
            if (this.props.formData.key) {
            this.props.edit(this.props.formData).then((result) => {
            if (result.error) {
                message.error(result.error.message, 10);
            } else {
                message.info('更新成功', 5);
                this.handleCancel();
            }
            });
        } else {
          this.props.submit(this.props.formData, this.props.tenant).then(result => {
            this.onSubmitReturn(result.error);
            });
           }
        } else {
            this.forceUpdate();
            message.error('表单检验存在错误', 10);
          }
    });
  }
  handleCancel() {
    goBack(this.props);
  }
  renderSelect(labelName, placeholder, field, required, source, rules) {
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
        }} placeholder={placeholder} onChange={(value) => this.setState(JSON.parse(`{"${field}":"${value}"}`))} {...getFieldProps(field, {})}>
          <OptGroup label={placeholder}>
            {source.map((item) => (
              <Option value={item.value} key={item.value}>{item.text}</Option>
            ))
            }
          </OptGroup>
        </Select>
      </FormItem>
    );
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
  renderBasicForm() {
      const {
      selectOptions: {
        customsInfoList,
        declareWayList,
        tradeModeList
      }
    } = this.props;
    // todo loginname no '@' change adapt and tranform logic with new rc-form
    return (
      <div className="main-content">
        <div className="page-header">
        </div>
        <div className="page-body">
          <Form horizontal onSubmit={ this.handleSubmit } className="form-edit-content">
          <Row>
              <Col span="8">
                {this.renderSelect('清关海关', '选择清关海关', 'master_customs', true, customsInfoList, [
                  {
                  required: true
                  }
                ])}
                 {this.renderTextInput('提运单号', '请输提运单号', 'bill_no', true, [
                  {
                  required: true,
                  message: '提运单号不能为空'
                  }
                ])}
                 </Col>
              <Col span="8">
                {this.renderSelect('报关类型', '选择报关类型', 'declare_way_no', true, declareWayList, [
                  {
                  required: true
                  }
                ])}
              </Col>
           </Row>
              <Row>
                    <Col span="8">
                        {this.props.formData.usebook !== TENANT_USEBOOK.owner.name &&
                        <FormItem label="是否使用手册:" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                        <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                            onChange={(checked) => this.props.setFormValue('usebook',
                                                checked ? TENANT_USEBOOK.manager.name : TENANT_USEBOOK.member.name)}
                            checked={this.props.formData.usebook && this.props.formData.usebook === TENANT_USEBOOK.manager.name}/>
                        </FormItem>}
                         {this.renderTextInput('发票号码', '请输入发票号码', 'invoice_no', false, null, null)}
                        {this.props.formData.urgent !== TENANT_USEBOOK.owner.name &&
                            <FormItem label="是否加急:" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                            <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                                onChange={(checked) => this.props.setFormValue('urgent',
                                                    checked ? TENANT_USEBOOK.manager.name : TENANT_USEBOOK.member.name)}
                                checked={this.props.formData.urgent && this.props.formData.urgent === TENANT_USEBOOK.manager.name}/>
                            </FormItem>}
                    </Col>
                    <Col span="8">
                        {this.renderTextInput('备案号', '', 'ems_no', false, null, null, true)}
                        {this.renderSelect('贸易方式', '选择贸易方式', 'trade_mode', false, tradeModeList, null)}
                        {this.renderTextInput('其他要求', '', 'other_note', false, null, null, false, 'textarea')}
                    </Col>
                </Row>
              <Row>
              <Col span="8">
                <FormItem labelCol={{
                span: 6
                }} label="报关单据">
                  <Row>
                    <Col span="6">
                      <Dropzone onDrop={(files) => this.props.uploadFiles('declare_file', files)} style={{}}>
                        <div className="ant-upload ant-upload-drag" title="请拖拽或选择文件来改变" style={{
                        height: 80,
                        marginTop: 20
                        }}>
                          <span>
                            <div className="ant-upload-drag-container">
                              <Icon type="upload"/>
                              <p className="ant-upload-hint">选择文件</p>
                            </div>
                          </span>
                        </div>
                      </Dropzone>
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </div>);
  }
    renderEnterpriseForm() {
    return (
      <div className="body-responsive">
      </div>);
  }
    render() {
    return (
      <div className="main-content">
        <div className="page-header">
        </div>
        <div className="page-body">
          <Tabs defaultActiveKey="tab1">
            <TabPane tab="业务单" key="tab1">{this.renderBasicForm()}</TabPane>
            <TabPane tab="操作日志" key="tab2">{this.props.formData.level === TENANT_LEVEL.ENTERPRISE && this.renderEnterpriseForm()}</TabPane>
          </Tabs>
        </div>
        <div className="bottom-fixed-row">
          <Button type="primary" size="large" htmlType="submit" onClick={ () => this.handleSubmit() }>保存</Button>
          <Button size="large" type="primary" onClick={ this.handleCancel }>取消</Button>
        </div>
      </div>);
  }
}
