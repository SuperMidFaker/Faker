import React, { Component, PropTypes } from 'react';
import { Form, Row, Col, Button } from 'ant-ui';
import { connect } from 'react-redux';
import BasicForm from '../delegation/basicForm';
import UploadGroup from '../delegation/attachmentUpload';
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

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username
  }),
  { createDelegation }
)
@Form.create()
export default class AcceptanceCreate extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    type: PropTypes.oneOf([ 'import', 'export' ]),
  }
  handleMockDataBtnClick = () => {
    this.props.form.setFieldsValue(mockFormData);
  }
  handleSaveBtnClick = () => {
    const { tenantId, loginId, username } = this.props;
    const delegationInfo = this.props.form.getFieldsValue();
    delete delegationInfo.client_name;
    const tenantInfo = {customer_tenant_id: 27, ccb_tenant_id: tenantId, tenant_id: tenantId, creater_login_id: loginId, creater_login_name: username};
    this.props.createDelegation({delegationInfo, tenantInfo, delg_type: 0});
  }
  render() {
    const { form } = this.props;
    return (
      <div className="main-content">
        <div className="page-body" style={{padding: 16}}>
          <Form horizontal>
          <Row>
            <Col sm={16}>
              <BasicForm form={form} />
            </Col>
            <Col sm={8}>
              <UploadGroup />
            </Col>
          </Row>
          <Row>
            <Button size="large" type="primary" style={{marginRight: 20}} onClick={this.handleSaveBtnClick}>保存</Button>
            <Button size="large">一键接单</Button>
            <Button size="large" onClick={this.handleMockDataBtnClick} style={{marginLeft: 20}}>生成测试数据</Button>
          </Row>
          </Form>
        </div>
      </div>
    );
  }
}
