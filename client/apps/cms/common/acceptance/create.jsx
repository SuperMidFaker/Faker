import React, { Component, PropTypes } from 'react';
import { Form, Col, Button, message } from 'ant-ui';
import { connect } from 'react-redux';
import BasicForm from '../delegation/basicForm';
import UploadGroup from '../delegation/attachmentUpload';
import { createDelegationByCCB } from 'common/reducers/cmsDelegation';
import { DELG_SOURCE } from 'common/constants';

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.cmsDelegation.formData,
  }),
  { createDelegationByCCB }
)
@Form.create()
export default class AcceptanceCreate extends Component {
  static propTypes = {
    type: PropTypes.oneOf([ 'import', 'export' ]),
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    attachments: [],
  }
  handleSaveBtnClick = () => {
    const { type, tenantId, loginId, username, tenantName, formData } = this.props;
    const delegation = { ...formData, ...this.props.form.getFieldsValue() };
    this.props.createDelegationByCCB({
      delegation, tenantId, loginId, username,
      ietype: type === 'import' ? 0 : 1, source: DELG_SOURCE.consigned,
      attachments: this.state.attachments, tenantName,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.context.router.push(`/${type}/accept`);
      }
    });
  }
  handleUploadFiles = (fileList) => {
    this.setState({
      attachments: fileList,
    });
  }
  render() {
    const { form, type } = this.props;
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal form={form}>
            <div className="panel-body body-responsive">
              <Col sm={16} style={{ padding: '16px 8px 8px 16px'}}>
                <BasicForm form={form} ieType={type}/>
              </Col>
              <Col sm={8} style={{ padding: '16px 16px 8px 8px'}}>
                <UploadGroup onFileListUpdate={this.handleUploadFiles}/>
              </Col>
            </div>
            <div style={{ padding: '16px' }}>
              <Button size="large" type="primary" style={{marginRight: 20}} onClick={this.handleSaveBtnClick}>保存</Button>
              <Button size="large">一键接单</Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
