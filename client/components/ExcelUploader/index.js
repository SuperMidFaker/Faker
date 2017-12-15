import React from 'react';
import PropTypes from 'prop-types';
import { Upload } from 'antd';
import UploadMask from '../UploadMask';

export default class ExcelUploader extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    formData: PropTypes.object,
    onUploaded: PropTypes.func,
  }
  state = {
    importInfo: {},
  }
  handleImport = (info) => {
    this.setState({ importInfo: info });
  }
  render() {
    const {
      endpoint, formData, children, onUploaded,
    } = this.props;
    const { importInfo } = this.state;
    return (
      <Upload accept=".xls,.xlsx" action={endpoint} showUploadList={false}
        data={formData} onChange={this.handleImport} withCredentials
      >
        {children}
        <UploadMask uploadInfo={importInfo} onUploaded={onUploaded} />
      </Upload>
    );
  }
}
