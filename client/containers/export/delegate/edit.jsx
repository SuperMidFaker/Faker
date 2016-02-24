import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { renderValidateStyle } from '../../../../reusable/browser-util/react-ant';
import { AntIcon as Icon, Button, Form, Input, Row, Col, Switch, message,Select,Tabs } from
'../../../../reusable/ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue, edit, submit,loadMaster_CustomsMaster } from
'../../../../universal/redux/reducers/delegate';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { isLoginNameExist, checkLoginName } from
'../../../../reusable/domains/redux/checker-reducer';
import { validatePhone } from '../../../../reusable/common/validater';
import { TENANT_USEBOOK,TENANT_LEVEL } from '../../../../universal/constants';
const Option = Select.Option;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

function fetchData({state, dispatch, cookie, params}) {
  const pid = parseInt(params.id, 10);
  if (pid) {
    if (!isFormDataLoaded(state.delegate, pid)) {
      return dispatch(loadForm(cookie, pid));
    } else {
      return dispatch(assignForm(state.delegate, pid));
    }
  } else {
    return dispatch(clearForm());
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
    customs_code: state.delegate.customs_code
  }),
  { setFormValue, edit, submit, checkLoginName })
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
    checkLoginName: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired
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
    this.props.formhoc.validate((errors) => {
      if (!errors) {
        this.props.edit(this.props.formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('更新成功', 5);
            this.handleCancel();
          }
        });
      } else {
        this.forceUpdate();
        message.error('表单检验存在错误', 10);
      }
    });
  }
  handleCancel() {
    goBack(this.props);
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, type = 'text') {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  renderBasicForm() {
    const {formhoc: {getFieldProps, getFieldError}, code} = this.props;
    const isCreating = this.props.formData.key === null;
    // todo loginname no '@' change adapt and tranform logic with new rc-form
    return (
      <div className="main-content">
        <div className="page-header">
        </div>
        <div className="page-body">
          <Form horizontal onSubmit={ this.handleSubmit } className="form-edit-content">
          <table  width="800"  border="1" cellpadding="1" cellspacing="1" bordercolor="#0000FF">
            <tr>
                <td><label>单号</label></td>
                <td><label value='del_no'>2</label></td>
            </tr>
            <tr>
              <td width="400" height="35"> 
                <FormItem label="清关海关:" labelCol={{span: 6}} wrapperCol={{span: 16}}>
                    <Select defaultValue="lucy" style={{width:'100%'}} {...getFieldProps('master_customs')}>
                        <Option value="2200">2200</Option>
                    </Select>
                </FormItem>
             </td>
             <td width="400" height="35"> 
                <FormItem label="报关类型:" labelCol={{span: 6}} wrapperCol={{span: 16}}>
                    <Select defaultValue="lucy" style={{width:'100%'}} {...getFieldProps('declare_way_no')}>
                        <Option value="C">C</Option>
                    </Select>
                </FormItem>
              </td>
            </tr>
            <tr>
                <td width="400" height="35">
                    {this.renderTextInput('运单号', '请输入运单号', 'bill_no', true, [{required: true, min: 2, message: '2位以上中英文'}])}
                </td>
            </tr>
            <tr  height="35">
                <td height="35">
                    {this.props.formData.usebook !== TENANT_USEBOOK.owner.name &&
                    <FormItem label="是否使用手册:" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                    <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                        onChange={(checked) => this.props.setFormValue('usebook',
                                            checked ? TENANT_USEBOOK.manager.name : TENANT_USEBOOK.member.name)}
                        checked={this.props.formData.usebook && this.props.formData.usebook === TENANT_USEBOOK.manager.name}/>
                    </FormItem>}
                </td>
            </tr>
            
            <tr height="35">
                <td>
                    {this.renderTextInput('发票号', '请输入发票号', 'invoice_no', true, [{required: true, min: 2, message: '2位以上中英文'}])}
                </td>
                <td>
                    <FormItem label="贸易方式:" labelCol={{span: 6}} wrapperCol={{span: 16}}>
                        <Select defaultValue="lucy" style={{width:'100%'}} {...getFieldProps('trade_mode')}>
                            <Option value="1247">1247</Option>
                        </Select>
                     </FormItem>
                </td>
            </tr>
            <tr height="35">
                <td>
                    {this.props.formData.urgent !== TENANT_USEBOOK.owner.name &&
                        <FormItem label="是否加急:" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                        <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                            onChange={(checked) => this.props.setFormValue('urgent',
                                                checked ? TENANT_USEBOOK.manager.name : TENANT_USEBOOK.member.name)}
                            checked={this.props.formData.urgent && this.props.formData.urgent === TENANT_USEBOOK.manager.name}/>
                        </FormItem>
                     }
                </td>
                <td>
                   <FormItem label="其他要求:" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                         <textarea  width="272px;"></textarea>
                   </FormItem>
                 </td>
            </tr>
         </table>
          </Form>
        </div>
      </div>);
  }
    renderEnterpriseForm() {
    const {formData: {logo: logoPng}, formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <div className="body-responsive">
      <Form horizontal>
        <Row>
          <Col span="8">
            <FormItem label="企业LOGO" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                <img style={{height: 120, width: 120, margin: 10, border: '1px solid #e0e0e0', borderRadius: 60}} src={logoPng || '/assets/img/wetms.png'}/>
                <Dropzone onDrop={ (files) => this.props.uploadImg('logo', files) } style={{}}>
                  <div className="ant-upload ant-upload-drag" title="请拖拽或选择文件来改变" style={{height: 140, marginTop: 20}}>
                    <span>
                      <div className="ant-upload-drag-container">
                        <AntIcon type="upload" />
                        <p className="ant-upload-hint">建议使用PNG或GIF格式的透明图片</p>
                      </div>
                    </span>
                  </div>
                </Dropzone>
            </FormItem>
          </Col>
        </Row>
        <Row className="horizontal-divider">
          <Col span="8">
            <FormItem label="登录入口域" labelCol={{span: 6}} wrapperCol={{span: 16}} help={getFieldError('subdomain')}>
              <Input type="text" addonAfter=".welogix.cn" disabled {...getFieldProps('subdomain')} />
            </FormItem>
          </Col>
        </Row>
      </Form>
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