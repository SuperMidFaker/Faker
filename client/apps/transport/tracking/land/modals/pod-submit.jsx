import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { Form, Input, Radio, Upload, Button, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closePodModal, saveSubmitPod, loadPod } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    submitter: state.account.username,
    visible: state.trackingLandPod.podModal.visible,
    dispId: state.trackingLandPod.podModal.dispId,
    parentDispId: state.trackingLandPod.podModal.parentDispId,
    shipmtNo: state.trackingLandPod.podModal.shipmtNo,
    podModal: state.trackingLandPod.podModal,
  }),
  { closePodModal, saveSubmitPod, loadPod })
export default class PodSubmitter extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    parentDispId: PropTypes.number,
    shipmtNo: PropTypes.string.isRequired,
    onOK: PropTypes.func,
    closePodModal: PropTypes.func.isRequired,
    saveSubmitPod: PropTypes.func.isRequired,
    podModal: PropTypes.object.isRequired,
    loadPod: PropTypes.func.isRequired,
  }
  state = {
    signStatus: 1,
    remark: '',
    photoList: [],
  }
  componentWillReceiveProps(nextProps) {
    const photoList = [];
    if (nextProps.podModal.photos && /^http/.test(nextProps.podModal.photos)) {
      nextProps.podModal.photos.split(',').forEach((ph, index) => {
        photoList.push({
          uid: -index,
          status: 'done',
          url: ph,
        });
      });
    }
    this.setState({
      signStatus: nextProps.podModal.sign_status,
      remark: nextProps.podModal.sign_remark,
      photoList,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (ev) => {
    this.setState({ remark: ev.target.value });
  }
  handleSignRadioChange = (ev) => {
    this.setState({ signStatus: ev.target.value });
  }
  handlePhotoRemove = (file) => {
    const photoList = [...this.state.photoList];
    const index = photoList.findIndex(item => item.uid === file.uid);
    photoList.splice(index, 1);
    this.setState({ photoList });
  }
  handlePhotoUpload = (info) => {
    const fileList = [...info.fileList];
    const index = fileList.findIndex(item => item.uid === info.file.uid);
    fileList[index].url = info.file.response ? info.file.response.data : '';
    this.setState({ photoList: fileList });
  }
  handleOk = () => {
    const { shipmtNo, submitter, dispId, parentDispId, onOK, loginId, tenantId, tenantName } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const photos = photoList.map(ph => ph.url).join(',');
    this.props.saveSubmitPod('enterprise', shipmtNo, dispId, parentDispId, submitter,
                             signStatus, remark, photos, loginId, tenantId, tenantName).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.closePodModal();
          onOK();
        }
      });
  }
  handleCancel = () => {
    this.props.closePodModal();
  }
  render() {
    const { signStatus, remark, photoList } = this.state;
    const colSpan = 4;
    return (
      <Modal title={this.msg('podModalTitle')} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('signStatus')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <RadioGroup onChange={this.handleSignRadioChange} value={signStatus}>
              <Radio key="normal" value={1}>{this.msg('normalSign')}</Radio>
              <Radio key="abnormal" value={2}>{this.msg('abnormalSign')}</Radio>
              <Radio key="refused" value={3}>{this.msg('refusedSign')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={this.msg('signRemark')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <Input type="textarea" placeholder={this.msg('signRemarkPlaceholder')}
              rows="5" value={remark} onChange={this.handleFieldChange}
            />
          </FormItem>
          <FormItem label={this.msg('podPhoto')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <Upload action={`${API_ROOTS.default}v1/upload/img/`} listType="picture"
              onChange={this.handlePhotoUpload} onRemove={this.handlePhotoRemove} fileList={photoList} withCredentials
            >
              <Button icon="upload" type="ghost" />
              {this.msg('photoSubmit')}
            </Upload>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
