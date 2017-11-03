import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Upload } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import UploadMask from '../UploadMask';
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
    importInfo: {},
  }
  handleUploadFile = (info) => {
    this.setState({ importInfo: info });
  }
  handleDownloadTemplate = () => {
    const { template } = this.props;
    window.open(template);
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { endpoint, formData, children, visible, title, onClose, onUploaded } = this.props;
    const { importInfo } = this.state;
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
        <Button icon="download" style={{ width: '100%' }} onClick={this.handleDownloadTemplate}>下载数据模板</Button>
        {children}
        <UploadMask uploadInfo={importInfo} onUploaded={onUploaded} />
      </DockPanel>
    );
  }
}
