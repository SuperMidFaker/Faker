/**
 * 附件上传的组件,只提供一个向外的接口用于表示已上传的文件
 * @param {}
 * @return {}
 *
 */
import React, { PropTypes, Component } from 'react';
import { Upload, Card, Icon, Button, message } from 'ant-ui';

export default class AttchmentUpload extends Component {
  static propTypes = {
    onFileListUpdate: PropTypes.func,    // 有任何一个附件改变时触发的回调函数, 参数为所有附件的文件
  }
  state = {
    attachments: [],
  }
  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.response.status !== 200) {
      message.error(info.file.response.msg);
      return;
    }
    const { onFileListUpdate } = this.props;
    const file = info.file;
    const prevFileList = this.state.attachments;
    const nextFileList = [ ...prevFileList, {
      uid: file.uid, name: file.name,
      url: file.response.data,
    }];
    this.setState({
      attachments: nextFileList,
    });
    if (onFileListUpdate) {
      onFileListUpdate(nextFileList);
    }
  }
  handleRemove = (file) => {
    const { onFileListUpdate } = this.props;
    const nextFileList = this.state.attachments.filter(f => f.name !== file.name);
    this.setState({ attachments: nextFileList });
    if (onFileListUpdate) {
      onFileListUpdate(nextFileList);
    }
  }
  render() {
    return (
        <Card title="附件">
          <Upload listType="text" fileList={this.state.attachments}
            onRemove={this.handleRemove} onChange={this.handleChange}
            action="/v1/upload/img/"
          >
            <Button type="ghost">
              <Icon type="upload" /> 点击上传
            </Button>
          </Upload>
        </Card>
    );
  }
}
