import React, { PropTypes, Component } from 'react';
import { Row, Col } from 'ant-ui';
import WLUpload from './WLUpload';

export default class WLUploadGroup extends Component {
  render() {
    return (
      <Row gutter={16} style={{marginTop: 16, marginBottom: 16}}>
        <Col sm={6}>
          <WLUpload title="发票" onFileListUpdate={fileList => console.log(fileList)}/>
        </Col>
        <Col sm={6}>
          <WLUpload title="合同"/>
        </Col>
        <Col sm={6}>
          <WLUpload title="箱单"/>
        </Col>
        <Col sm={6}>
          <WLUpload title="其他"/>
        </Col>
      </Row>
    );
  }
}
