import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Col, Button, Row, message, Layout } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import MainForm from './forms/mainForm';
import SiderForm from './forms/siderForm';
import UploadGroup from './forms/attachmentUpload';
import { editDelegation } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { editDelegation }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class EditDelegation extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  msg = key => formatMsg(this.props.intl, key);
  handleSave = ({ isAccepted }) => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { type, formData } = this.props;
        const { addedFiles, removedFiles } = this.state;
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.editDelegation({
          delegation, addedFiles, removedFiles, patnershipType: 'CCB',
          accepted: isAccepted, ietype: type === 'import' ? 0 : 1,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.push(`/clearance/${type}/`);
          }
        });
      }
    });
  }
  handleCancelBtnClick = () => {
    this.context.router.push(`/clearance/${this.props.type}/`);
  }

  handleSaveBtnClick = () => {
    this.handleSave({ isAccepted: false });
  }
  handleSaveAccept = () => {
    this.handleSave({ isAccepted: true });
  }
  handleUploadFiles = (file) => {
    this.setState({
      addedFiles: [...this.state.addedFiles, file],
    });
  }
  handleFileRemove = (file) => {
    const filters = this.state.addedFiles.filter(af => af.uid !== file.uid);
    if (filters.length !== this.state.addedFiles.length && this.state.addedFiles.length > 0) {
      this.setState({ addedFiles: filters });
    } else {
      this.setState({ removedFiles: [...this.state.removedFiles, file] });
    }
  }
  render() {
    const { form, type, submitting } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('delegationManagement')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('modifyDelegation')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" onClick={this.handleSaveBtnClick} loading={submitting}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-large">
          <Form horizontal form={form}>
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <MainForm form={form} ieType={type} partnershipType="CCB" />
              </Col>
              <Col sm={24} md={8}>
                <SiderForm form={form} />
                <UploadGroup onFileListUpdate={this.handleUploadFiles} />
              </Col>
            </Row>
          </Form>
          <Row>
            <Button type="danger" size="large">删除</Button>
          </Row>
        </Content>
      </div>
    );
  }
}
