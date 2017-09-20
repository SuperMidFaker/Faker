import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Progress, Upload, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const Dragger = Upload.Dragger;
const formatMsg = format(messages);

@injectIntl
export default class ImportDataPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    endpoint: PropTypes.string.isRequired,
    template: PropTypes.string,
    children: PropTypes.node,
    formData: PropTypes.object,
    onUploaded: PropTypes.func,
    onClose: PropTypes.func,
  }
  state = {
    uploadChangeCount: 0,
    uploading: false,
    uploadPercent: 10,
    uploadStatus: 'active',
    fileList: [],
  }
  handleUploadFile = (info) => {
    if (this.state.uploadChangeCount === 0) {
      this.state.uploadChangeCount++;
      this.setState({ uploading: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.state.uploadChangeCount++;
      this.setState({ uploadPercent: info.event.percent * 0.8 });
    } else if (info.file.status === 'done') {
      const reponseData = info.file.response.data;
      message.success(`${info.file.name} file uploaded successfully.`);
      this.setState({ uploading: false, uploadStatus: 'success' });
      this.state.uploadChangeCount = 0;
      if (this.props.onUploaded) {
        this.props.onUploaded(reponseData);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
      this.setState({ uploading: false, uploadStatus: 'exception' });
      this.state.uploadChangeCount = 0;
    }
  }
  handleDownloadTemplate = () => {
    const { template } = this.props;
    window.open(template);
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { endpoint, formData, children, visible, title, onClose } = this.props;
    const { uploading, uploadPercent, uploadStatus } = this.state;
    return (
      <DockPanel title={title || '导入'} size="small" visible={visible} onClose={onClose}>
        <div style={{ height: 300, marginBottom: 24 }}>
          <Dragger accept=".xls,.xlsx" action={endpoint} showUploadList={false}
            data={formData} onChange={this.handleUploadFile} withCredentials
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
          </Dragger>
        </div>
        <Button size="large" icon="download" style={{ width: '100%' }} onClick={this.handleDownloadTemplate}>下载数据模板</Button>
        {children}
        <Modal closable={false} maskClosable={false} footer={[]} visible={uploading}>
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </DockPanel>
    );
  }
}
