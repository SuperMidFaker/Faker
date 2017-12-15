import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Select, Upload } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import UploadMask from '../UploadMask';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const Option = Select.Option;
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
    adaptors: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })),
  }
  state = {
    importInfo: {},
    adaptor: '',
  }
  handleUploadFile = (info) => {
    this.setState({ importInfo: info });
  }
  handleDownloadTemplate = () => {
    const { template } = this.props;
    window.open(template);
  }
  handleAdaptorChange = (value) => {
    this.setState({ adaptor: value });
  }
  handleClose = () => {
    this.setState({ adaptor: '' });
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const {
      endpoint, formData = {}, children, visible, title, onUploaded, adaptors,
    } = this.props;
    const { importInfo, adaptor } = this.state;
    if (adaptor) {
      formData.adaptor = adaptor;
    }
    return (
      <DockPanel title={title || '导入'} size="small" visible={visible} onClose={this.handleClose}>
        <div style={{ marginBottom: 10 }}>
          {children}
        </div>
        {adaptors &&
        <Select allowClear showSearch placeholder="导入适配器"
          onChange={this.handleAdaptorChange} style={{ width: '100%', marginBottom: 10 }}
        >
          {adaptors.map(opt => <Option value={opt.code} key={opt.code}>{opt.name}</Option>)}
        </Select>
        }
        <div style={{ height: 300, marginBottom: 24 }}>
          <Dragger accept=".xls,.xlsx" action={endpoint} showUploadList={false}
            data={{ data: JSON.stringify(formData) }} onChange={this.handleUploadFile} withCredentials
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">点击或拖拽文件至此区域上传</p>
          </Dragger>
        </div>
        <Button icon="download" style={{ width: '100%' }} onClick={this.handleDownloadTemplate}>下载标准导入模板</Button>
        <UploadMask uploadInfo={importInfo} onUploaded={onUploaded} />
      </DockPanel>
    );
  }
}
