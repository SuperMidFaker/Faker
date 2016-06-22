import React, { Component } from 'react';
import { Row, Button } from 'ant-ui';
import { connect } from 'react-redux';
import WLAccepForm from '../components/WLAccepForm';
import WLUploadGroup from '../components/WLUploadGroup';
import { createDelegation } from 'common/reducers/cmsDelegation';

const mockFormData = {
  client_name: 'zank',
  order_no: '订单号',
  invoice_no: '发票号',
  contract_no: '合同号',
  bl_wb_no: '提运单号',
  pieces: 5,
  weight: 10,
  trans_mode: '1',
  voyage_no: '航名航次号',
  decl_way_code: '1',
  ems_no: '备案号',
  trade_mode: '1',
  internal_no: 'dafadfad'
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  username: state.account.username
}), { createDelegation })
export default class AcceptanceFormContainer extends Component {
  handleMockDataBtnClick = () => {
    const form = this.refs.accepForm;
    form.setFieldsValue(mockFormData);
  }
  handleSaveBtnClick = () => {
    const { tenantId, loginId } = this.props;
    const form = this.refs.accepForm;
    const delegationInfo = form.getFieldsValue();
    delete delegationInfo.client_name;
    const tenantInfo = {customer_tenant_id: 27, ccb_tenant_id: tenantId, tenant_id: tenantId, creater_login_id: loginId};
    this.props.createDelegation({delegationInfo, tenantInfo, delg_type: 0});
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
