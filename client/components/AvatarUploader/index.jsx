
import React from 'react';
import { Upload, Icon, message } from 'antd';
import PropTypes from 'prop-types';

function getBase64(img, callback) {
  const reader = new window.FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isPNG = file.type === 'image/png';
  if (!isPNG) {
    message.error('You can only upload PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isPNG && isLt2M;
}

export default class AvatarUploader extends React.Component {
  static propTypes = {
    afterUpload: PropTypes.func,
    url: PropTypes.string,
  }
  state = {
    imageUrl: '',
    loading: false,
  };
  componentWillMount() {
    this.setState({
      imageUrl: this.props.url,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.props.url) {
      this.setState({
        imageUrl: nextProps.url,
      });
    }
  }
  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        this.setState({
          imageUrl,
          loading: false,
        });
      });
    }
    if (info.file.response && info.file.response.status === 200) {
      this.props.afterUpload(info.file.response.data);
    }
  }
  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传图标</div>
      </div>
    );
    const { imageUrl } = this.state;
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        withCredentials
        action={`${API_ROOTS.default}v1/upload/img/`}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="" /> : uploadButton}
      </Upload>
    );
  }
}
