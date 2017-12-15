import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Col, Icon, Form, Input, Radio, Upload, Button, message, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { saveSubmitPod, loadPod } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const { TextArea } = Input;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    submitter: state.account.username,
    parentDispId: state.shipment.previewer.dispatch.parent_id,
    shipmtNo: state.shipment.previewer.dispatch.shipmt_no,
    dispId: state.shipment.previewer.dispatch.id,
    podId: state.shipment.previewer.dispatch.pod_id || -1,
  }),
  { saveSubmitPod, loadPod }
)
@Form.create()
export default class SubmitPodForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    parentDispId: PropTypes.number,
    rejected: PropTypes.bool,
    shipmtNo: PropTypes.string.isRequired,
    saveSubmitPod: PropTypes.func.isRequired,
    dispId: PropTypes.number.isRequired,
    podId: PropTypes.number.isRequired,
    loadPod: PropTypes.func.isRequired,
  }
  state = {
    signStatus: 1,
    remark: '',
    photoList: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.podId && nextProps.podId !== this.props.podId) {
      this.props.loadPod(nextProps.podId).then((result) => {
        if (result.data) {
          const { sign_status, sign_remark, photos } = result.data;
          const photoList = [];
          if (photos && /^http/.test(photos)) {
            photos.split(',').forEach((ph, index) => {
              photoList.push({
                uid: -index,
                status: 'done',
                url: ph,
              });
            });
          }
          this.setState({
            signStatus: sign_status,
            remark: sign_remark,
            photoList,
          });
        }
      });
    }
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
  handleSubmit = () => {
    const {
      shipmtNo, submitter, dispId, parentDispId, loginId, tenantId, tenantName,
    } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const photos = photoList.map(ph => ph.url).join(',');
    this.props.saveSubmitPod(
      'enterprise', shipmtNo, dispId, parentDispId, submitter,
      signStatus, remark, photos, loginId, tenantId, tenantName
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('提交成功');
      }
    });
  }
  render() {
    const { rejected, form: { getFieldDecorator } } = this.props;
    const { signStatus, photoList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <Form layout="vertical">
        {rejected && <Alert message="客户拒绝接受此回单，建议重新上传提交" type="error" showIcon />}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="签收状态">
              <RadioGroup onChange={this.handleSignRadioChange} value={signStatus}>
                <Radio key="normal" value={1}>{this.msg('normalSign')}</Radio>
                <Radio key="abnormal" value={2}>{this.msg('abnormalSign')}</Radio>
                <Radio key="refused" value={3}>{this.msg('refusedSign')}</Radio>
              </RadioGroup>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="备注">
              {getFieldDecorator('remark', {
                rules: [{
                  type: 'string',
                  message: '备注',
                }],
              })(<TextArea placeholder="请填写备注" autosize />)}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Upload
              action={`${API_ROOTS.default}v1/upload/img/`}
              listType="picture-card"
              fileList={photoList}
              onChange={this.handlePhotoUpload}
              onRemove={this.handlePhotoRemove}
              withCredentials
            >
              {photoList.length >= 3 ? null : uploadButton}
            </Upload>
          </Col>
        </Row>
        <Button type="primary" onClick={this.handleSubmit}>提交</Button>
      </Form>
    );
  }
}
