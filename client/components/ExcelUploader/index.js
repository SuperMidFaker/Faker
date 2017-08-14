import React from 'react';
import PropTypes from 'prop-types';
import { Progress, Upload, Modal } from 'antd';

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
  }
  handleImport = (info) => {
    if (this.state.uploadChangeCount === 0) {
      this.state.uploadChangeCount++;
      this.setState({ inUpload: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.state.uploadChangeCount++;
      this.setState({ uploadPercent: info.event.percent * 0.8 });
    } else if (info.file.status === 'done') {
      const reponseData = info.file.response.data;
      this.setState({ inUpload: false, uploadStatus: 'success' });
      this.state.uploadChangeCount = 0;
      if (this.props.onUploaded) {
        this.props.onUploaded(reponseData);
      }
    } else if (info.file.status === 'error') {
      this.setState({ inUpload: false, uploadStatus: 'exception' });
      this.state.uploadChangeCount = 0;
    }
  }
  render() {
    const { endpoint, formData, children } = this.props;
    const { inUpload, uploadPercent, uploadStatus } = this.state;
    return (
      <Upload accept=".xls,.xlsx" action={endpoint} showUploadList={false}
        data={formData} onChange={this.handleImport} withCredentials
      >
        {children}
        <Modal closable={false} maskClosable={false} footer={[]} visible={inUpload}>
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </Upload>
    );
  }
}
