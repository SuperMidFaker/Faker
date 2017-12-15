import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Row, Col, Button, Upload, Modal, Progress, Switch, Tooltip, Icon } from 'antd';
import RateSourceTable from './rateSourceTable';
import RateEndTable from './rateEndTable';
import { loadRateEnds } from 'common/reducers/transportTariff';
import SearchBar from 'client/components/SearchBar';
import { getEndTableVarColumns } from './commodity';
import { createFilename } from 'client/util/dataTransform';

@connect(
  state => ({
    rateId: state.transportTariff.rateId,
    ratesEndList: state.transportTariff.ratesEndList,
    agreementRef: state.transportTariff.ratesRefAgreement,
    transModes: state.transportTariff.formParams.transModes,
    vehicleTypeParams: state.transportTariff.formParams.vehicleTypeParams,
    vehicleLengthParams: state.transportTariff.formParams.vehicleLengthParams,
    formData: state.transportTariff.agreement,
  }),
  { loadRateEnds }
)
export default class TariffRatesForm extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    rateId: PropTypes.string,
    loadRateEnds: PropTypes.func.isRequired,
    ratesEndList: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
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
        pageSize: 20,
        current: 1,
        searchValue: this.props.ratesEndList.searchValue,
      });
    } else if (info.file.status === 'error') {
      this.setState({ inUpload: false, uploadStatus: 'exception' });
      this.state.uploadChangeCount = 0;
    }
  }
  handleEndExport = () => {
    if (this.props.rateId) {
      const {
        agreementRef, transModes, vehicleTypeParams, vehicleLengthParams, rateId,
      } = this.props;
      const varColumns = getEndTableVarColumns(agreementRef, transModes, vehicleTypeParams, vehicleLengthParams).map(vc => vc.title);
      window.open(`${API_ROOTS.mongo}v1/transport/tariff/export/ratends/${createFilename('rate-ends')}.xlsx?rateId=${rateId}&columns=${JSON.stringify(varColumns)}`);
    }
  }
  handleSearch = (value) => {
    this.props.loadRateEnds({
      rateId: this.props.rateId,
      pageSize: 20,
      current: 1,
      searchValue: value,
    });
  }
  render() {
    const { type, formData, form: { getFieldDecorator } } = this.props;
    const {
      sourceModal, endModal, inUpload, uploadPercent, uploadStatus,
    } = this.state;
    return (
      <div style={{ padding: 10 }}>
        <div>
          <Row gutter={16}>
            <Col sm={6}>
              <Card bodyStyle={{ padding: 0 }}>
                <div className="toolbar">
                  {(type === 'create' || type === 'edit') && (
                    <Button icon="plus-circle-o"
                      onClick={this.handleSourceAdd}
                    >
                    添加
                    </Button>)}
                  <div className="toolbar-right">
                    <Tooltip title={
                      <div>
                        <div>模糊匹配： 计费时优先完全匹配四级地址和别名，其次模糊匹配四级地址，例如：始发地【上海市嘉定区】 会匹配到 始发地【上海市】 线路中</div>
                        <div>精确匹配： 计费时完全匹配四级地址和别名</div>
                      </div>
                    }
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                    <span>精确匹配: </span>
                    {getFieldDecorator('accurateMatch', {
                      valuePropName: 'checked',
                      initialValue: formData.accurateMatch,
})(<Switch disabled={!(type === 'create' || type === 'edit')}
  checkedChildren="是" unCheckedChildren="否"
/>)}
                  </div>
                </div>
                <RateSourceTable visibleModal={sourceModal} onChangeVisible={this.handleVisibleChange} type={type} />
              </Card>
            </Col>
            <Col sm={18}>
              <Card bodyStyle={{ padding: 0, textAlign: 'right' }}>
                <div style={{ padding: 8, textAlign: 'left' }}>
                  {(type === 'create' || type === 'edit') &&
                  <Button icon="plus-circle-o" onClick={this.handleEndAdd} disabled={!this.props.rateId}>
                    添加
                  </Button>}
                  {(type === 'create' || type === 'edit') &&
                  <span style={{ marginLeft: 8 }}>
                    <Upload accept=".xls,.xlsx" action={`${API_ROOTS.mongo}v1/transport/tariff/import/ratends`}
                      data={{ rateId: this.props.rateId }} onChange={this.handleImport}
                      showUploadList={false} withCredentials
                    >
                      <Button icon="upload" type="ghost">导入费率表</Button>
                    </Upload>
                  </span>}
                  <Button icon="plus-circle-o" onClick={this.handleEndExport} style={{ marginLeft: 8 }}>
                    导出费率表
                  </Button>
                  <span style={{ float: 'right', marginRight: 20 }}>
                    <SearchBar placeholder="目的地" onInputSearch={this.handleSearch} />
                  </span>
                </div>
                {
                  this.props.rateId &&
                  <RateEndTable visibleModal={endModal} onChangeVisible={this.handleVisibleChange} type={type} />
                }
              </Card>
            </Col>
          </Row>
        </div>
        <Modal maskClosable={false} closable={false} footer={[]} visible={inUpload}>
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </div>
    );
  }
}
