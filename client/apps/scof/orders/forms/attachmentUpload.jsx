/**
 * 附件上传的组件,只提供一个向外的接口用于表示已上传的文件
 * @param {}
 * @return {}
 *
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon, Button, message } from 'antd';

export default class AttchmentUpload extends Component {
  static propTypes = {
    onFileUpload: PropTypes.func,
    onFileRemove: PropTypes.func,
    onFileListUpdate: PropTypes.func, // 有任何一个附件改变时触发的回调函数, 参数为所有附件的文件
    files: PropTypes.array.isRequired,
  }
  state = {
    attachments: [],
  }
  componentWillMount() {
    this.setState({ attachments: this.props.files });
    if (this.props.onFileListUpdate) {
      this.props.onFileListUpdate(this.props.files);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.state.attachments.length) {
      this.setState({ attachments: nextProps.files });
      if (nextProps.onFileListUpdate) {
        nextProps.onFileListUpdate(nextProps.files);
      }
    }
  }
  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      if (this.state.attachments.filter(attach => attach.uid === info.file.uid).length === 0) {
        this.setState({
          attachments: [...this.state.attachments, info.file],
        });
      }
      return;
    }
    if (info.file.response.status !== 200) {
      message.error(info.file.response.msg);
      const nextFileList = [...this.state.attachments];
      nextFileList.splice(nextFileList.length - 1, 1);
      this.setState({
        attachments: nextFileList,
      });
      return;
    }
    const file = info.file;
    const nextFileList = [...this.state.attachments];
    const nextFile = {
      uid: file.uid,
      name: file.name,
      url: file.response.data,
      status: 'done',
    };
    nextFileList.splice(nextFileList.length - 1, 1, nextFile);
    this.setState({
      attachments: nextFileList,
    });
    const { onFileListUpdate, onFileUpload } = this.props;
    if (onFileListUpdate) {
      onFileListUpdate(nextFileList);
    }
    if (onFileUpload) {
      onFileUpload(nextFile);
    }
  }
  handleRemove = (file) => {
    const nextFileList = this.state.attachments.filter(f => f.name !== file.name);
    this.setState({ attachments: nextFileList });
    const { onFileListUpdate, onFileRemove } = this.props;
    if (onFileListUpdate) {
      onFileListUpdate(nextFileList);
    }
    if (onFileRemove) {
      onFileRemove(file);
    }
  }
  render() {
    return (
      <Upload listType="text" fileList={this.state.attachments}
        onRemove={this.handleRemove} onChange={this.handleChange}
        action={`${API_ROOTS.default}v1/upload/img/`} withCredentials
      >
        <Button type="ghost">
          <Icon type="upload" /> 点击上传附件
        </Button>
      </Upload>
    );
  }
}
