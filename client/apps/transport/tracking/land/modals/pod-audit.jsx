import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Input, Radio, Upload, Button, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closePodAuditModal, passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@injectIntl
@connect(
  state => ({
    auditor: state.account.username,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    auditModal: state.trackingLandPod.auditModal,
  }),
  { closePodAuditModal, passAudit, returnAudit })
export default class PodAuditModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    auditor: PropTypes.string.isRequired,
    auditModal: PropTypes.object.isRequired,
    closePodAuditModal: PropTypes.func.isRequired,
    returnAudit: PropTypes.func.isRequired,
    passAudit: PropTypes.func.isRequired,
  }
  state = {
    signStatus: '',
    remark: '',
    photoList: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.auditModal.dispId !== this.props.auditModal.dispId) {
      const photoList = [];
      nextProps.auditModal.photos.split(',').forEach((ph, index) => {
        photoList.push({
          uid: -index,
          status: 'done',
          url: ph,
        });
      });
      this.setState({
        signStatus: nextProps.auditModal.sign_status,
        remark: nextProps.auditModal.sign_remark,
        photoList,
      });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleAuditPass = () => {
    /*
    const { auditor, dispId } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const photos = photoList.map(ph => ph.url).join(',');
   */
    const { auditModal: { dispId, parentDispId, podId }, auditor, tenantId, loginId } = this.props;
    this.props.passAudit(podId, dispId, parentDispId, auditor, tenantId, loginId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.closePodAuditModal();
        }
      });
  }
  handleAuditReturn = () => {
    const { auditModal: { dispId } } = this.props;
    this.props.returnAudit(dispId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.closePodAuditModal();
        }
      });
  }
  handleAuditCancel = () => {
    this.props.closePodAuditModal();
  }
  render() {
    const { auditModal: { readonly, visible } } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const colSpan = 4;
    return (
      <Modal maskClosable={false} title={this.msg('auditPod')} onCancel={this.handleAuditCancel}
        visible={visible}
        footer={[
          <Button key="return" type="ghost" onClick={this.handleAuditReturn}>
            {this.msg('auditReturn')}
          </Button>,
          <Button key="pass" type="primary" onClick={this.handleAuditPass}>
            {this.msg('auditPass')}
          </Button>,
        ]}
      >
        <Form className="row">
          <FormItem label={this.msg('signStatus')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <RadioGroup onChange={this.handleSignRadioChange} value={signStatus}>
              <Radio key="normal" value={1} disabled={readonly}>{this.msg('normalSign')}</Radio>
              <Radio key="abnormal" value={2} disabled={readonly}>{this.msg('abnormalSign')}</Radio>
              <Radio key="refused" value={3} disabled={readonly}>{this.msg('refusedSign')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={this.msg('signRemark')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <Input.TextArea
              rows="5" value={remark} onChange={this.handleFieldChange}
              disabled={readonly}
            />
          </FormItem>
          <FormItem label={this.msg('podPhoto')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <Upload action={`${API_ROOTS.default}v1/upload/img`} listType="picture"
              fileList={photoList} withCredentials
            >
              <Button icon="upload" type="ghost" disabled={readonly} />
              {this.msg('photoSubmit')}
            </Upload>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
