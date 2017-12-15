import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Progress, Modal } from 'antd';

export default class UploadMask extends React.Component {
  static propTypes = {
    onUploaded: PropTypes.func,
    uploadInfo: PropTypes.shape({
      file: PropTypes.PropTypes.shape({ status: PropTypes.string.isRequired }),
    }),
  }
  constructor(...args) {
    super(...args);
    this.uploadChangeCount = 0;
    this.startTimestamp = Date.now();
    this.state = {
      inUpload: false,
      uploadPercent: 10,
      uploadStatus: 'active',
      errorMsg: '',
      closable: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.uploadInfo !== this.props.uploadInfo) {
      this.handleUpload(nextProps.uploadInfo);
    }
  }
  handleUpload = (info) => {
    if (this.uploadChangeCount === 0) {
      this.startTimestamp = Date.now();
      this.uploadChangeCount += 1;
      this.setState({ inUpload: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.uploadChangeCount += 1;
      this.setState({ uploadPercent: info.event.percent * 0.8 });
    } else if (info.file.status === 'done') {
      const { response } = info.file;
      this.uploadChangeCount = 0;
      if (response.status !== 200) {
        this.setState({ uploadStatus: 'exception', errorMsg: response.msg, closable: true });
      } else {
        this.setState({ inUpload: false, uploadStatus: 'success' });
        if (this.props.onUploaded) {
          this.props.onUploaded(response.data);
        }
      }
    } else if (info.file.status === 'error') {
      let errorMsg = '文件处理超时,请考虑分批导入';
      if (Date.now() - this.startTimestamp < 60 * 60 * 1000) { // 1min以内提示网络问题
        errorMsg = '上传失败,检查网络连接或者询问应用服务是否正常';
      }
      this.setState({ uploadStatus: 'exception', errorMsg, closable: true });
      this.uploadChangeCount = 0;
    }
  }
  handleCancel = () => { this.setState({ inUpload: false, errorMsg: '', closable: false }); }
  render() {
    const {
      inUpload, uploadPercent, uploadStatus, errorMsg, closable,
    } = this.state;
    if (!inUpload) {
      return null;
    }
    return (
      <Modal
        maskClosable={false}
        closable={closable}
        footer={[]}
        visible={inUpload}
        onCancel={this.handleCancel}
      >
        {errorMsg && <Alert message={errorMsg} showIcon type="error" /> }
        <Progress
          type="circle"
          percent={uploadPercent}
          status={uploadStatus}
          style={{ display: 'block', margin: '0 auto', width: '40%' }}
        />
      </Modal>
    );
  }
}

