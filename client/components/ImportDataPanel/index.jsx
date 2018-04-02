import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Icon, Radio, Select, Steps, Upload } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import UploadMask from '../UploadMask';
import { formatMsg } from './message.i18n';
import './style.less';

const { Option } = Select;
const { Dragger } = Upload;
const { Step } = Steps;

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
    skipMode: 2,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.adaptors !== this.props.adaptors) {
      this.setState({
        adaptor: '',
      });
    }
  }
  onChange = (e) => {
    this.setState({
      skipMode: e.target.value,
    });
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
      return;
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
  renderOptions() {
    const {
      children, adaptors,
    } = this.props;
    const { adaptor, skipMode } = this.state;
    return (<Form layout="vertical">
      {children}
      {adaptors &&
        <Form.Item label="数据适配器">
          <Select
            allowClear
            showSearch
            placeholder="选择数据适配器"
            onChange={this.handleAdaptorChange}
            value={adaptor}
            notFoundContent={this.msg('adaptorNotFound')}
          >
            {adaptors.map(opt => <Option value={opt.code} key={opt.code}>{opt.name}</Option>)}
          </Select>
        </Form.Item>
        }
      <Form.Item label="重复数据处理">
        <Radio.Group onChange={this.onChange} value={skipMode}>
          <Radio value={1}>覆盖原数据</Radio>
          <Radio value={2}>忽略重复数据</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>);
  }
  renderUpload() {
    const {
      endpoint, formData = {},
    } = this.props;
    return (<div style={{ height: 200, marginBottom: 16 }}>
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
    </div>);
  }
  render() {
    const {
      formData = {}, visible, title, onUploaded,
      template, onGenTemplate,
    } = this.props;

    const { importInfo, adaptor, skipMode } = this.state;
    if (adaptor) {
      formData.adaptor = adaptor;
    }
    formData.skipMode = skipMode;
    return (
      <DockPanel
        title={title || '导入'}
        size="middle"
        visible={visible}
        onClose={this.handleClose}
        className="welo-import-data-panel"
      >
        <Steps direction="vertical" size="small">
          <Step title="设置选项" status="wait" description={this.renderOptions()} />
          {adaptor === '' &&
          <Step
            title="下载模板"
            status="wait"
            description={(template || onGenTemplate) &&
              <Button
                icon="download"
                style={{ width: '100%', marginBottom: 16 }}
                onClick={this.handleDownloadTemplate}
              >
                下载模板
              </Button>}
          />}
          <Step title="上传文件" status="wait" description={this.renderUpload()} />
        </Steps>
        <UploadMask uploadInfo={importInfo} onUploaded={onUploaded} />
      </DockPanel>
    );
  }
}
