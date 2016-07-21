import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Col, Button, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import BasicForm from '../delegation/basicForm';
import UploadGroup from '../delegation/attachmentUpload';
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
    text: props.params.delgNo,
    moduleName: props.type,
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
  handleSave = () => {
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { type, formData } = this.props;
        const { addedFiles, removedFiles } = this.state;
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.editDelegation({
          delegation, addedFiles, removedFiles, patnershipType: 'CUS',
        }).then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.push(`/${type}/delegate`);
          }
        });
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave();
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
            <div className="panel-body body-responsive">
              <Col sm={16} style={{ padding: '16px 8px 8px 16px' }}>
                <BasicForm form={form} ieType={type} partnershipType="CUS" />
              </Col>
              <Col sm={8} style={{ padding: '16px 16px 8px 8px' }}>
                <UploadGroup onFileUpload={this.handleUploadedFile}
                  onFileRemove={this.handleFileRemove}
                />
              </Col>
            </div>
            <div style={{ padding: '16px' }}>
              <Button size="large" type="primary" style={{ marginRight: 20 }}
                onClick={this.handleSaveBtnClick} loading={submitting}
              >
              保存
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
