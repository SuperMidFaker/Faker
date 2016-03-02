import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  Modal,
  Icon,
  Button,
  Form,
  Select,
  Input,
  Row,
  Col,
  Switch,
  message
} from
'ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import {
  isFormDataLoaded,
  loadForm,
  assignForm,
  clearForm,
  setFormValue,
  edit,
  submit,
  loadSelectOptions,
  uploadFiles,
  removeFile
} from
'../../../../universal/redux/reducers/importdelegate';
import {setNavTitle} from '../../../../universal/redux/reducers/navbar';
import './upload.less';
const Dropzone = require('react-dropzone');
const FormItem = Form.Item;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

function fetchData({state, dispatch, cookie, params}) {
  const pid = parseInt(params.id, 10);
  const promises = [];
  promises.push(dispatch(loadSelectOptions(cookie, {
    delId: params.id,
    tenantId: state.account.tenantId
  })));
  if (pid) {
    if (!isFormDataLoaded(state.importdelegate, pid)) {
      promises.push(dispatch(loadForm(cookie, pid)));
    } else {
      promises.push(dispatch(assignForm(state.importdelegate, pid)));
    }
  } else {
    promises.push(dispatch(clearForm()));
  }

  return Promise.all(promises);
}

function goBack(props) {
  props.history.goBack();
}

@connectFetch()(fetchData)
@connect(state => ({
  selectedIndex: state.importdelegate.selectedIndex,
  formData: state.importdelegate.formData,
  code: state.account.code,
  username: state.account.username,
  tenantId: state.account.tenantId,
  selectOptions: state.importdelegate.selectOptions
}), {setFormValue, edit, submit, uploadFiles, removeFile})
@connectNav((props, dispatch) => {
  if (props.formData.key === -1) {
    return;
  }
  const isCreating = (props.formData.key === undefined || props.formData.key === null);
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating
      ? '新增业务单'
      : '业务单详情',
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
export default class ImportDelegateEdit extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    selectOptions: PropTypes.object.isRequired,
    uploadFiles: PropTypes.func.isRequired,
    removeFile: PropTypes.func.isRequired
  }
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      current: '1',
      openKeys: [],
      modalVisible: false,
      fileCategory: ''
    };
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      goBack(this.props);
    }
  }
  handleSubmit(ev) {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        if (this.props.formData.key) {
          this.props.edit(this.props.formData, JSON.stringify({username: this.props.username, tenantId: this.props.tenantId, declareFileList: this.props.selectOptions.declareFileList})).then(result => {
            this.onSubmitReturn(result.error);
          });
        } else {
          this.props.submit(this.props.formData, JSON.stringify({username: this.props.username, tenantId: this.props.tenantId, declareFileList: this.props.selectOptions.declareFileList})).then(result => {
            this.onSubmitReturn(result.error);
          });
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel() {
    goBack(this.props);
  }
  handleSelectChange(stateKey, value) {
    this.setState(JSON.parse(`{"${stateKey}":"${value}"}`));
  }
  handleShowModal() {
    this.setState({modalVisible: true});
  }
  handleOk() {
    this.setState({modalVisible: false});
  }
  handleHide() {
    this.setState({modalVisible: false});
  }
  handleUpload(files) {
    if (this.props.formData.category === undefined || this.props.formData.category === null) {
      message.warn('请选择单据类型');
    } else {
      this.props.uploadFiles(files, files[0].name, this.props.formData.category);
    }
  }
  handleRemoveFile(index) {
     this.props.removeFile(index);
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
        }} placeholder={placeholder} onChange={(value) => this.setState(JSON.parse(`{"${field}":"${value}"}`))} {...getFieldProps(field, {rules})}>
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

  render() {
    const {
      selectOptions: {
        customsInfoList,
        declareWayList,
        tradeModeList,
        declareFileList,
        declareCategoryList
      }
    } = this.props;
    //  const disableSubmit = this.props.tenant.id === -1;
    // todo loginname no '@' change adapt and tranform logic with new rc-form
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc} className="form-edit-content">
            <Row>
              <Col span="8" offset="3">
                {this.renderSelect('清关海关', '选择清关海关', 'master_customs', true, customsInfoList, [
                  {
                    required: true,
                    message: '请选择清关海关'
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
                    required: true,
                    message: '请选择报关类型'
                  }
                ])}
              </Col>
            </Row>
            <Row>
              <Col span="8" offset="3">
                {this.renderSwitch('使用手册/账册', 'usebook')}
                {this.renderTextInput('发票号码', '请输入发票号码', 'invoice_no', false, null, null)}
                {this.renderSwitch('加急', 'urgent')}
              </Col>
              <Col span="8">
                {this.renderTextInput('备案号', '', 'ems_no', false, null, null, true)}
                {this.renderSelect('贸易方式', '选择贸易方式', 'trade_mode', false, tradeModeList, null)}
                {this.renderTextInput('其他要求', '', 'other_note', false, null, null, false, 'textarea')}
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem labelCol={{
                  span: 5
                }} label="报关单据">
                  <Row>
                    <Col span="2">
                      <Dropzone onDrop={(files) => this.handleUpload(files)} style={{}}>
                        <div className="ant-upload ant-upload-drag" title="请拖拽或选择文件来改变" style={{
                          height: 100,
                          marginTop: 0,
                          width: 100
                        }}>
                          <span>
                            <div className="ant-upload-drag-container">
                              <Icon type="upload"/>
                              <p className="ant-upload-hint">选择文件</p>
                            </div>
                          </span>
                        </div>
                      </Dropzone>
                      <span style={{
                        cursor: 'hand'
                      }}>
                        <Icon type="tags"/>
                        <label onClick={() => {
                          this.handleShowModal();
                        }}>选择单据类型</label>
                      </span>
                    </Col>

                    {declareFileList.map((item, index) => (
                      <Col span="2" style={{
                        display: (item.fileflag === -1)
                          ? 'none'
                          : 'inline-block'
                      }}>

                        <div className="ant-upload-list ant-upload-list-picture-card">
                          <span>
                            <div className="ant-upload-list-item ant-upload-list-item-done">
                              <div className="ant-upload-list-item-info">
                                <a className="ant-upload-list-item-thumbnail" target="_blank">
                                  <img src="https://os.alipayobjects.com/rmsportal/NDbkJhpzmLxtPhB.png" alt={item.doc_name}/>
                                </a>
                                <span>
                                  <a href={item.url} target="_blank">
                                    <Icon type="download"/>
                                  </a>
                                  <Icon type="delete" onClick={() => this.handleRemoveFile(index)} alt="删除文件"/>
                                </span>
                              </div>
                            </div>
                          </span>
                          <div className="ant-upload-list-item-uploading-text">{item.category}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="18" offset="3">
                <Button htmlType="submit" type="primary">确定</Button>
                <Button onClick={this.handleCancel}>取消</Button>
              </Col>
            </Row>
          </Form>

          <Modal title="选择单据类型" visible={this.state.modalVisible} closable={false} onOk={() => {
            this.handleOk();
          }} onCancel={() => {
            this.handleHide();
          }}>
            <Form horizontal>
              <FormItem label="单据类型:" labelCol={{
                span: 6
              }} wrapperCol={{
                span: 18
              }}>
                <Select combobox style={{
                  width: '100%'
                }} searchPlaceholder="请输入或选择单据类型" {...this.props.formhoc.getFieldProps('category', {})}>
                  {declareCategoryList.map((item) => (
                    <Option value={item.category} key={item.category}>{item.category}</Option>
                  ))}
                </Select>
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    );
  }
}
