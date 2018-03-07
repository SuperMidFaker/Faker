import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Select, Upload } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import UploadMask from '../UploadMask';
import { formatMsg } from './message.i18n';

const { Option } = Select;
const { Dragger } = Upload;

@injectIntl
export default class ImportDataPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    endpoint: PropTypes.string.isRequired,
    template: PropTypes.string,
    onGenTemplate: PropTypes.func,
    children: PropTypes.node,
    onUploaded: PropTypes.func,
    onClose: PropTypes.func,
    adaptors: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })),
  }
  state = {
    importInfo: {},
    adaptor: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.adaptors !== this.props.adaptors) {
      this.setState({
        adaptor: '',
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleUploadFile = (info) => {
    if (this.props.onBeforeUpload) {
      const upload = this.props.onBeforeUpload();
      if (!upload) {
        return;
      }
    }
    this.setState({ importInfo: info });
  }
  handleDownloadTemplate = () => {
    const { onGenTemplate, template } = this.props;
    if (onGenTemplate) {
      onGenTemplate();
    }
    window.open(template);
  }
  handleAdaptorChange = (value) => {
    this.setState({ adaptor: value });
  }
  handleBeforeUpload = () => {
    if (this.props.onBeforeUpload) {
      const upload = this.props.onBeforeUpload(true);
      return upload;
    }
    return true;
  }
  handleClose = () => {
    this.setState({ adaptor: '' });
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  render() {
    const {
      endpoint, formData = {}, children, visible, title, onUploaded,
      adaptors, template, onGenTemplate,
    } = this.props;
    const { importInfo, adaptor } = this.state;
    if (adaptor) {
      formData.adaptor = adaptor;
    }
    return (
      <DockPanel title={title || '导入'} size="small" visible={visible} onClose={this.handleClose}>
        <div style={{ marginBottom: 16 }}>
          {children}
        </div>
        {adaptors &&
        <Select
          allowClear
          showSearch
          placeholder="导入适配器"
          onChange={this.handleAdaptorChange}
          value={adaptor}
          notFoundContent={this.msg('adaptorNotFound')}
          style={{ width: '100%', marginBottom: 16 }}
        >
          {adaptors.map(opt => <Option value={opt.code} key={opt.code}>{opt.name}</Option>)}
        </Select>
        }
        <div style={{ height: 200, marginBottom: 16 }}>
          <Dragger
            accept=".xls,.xlsx,.csv"
            action={endpoint}
            showUploadList={false}
            data={{ data: JSON.stringify(formData) }}
            onChange={this.handleUploadFile}
            withCredentials
            beforeUpload={this.handleBeforeUpload}
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">点击或拖拽文件至此区域上传</p>
          </Dragger>
        </div>
        {(template || onGenTemplate) && <Button
          icon="download"
          style={{ width: '100%' }}
          onClick={this.handleDownloadTemplate}
        >
          下载模板
        </Button>}
        <UploadMask uploadInfo={importInfo} onUploaded={onUploaded} />
      </DockPanel>
    );
  }
}
