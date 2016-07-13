import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Radio, Upload, Button, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closePodModal, saveSubmitPod } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@injectIntl
@connect(
  state => ({
    submitter: state.account.username,
    visible: state.trackingLandStatus.podModal.visible,
    dispId: state.trackingLandStatus.podModal.dispId,
    parentDispId: state.trackingLandStatus.podModal.parentDispId,
    shipmtNo: state.trackingLandStatus.podModal.shipmtNo,
  }),
  { closePodModal, saveSubmitPod })
export default class PodSubmitter extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    parentDispId: PropTypes.number,
    shipmtNo: PropTypes.string.isRequired,
    onOK: PropTypes.func,
    closePodModal: PropTypes.func.isRequired,
    saveSubmitPod: PropTypes.func.isRequired,
  }
  state = {
    signStatus: '',
    remark: '',
    photoList: [],
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (ev) => {
    this.setState({ remark: ev.target.value });
  }
  handleSignRadioChange = ev => {
    this.setState({ signStatus: ev.target.value });
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
  handleOk = () => {
    const { shipmtNo, submitter, dispId, parentDispId, onOK } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const photos = photoList.map(ph => ph.url).join(',');
    this.props.saveSubmitPod(shipmtNo, dispId, parentDispId, submitter,
                             signStatus, remark, photos).then(
      result => {
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
    const { signStatus, remark } = this.state;
    const colSpan = 4;
    return (
      <Modal title={this.msg('podModalTitle')} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('signStatus')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <RadioGroup onChange={this.handleSignRadioChange} value={signStatus}>
              <Radio key="normal" value={1}>{this.msg('normalSign')}</Radio>
              <Radio key="abnormal" value={2}>{this.msg('abnormalSign')}</Radio>
              <Radio key="refused" value={3}>{this.msg('refusedSign')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={this.msg('signRemark')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Input type="textarea" placeholder={this.msg('signRemarkPlaceholder')}
              rows="5" value={remark} onChange={this.handleFieldChange}
            />
          </FormItem>
          <FormItem label={this.msg('podPhoto')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Upload action="/v1/upload/img" listType="picture"
            onChange={this.handlePhotoUpload} fileList={this.state.photoList}
            >
              <Button icon="upload" type="ghost" />
              { this.msg('photoSubmit') }
            </Upload>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
