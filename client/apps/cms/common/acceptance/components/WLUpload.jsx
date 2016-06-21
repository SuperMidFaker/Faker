/**
 * 对antd的Upload组件进行封装
 * @param {}
 * @return {}
 */
import React, { PropTypes, Component } from 'react';
import { Upload, Card, Icon, Button } from 'ant-ui';

export default class WLUpload extends Component {
  static propTypes = {
    title: PropTypes.string,
    onChange: PropTypes.func,     // 上传完成时执行的回调,参数为已上传的fileList
  }
  state = {
    fileList: []
  }
  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    const { onChange } = this.props;
    const file = info.file;
    const prevFileList = this.state.fileList;
    const nextFileList = [...prevFileList, {uid: file.uid, name: file.name, status: 'success', originFileObj: file.originFileObj}];
    this.setState({fileList: nextFileList});
    if (onChange) {
      onChange(nextFileList);
    }
  }
  handleRemove = (file) => {
    const nextFileList = this.state.fileList.filter(f => f.name !== file.name);
    this.setState({fileList: nextFileList});
  }
  render() {
    const { title } = this.props;
    return (
      <Card title={title}>
        <Upload listType="text"
                fileList={this.state.fileList}
                onRemove={this.handleRemove}
                onChange={this.handleChange}>
          <Button type="ghost">
            <Icon type="upload" /> 点击上传
          </Button>
        </Upload>
      </Card>
    );
  }
}
