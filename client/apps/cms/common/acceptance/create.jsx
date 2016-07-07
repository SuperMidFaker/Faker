import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Col, Button, Popconfirm, message } from 'ant-ui';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import BasicForm from '../delegation/basicForm';
import UploadGroup from '../delegation/attachmentUpload';
import { createDelegationByCCB, loadNewForm } from 'common/reducers/cmsDelegation';
import { DELG_SOURCE } from 'common/constants';

function fetchData({ dispatch }) {
  return dispatch(loadNewForm());
}

@connectFetch()(fetchData)
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
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: '新建报关委托',
    moduleName: props.type,
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
@Form.create()
export default class AcceptanceCreate extends Component {
  static propTypes = {
    type: PropTypes.oneOf([ 'import', 'export' ]),
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    createDelegationByCCB: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    attachments: [],
  }
  handleSave = ({ accepted }) => {
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { type, tenantId, loginId, username, tenantName, formData } = this.props;
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.createDelegationByCCB({
          delegation, tenantId, loginId, username,
          ietype: type === 'import' ? 0 : 1, source: DELG_SOURCE.consigned,
          attachments: this.state.attachments, tenantName,
          accepted,
        }).then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.push(`/${type}/accept`);
          }
        });
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
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
    const { form, type } = this.props;
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal form={form}>
            <div className="panel-body body-responsive">
              <Col sm={16} style={{ padding: '16px 8px 8px 16px' }}>
                <BasicForm form={form} ieType={type}/>
              </Col>
              <Col sm={8} style={{ padding: '16px 16px 8px 8px' }}>
                <UploadGroup onFileListUpdate={this.handleUploadFiles}/>
              </Col>
            </div>
            <div style={{ padding: '16px' }}>
              <Button size="large" type="primary" style={{marginRight: 20}}
                onClick={this.handleSaveBtnClick}>保存</Button>
              <Popconfirm title="确定保存接单?" onConfirm={this.handleSaveAccept}>
                <Button size="large">一键接单</Button>
              </Popconfirm>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
