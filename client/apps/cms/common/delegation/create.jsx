import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Col, Button, Popconfirm, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import BasicForm from './forms/basicForm';
import SubForm from './forms/SubForm';
import UploadGroup from './forms/attachmentUpload';
import { createDelegationByCCB } from 'common/reducers/cmsDelegation';
import { DELG_SOURCE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n.js';
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
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: '新建委托',
    moduleName: 'clearance',
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
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
        const formdatas = this.props.form.getFieldsValue();
        const subformArray = [];
        let weight = 0;
        let pieces = 0;
        for (const i of formdatas.keys) {
          subformArray.push({
            decl_way_code: formdatas[`decl_way_code_${i}`],
            manual_no: formdatas[`manual_no_${i}`],
            pack_count: formdatas[`pack_count_${i}`],
            gross_wt: formdatas[`gross_wt_${i}`],
          });
          weight += Number(formdatas[`gross_wt_${i}`]);
          pieces += Number(formdatas[`pack_count_${i}`]);
        }
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        delegation.weight = weight;
        delegation.pieces = pieces;
        delegation.subforms = subformArray;
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
      <div className="main-content">
        <div className="page-body">
          <Form horizontal>
            <div className="panel-body">
              <Col sm={18} style={{ padding: '16px 8px 0 16px' }}>
                <BasicForm form={form} ieType={type} partnershipType="CCB" />
              </Col>
              <Col sm={6} style={{ padding: '16px 16px 0 8px' }}>
                <UploadGroup onFileListUpdate={this.handleUploadFiles} />
              </Col>
              <Col sm={24} style={{ padding: '0 16px' }}>
                <SubForm form={form} ietype={type} />
              </Col>
            </div>
            <div style={{ padding: '16px' }}>
              <Button size="large" type="primary" style={{ marginRight: 20 }}
                loading={submitting} onClick={this.handleSaveBtnClick}
              >
              {this.msg('save')}
              </Button>
              <Popconfirm title={this.msg('delgSaveConfirm')} onConfirm={this.handleSaveAccept}>
                <Button size="large" loading={submitting}>{this.msg('acceptNow')}</Button>
              </Popconfirm>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
