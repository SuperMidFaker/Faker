import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Progress, Upload, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class ImportDataDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    endpoint: PropTypes.string.isRequired,
    template: PropTypes.string,
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
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { endpoint, formData, children, visible, title } = this.props;
    const { inUpload, uploadPercent, uploadStatus } = this.state;
    return (
      <DockPanel size="small" visible={visible} onClose={this.props.hidePreferenceDock}
        title={title || '导入'}
      >
        <Upload accept=".xls,.xlsx" action={endpoint} showUploadList={false}
          data={formData} onChange={this.handleImport} withCredentials
        >
          <Button type="primary"><Icon type="upload" /> 点击选择文件上传</Button>
        </Upload>
        <Button><Icon type="download" /> 点击下载数据模板</Button>
        {children}
        <Modal closable={false} maskClosable={false} footer={[]} visible={inUpload}>
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </DockPanel>
    );
  }
}
