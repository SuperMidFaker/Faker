/**
 * 附件上传的组件,只提供一个向外的接口用于表示已上传的文件
 * @param {}
 * @return {}
 *
 */
import React, { PropTypes, Component } from 'react';
import { Row, Col } from 'ant-ui';
import WLUpload from './WLUpload';

const FILE_TYPE = {
  INVOICE: 'invoice',
  AGREEMENT: 'agreement',
  PACKING: 'packing',
  OTHERS: 'others'
};

export default class WLUploadGroup extends Component {
  static propTypes = {
    onFileListUpdate: PropTypes.func,    // 有任何一个附件改变时触发的回调函数, 参数为所有附件的文件
  }
  state = {
    invoice: [],
    agreement: [],
    packing: [],
    others: []
  }
  handleFileListChange = (fileList, fileType) => {
    const { onFileListUpdate } = this.props;
    const allFiles = this.state;
    allFiles[fileType] = fileList;
    this.setState({...allFiles});
    if (onFileListUpdate) {
      onFileListUpdate(allFiles);
    }
  }
  render() {
    return (
      <Row gutter={16} style={{marginTop: 16, marginBottom: 16}}>
        <Col sm={6}>
          <WLUpload title="发票" onFileListUpdate={fileList => this.handleFileListChange(fileList, FILE_TYPE.INVOICE)}/>
        </Col>
        <Col sm={6}>
          <WLUpload title="合同" onFileListUpdate={fileList => this.handleFileListChange(fileList, FILE_TYPE.AGREEMENT)}/>
        </Col>
        <Col sm={6}>
          <WLUpload title="箱单" onFileListUpdate={fileList => this.handleFileListChange(fileList, FILE_TYPE.PACKING)}/>
        </Col>
        <Col sm={6}>
          <WLUpload title="其他" onFileListUpdate={fileList => this.handleFileListChange(fileList, FILE_TYPE.OTHERS)}/>
        </Col>
      </Row>
    );
  }
}
