import React, { Component } from 'react';
import { Row, Button } from 'ant-ui';
import WLAccepForm from './components/WLAccepForm';
import WLUploadGroup from './components/WLUploadGroup';

const mockFormData = {
  client_name: 'zank',
  order_no: '订单号',
  invoice_no: '发票号',
  contract_no: '合同号',
  bl_wb_no: '提运单号',
  pieces: 5,
  weight: 10,
  trans_mode: '运输1',
  voyage_no: '航名航次号',
  decl_way_code: '报关1',
  ems_no: '备案号',
  trade_no: '贸易1',
  internal_no: 'dafadfad'
};

export default class AcceptanceForm extends Component {
  handleMockDataBtnClick = () => {
    const form = this.refs.accepForm;
    form.setFieldsValue(mockFormData);
  }
  handleSaveBtnClick = () => {
    const form = this.refs.accepForm;
  }
  render() {
    return (
      <div className="main-content">
        <div className="page-body" style={{padding: 16}}>
          <WLAccepForm ref="accepForm"/>
          <WLUploadGroup ref="uploadGroup"/>
          <Row>
            <Button size="large" type="primary" style={{marginRight: 20}} onClick={this.handleSaveBtnClick}>保存</Button>
            <Button size="large">一键接单</Button>
            <Button size="large" onClick={this.handleMockDataBtnClick} style={{marginLeft: 20}}>生成测试数据</Button>
          </Row>
        </div>
      </div>
    );
  }
}
