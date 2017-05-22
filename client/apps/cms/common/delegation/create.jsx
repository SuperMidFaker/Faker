import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Row, Col, Button, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import MainForm from './forms/mainForm';
import SiderForm from './forms/siderForm';
import UploadGroup from './forms/attachmentUpload';
import { createDelegationByCCB } from 'common/reducers/cmsDelegation';
import { DELG_SOURCE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { createDelegationByCCB }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class CreateDelegation extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    createDelegationByCCB: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    attachments: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = ({ accepted }) => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { type, tenantId, loginId, username, tenantName, formData } = this.props;
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.createDelegationByCCB({
          delegation,
          tenantId,
          loginId,
          username,
          ietype: type === 'import' ? 0 : 1,
          source: DELG_SOURCE.consigned,
          attachments: this.state.attachments,
          tenantName,
          accepted,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.context.router.push(`/clearance/${type}`);
          }
        });
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleSaveAccept = () => {
    this.handleSave({ accepted: true });
  }
  handleUploadFiles = (fileList) => {
    this.setState({
      attachments: fileList,
    });
  }

  render() {
    const { form, type, submitting } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {type === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('delegationManagement')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('createDelegation')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
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
        </Content>
      </div>
    );
  }
}
