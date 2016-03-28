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
  message,
  Menu,
  Dropdown,
  Tabs,
  Table
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
  removeFile,
  invalidDelegate,
  loadLogs
} from
'../../../../universal/redux/reducers/importdelegate';
import {setNavTitle} from '../../../../universal/redux/reducers/navbar';
import './upload.less';
const Dropzone = require('react-dropzone');
const FormItem = Form.Item;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const DropdownButton = Dropdown.Button;
const TabPane = Tabs.TabPane;

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
    promises.push(dispatch(loadLogs({delegateId: pid, pageSize: state.importdelegate.loglist.pageSize, currentPage: state.importdelegate.loglist.current})));
  } else {
    promises.push(dispatch(clearForm()));
  }

  return Promise.all(promises);
}

function goBack(router) {
  router.goBack();
}

@connectFetch()(fetchData)
@connect(state => ({
  selectedIndex: state.importdelegate.selectedIndex,
  loglist: state.importdelegate.loglist,
  formData: state.importdelegate.formData,
  code: state.account.code,
  username: state.account.username,
  loginId: state.account.loginId,
  tenantId: state.account.tenantId,
  ename: state.corpDomain.name,
  selectOptions: state.importdelegate.selectOptions,
  loading: state.importdelegate.loading
}), {
  setFormValue,
  edit,
  submit,
  uploadFiles,
  removeFile,
  invalidDelegate,
  loadLogs
})
@connectNav((props, dispatch, router) => {
  if (props.formData.key === -1) {
    return;
  }
  const isCreating = (props.formData.key === undefined || props.formData.key === null);
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating
      ? '新增报关业务'
      : '报关业务详情',
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
export default class ImportDelegateEdit extends React.Component {
  static propTypes = {
    loglist: PropTypes.object.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    selectOptions: PropTypes.object.isRequired,
    uploadFiles: PropTypes.func.isRequired,
    removeFile: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      current: '1',
      openKeys: [],
      modalVisible: false,
      voidConfirm: false,
      fileCategory: ''
    };
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
          this.props.edit(this.props.formData, JSON.stringify({username: this.props.username, tenantId: this.props.tenantId, loginId: this.props.loginId, declareFileList: this.props.selectOptions.declareFileList})).then(result => {
            this.onSubmitReturn(result.error);
          });
        } else {
          this.props.submit(this.props.formData, JSON.stringify({username: this.props.username, tenantId: this.props.tenantId, loginId: this.props.loginId, declareFileList: this.props.selectOptions.declareFileList})).then(result => {
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
  handleConfirmOk() {
    if (!this.state.invalidReson || this.state.invalidReson === '') {
      message.error('请输入作废原因', 10);
      return;
    }
    this.props.invalidDelegate({
      tenantId: this.props.tenantId,
      loginId: this.props.loginId,
      username: this.props.username,
      delegateId: this.props.formData.key,
      curStatus: this.props.formData.status,
      del_no: this.props.formData.del_no,
      reason: this.state.invalidReson
    }).then(result => {
      this.setState({voidConfirm: false});
      this.onSubmitReturn(result.error);
    });
  }
  handleConfirmHide() {
    this.setState({voidConfirm: false});
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
  handleMenuClick(e) {
    if (e.key === '2') {
      this.setState({voidConfirm: true});
    }
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
  renderStatus(status) {
    let fontColor = '';
    let statusText = '';
    switch (status) {
      case 0:
        statusText = '待处理';
        fontColor = '#FFD700';
        break;
      case 1:
        statusText = '委托中';
        fontColor = '#FF7F00';
        break;
      case 2:
        statusText = '受理中';
        fontColor = '#00CD00';
        break;
      case 3:
        statusText = '已作废';
        fontColor = '#CCC';
        break;
      default:
        break;
    }
    return (
      <span style={{
        color: fontColor
      }}>
        {statusText}
      </span>
    );
  }
  renderEditForm() {
    const {
      selectOptions: {
        customsInfoList,
        declareWayList,
        tradeModeList,
        declareFileList
      }
    } = this.props;
    const menu = (
      <Menu onClick={(e) => this.handleMenuClick(e)}>
        <Menu.Item key="1">录入报关清单</Menu.Item>
        <Menu.Item key="2" disabled={this.props.loginId !== this.props.formData.creater_login_id}>作废报关业务</Menu.Item>
      </Menu>
    );
    return (
      <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc} className="form-edit-content">
        <Row style={{
          display: ((this.props.formData.key === undefined || this.props.formData.key === null)
            ? 'none'
            : 'inline-block')
        }}>
          <Col offset="3">
            <div>
              <strong>{this.props.ename}</strong>
              &nbsp;&nbsp;&nbsp;单号：{this.props.formData.del_no} {this.renderStatus(this.props.formData.status)}
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div>&nbsp;</div>
          </Col>
        </Row>
        <Row>
          <Col span="8" offset="3">
            {this.renderSelect('清关海关', '选择清关海关', 'master_customs', true, customsInfoList, [
              {
                required: true,
                message: '请选择清关海关'
              }
            ], (this.props.formData.status === 2))}

            {this.renderTextInput('提运单号', '请输提运单号', 'bill_no', true, [
              {
                required: true,
                message: '提运单号不能为空'
              }
            ], null, (this.props.formData.status === 2))}
          </Col>
          <Col span="8">
            {this.renderSelect('报关类型', '选择报关类型', 'declare_way_no', true, declareWayList, [
              {
                required: true,
                message: '请选择报关类型'
              }
            ], (this.props.formData.status === 2))}
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
                    <label onClick= { () => { this.handleShowModal(); } }>选择单据类型</label>
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
        <Row style={{
          display: this.props.formData.status === 3
            ? 'hide'
            : 'inline-block'
        }}>
          <Col span="18" offset="3">
            <Button htmlType="submit" type="primary">确定</Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </Col>
          <Col span="2">
            <DropdownButton overlay={menu} className="pull-right">
              更多选项
            </DropdownButton>
          </Col>
        </Row>
      </Form>
    );
  }
  renderLogForm() {
    const {loglist, loading} = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadLogs(params),
      resolve: (result) => result.data,
      extraParams: {
        delegateId: this.props.formData.key
      },
      getPagination: (result, currentResolve) => ({
        total: result.totalCount,
        current: currentResolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize
      }),
      getParams: (pagination) => {
        const params = {
          pageSize: pagination.pageSize,
          currentPage: pagination.current
        };
        return params;
      },
      remotes: loglist
    });

    const columns = [
      {
        title: '日志编号',
        width: 80,
        dataIndex: 'key'
      }, {
        title: '关联委托编号',
        width: 200,
        dataIndex: 'rel_id'
      }, {
        title: '操作人ID',
        width: 120,
        dataIndex: 'oper_id'
      }, {
        title: '操作人姓名',
        width: 120,
        dataIndex: 'oper_name'
      }, {
        title: '操作时间',
        width: 120,
        dataIndex: 'oper_date'
      }, {
        title: '日志内容',
        dataIndex: 'oper_note'
      }
    ];
    return (
      <div className="panel-body body-responsive">
        <Table columns={columns} loading={loading} dataSource={dataSource}/>
      </div>
    );
  }

  render() {
    const {selectOptions: {
        declareCategoryList
      }} = this.props;

    return (
      <div className="main-content">
        <div className="page-body">

          <Tabs defaultActiveKey="tab1">
            <TabPane tab="报关委托" key="tab1">
              {this.renderEditForm()}
            </TabPane>
            <TabPane tab="操作日志" key="tab2">
              {this.renderLogForm()}
            </TabPane>
          </Tabs>

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

          <Modal title="报关业务作废确认" visible={this.state.voidConfirm} closable={false} onOk={() => {
            this.handleConfirmOk();
          }} onCancel={() => {
            this.handleConfirmHide();
          }}>
            <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc} className="form-edit-content">
              <Row>
                <Col>
                  是否确认将此报关业务<strong>{this.props.formData.del_no}</strong>作废?</Col>
              </Row>
              <Row>
                <Col span="24">
                  <Input type="textarea" className="ant-input ant-input-lg" onChange={(e) => this.setState({invalidReson: e.target.value})} placeholder="请填写作废原因"/>
                </Col>
              </Row>
            </Form>
          </Modal>

        </div>
      </div>
    );
  }
}
