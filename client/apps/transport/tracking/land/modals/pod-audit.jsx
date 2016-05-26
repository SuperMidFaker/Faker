import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Radio, Upload, Button, Modal, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { closePodModal, passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@injectIntl
@connect(
  state => ({
    auditor: state.account.username,
    auditModal: state.trackingLandPod.auditModal,
  }),
  { closePodModal, passAudit, returnAudit })
export default class PodAuditModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    auditor: PropTypes.string.isRequired,
    auditModal: PropTypes.object.isRequired,
    onOK: PropTypes.func,
    closePodModal: PropTypes.func.isRequired,
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
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (ev) => {
    this.setState({ remark: ev.target.value });
  }
  handleSignRadioChange = ev => {
    this.setState({ signStatus: ev.target.value });
  }
  handlePhotoRemove = (/* file */) => {
    if (this.props.readonly) {
      return;
    }
  }
  handlePhotoUpload = info => {
    if (info.file.status === 'done' && info.file.response) {
      if (info.file.response.status === 200) {
        const photos = [...this.state.photoList];
        photos.push({
          uid: info.file.uid,
          name: info.file.name,
          status: 'done',
          url: info.file.response.data,
        });
        this.setState({ photoList: photos });
      } else {
        message.error(info.file.response.msg);
      }
    }
  }
  handleAuditPass = () => {
    /*
    const { auditor, dispId, onOK } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const photos = photoList.map(ph => ph.url).join(',');
   */
    const { auditModal: { dispId, parentDispId, podId }, auditor, onOK } = this.props;
    this.props.passAudit(podId, dispId, parentDispId, auditor).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.closePodModal();
          onOK();
        }
      });
  }
  handleAuditReturn = () => {
    const { auditModal: { dispId }, onOK } = this.props;
    this.props.returnAudit(dispId).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.closePodModal();
          onOK();
        }
      });
  }
  render() {
    const { auditModal: { readonly, visible }} = this.props;
    const { signStatus, remark, photoList } = this.state;
    const colSpan = 4;
    return (
      <Modal title={this.msg('podModalTitle')} onCancel={this.handleAuditReturn}
        onOk={this.handleAuditPass} visible={visible} okText={this.msg('auditPass')}
        cancelText={this.msg('auditReturn')}
      >
        <Form className="row">
          <FormItem label={this.msg('signStatus')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <RadioGroup onChange={this.handleSignRadioChange} value={signStatus}>
              <Radio key="normal" value={1} disabled={readonly}>{this.msg('normalSign')}</Radio>
              <Radio key="abnormal" value={2} disabled={readonly}>{this.msg('abnormalSign')}</Radio>
              <Radio key="refused" value={3} disabled={readonly}>{this.msg('refusedSign')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={this.msg('signRemark')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Input type="textarea" placeholder={this.msg('signRemarkPlaceholder')}
              rows="5" value={remark} onChange={this.handleFieldChange}
              disabled={readonly}
            />
          </FormItem>
          <FormItem label={this.msg('podPhoto')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Upload action="/v1/upload/img" listType="picture" onRemove={this.handlePhotoRemove}
            onChange={this.handlePhotoUpload} fileList={photoList}
            >
              <Button icon="upload" type="ghost" disabled={readonly} />
              { this.msg('photoSubmit') }
            </Upload>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
