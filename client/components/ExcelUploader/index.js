import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Progress, Upload, Modal } from 'antd';

export default class ExcelUploader extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    formData: PropTypes.object,
    onUploaded: PropTypes.func,
  }
  state = {
    uploadChangeCount: 0,
    inUpload: false,
    uploadPercent: 10,
    uploadStatus: 'active',
    errorMsg: '',
    closable: false,
  }
  handleImport = (info) => {
    if (this.state.uploadChangeCount === 0) {
      this.state.uploadChangeCount++;
      this.setState({ inUpload: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.state.uploadChangeCount++;
      this.setState({ uploadPercent: info.event.percent * 0.8 });
    } else if (info.file.status === 'done') {
      const response = info.file.response;
      this.state.uploadChangeCount = 0;
      if (response.status !== 200) {
        this.setState({ uploadStatus: 'exception', errorMsg: response.msg, closable: true });
      } else {
        this.setState({ inUpload: false, uploadStatus: 'success' });
        if (this.props.onUploaded) {
          this.props.onUploaded(response.data);
        }
      }
    } else if (info.file.status === 'error') {
      this.setState({ uploadStatus: 'exception', errorMsg: '文件处理超时, 请考虑分批导入', closable: true });
      this.state.uploadChangeCount = 0;
    }
  }
  handleCancel = () => { this.setState({ inUpload: false, errorMsg: '', closable: false }); }
  render() {
    const { endpoint, formData, children } = this.props;
    const { inUpload, uploadPercent, uploadStatus, errorMsg, closable } = this.state;
    return (
      <Upload accept=".xls,.xlsx" action={endpoint} showUploadList={false}
        data={formData} onChange={this.handleImport} withCredentials
      >
        {children}
        <Modal maskClosable={false} closable={closable} footer={[]} visible={inUpload} onCancel={this.handleCancel}>
          {errorMsg && <Alert message={errorMsg} showIcon type="error" /> }
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </Upload>
    );
  }
}
