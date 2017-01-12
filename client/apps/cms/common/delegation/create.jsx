import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Button, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import SubForm from './forms/SubForm';
import UploadGroup from './forms/attachmentUpload';
import { createDelegationByCCB } from 'common/reducers/cmsDelegation';
import { DELG_SOURCE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

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
  text: '进出口清关',
  moduleName: 'clearance',
})
@Form.create()
export default class AcceptanceCreate extends Component {
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
          delegation, tenantId, loginId, username,
          ietype: type === 'import' ? 0 : 1, source: DELG_SOURCE.consigned,
          attachments: this.state.attachments, tenantName,
          accepted,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
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
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('createDelegation')}</span>
        </header>
        <div className="top-bar-tools">
          <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
            {this.msg('cancel')}
          </Button>
          <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
            {this.msg('save')}
          </Button>
        </div>
        <div className="main-content" key="main">
          <div className="page-body card-wrapper">
            <Form horizontal>
              <Row gutter={16}>
                <Col sm={18}>
                  <BasicForm form={form} ieType={type} partnershipType="CCB" />
                  <SubForm form={form} ietype={type} />
                </Col>
                <Col sm={6}>
                  <UploadGroup onFileListUpdate={this.handleUploadFiles} />
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
