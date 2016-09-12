import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Col, Button, Popconfirm, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import BasicForm from './forms/basicForm';
import SubForm from './forms/SubForm';
import UploadGroup from './forms/attachmentUpload';
import { editDelegation } from 'common/reducers/cmsDelegation';

@connect(
  state => ({
    loginId: state.account.loginId,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { editDelegation }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: '委托信息修改',
    moduleName: 'clearance',
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
@Form.create()
export default class AcceptanceEdit extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    editDelegation: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    addedFiles: [],
    removedFiles: [],
  }
  handleSave = ({ isAccepted }) => {
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { type, formData } = this.props;
        const { addedFiles, removedFiles } = this.state;
        const formdatas = this.props.form.getFieldsValue();
        const subformArray = [];
        for (const i of formdatas.keys) {
          subformArray.push({
            decl_way_code: formdatas[`decl_way_code_${i}`],
            manual_no: formdatas[`manual_no_${i}`],
            pack_count: formdatas[`pack_count_${i}`],
            gross_wt: formdatas[`gross_wt_${i}`],
          });
        }
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        delegation.subforms = subformArray;
        this.props.editDelegation({
          delegation, addedFiles, removedFiles, patnershipType: 'CCB',
          accepted: isAccepted, ietype: type === 'import' ? 0 : 1,
        }).then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.push(`/clearance/${type}/`);
          }
        });
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ isAccepted: false });
  }
  handleSaveAccept = () => {
    this.handleSave({ isAccepted: true });
  }
  handleUploadedFile = (file) => {
    this.setState({
      addedFiles: [...this.state.addedFiles, file],
    });
  }
  handleFileRemove = (file) => {
    const filters = this.state.addedFiles.filter(af => af.uid !== file.uid);
    if (filters.length !== this.state.addedFiles.length) {
      this.setState({ addedFiles: filters });
    } else {
      this.setState({ removedFiles: [...this.state.removedFiles, file] });
    }
  }
  render() {
    const { form, type, submitting } = this.props;
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal form={form}>
            <div className="panel-body">
              <Col sm={16} style={{ padding: '16px 8px 8px 16px' }}>
                <BasicForm form={form} ieType={type} partnershipType="CCB" />
              </Col>
              <Col sm={8} style={{ padding: '16px 16px 8px 8px' }}>
                <UploadGroup onFileUpload={this.handleUploadedFile}
                  onFileRemove={this.handleFileRemove}
                />
              </Col>
            </div>
            <div id="parent" style={{ padding: '16px' }}>
              <SubForm form={form} ietype={type} />
            </div>
            <div style={{ padding: '16px' }}>
              <Button size="large" type="primary" style={{ marginRight: 20 }}
                onClick={this.handleSaveBtnClick} loading={submitting}
              >
              保存
              </Button>
              <Popconfirm title="确定保存接单?" onConfirm={this.handleSaveAccept}>
                <Button size="large" loading={submitting}>一键接单</Button>
              </Popconfirm>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
