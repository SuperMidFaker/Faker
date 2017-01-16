import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Row, Col, Button, Upload, Modal, Progress } from 'antd';
import RateSourceTable from './rateSourceTable';
import RateEndTable from './rateEndTable';
import { loadRateEnds } from 'common/reducers/transportTariff';

@connect(
  state => ({
    rateId: state.transportTariff.rateId,
  }),
  { loadRateEnds }
)
export default class TariffRatesForm extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    rateId: PropTypes.string,
    loadRateEnds: PropTypes.func.isRequired,
  }
  state = {
    sourceModal: false,
    endModal: false,
    uploadChangeCount: 0,
    inUpload: false,
    uploadPercent: 10,
    uploadStatus: 'active',
  }
  handleSourceAdd = () => {
    this.setState({ sourceModal: true });
  }
  handleEndAdd = () => {
    this.setState({ endModal: true });
  }
  handleVisibleChange = (type, visible) => {
    if (type === 'source') {
      this.setState({ sourceModal: visible });
    } else if (type === 'end') {
      this.setState({ endModal: visible });
    }
  }
  handleImport = (info) => {
    if (this.state.uploadChangeCount === 0) {
      this.state.uploadChangeCount++;
      this.setState({ inUpload: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.state.uploadChangeCount++;
      this.setState({ uploadPercent: info.event.percent });
    } else if (info.file.status === 'done') {
      this.setState({ inUpload: false, uploadStatus: 'success' });
      this.state.uploadChangeCount = 0;
      this.props.loadRateEnds({
        rateId: this.props.rateId,
        pageSize: 10,
        current: 1,
      });
    } else if (info.file.status === 'error') {
      this.setState({ inUpload: false, uploadStatus: 'exception' });
      this.state.uploadChangeCount = 0;
    }
  }
  render() {
    const { type } = this.props;
    const { sourceModal, endModal, inUpload, uploadPercent, uploadStatus } = this.state;
    return (
      <div style={{ padding: 10 }}>
        <div>
          <Row gutter={16}>
            <Col sm={6}>
              <Card bodyStyle={{ padding: 0 }}>
                {(type === 'create' || type === 'edit') && (<div style={{ padding: '8px 8px' }}>
                  <Button icon="plus-circle-o"
                    onClick={this.handleSourceAdd}
                  >
                    添加
                  </Button>
                </div>)}
                <RateSourceTable visibleModal={sourceModal} onChangeVisible={this.handleVisibleChange} type={type} />
              </Card>
            </Col>
            <Col sm={18}>
              <Card bodyStyle={{ padding: 0 }}>
                {(type === 'create' || type === 'edit') && (
                  <div style={{ padding: 8 }}>
                    <Button icon="plus-circle-o"
                      onClick={this.handleEndAdd} disabled={!this.props.rateId}
                    >
                    添加
                  </Button>
                    <span style={{ marginLeft: 8 }}>
                      <Upload accept=".xls,.xlsx" action={`${API_ROOTS.mongo}v1/transport/tariff/import/ratends`}
                        data={{ rateId: this.props.rateId }} onChange={this.handleImport}
                        showUploadList={false} withCredentials
                      >
                        <Button icon="upload" type="ghost">导入费率表</Button>
                      </Upload>
                    </span>
                  </div>)}
                {
                  this.props.rateId &&
                  <RateEndTable visibleModal={endModal} onChangeVisible={this.handleVisibleChange} type={type} />
                }
              </Card>
            </Col>
          </Row>
        </div>
        <Modal closable={false} maskClosable={false} footer={[]} visible={inUpload}>
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </div>
    );
  }
}
