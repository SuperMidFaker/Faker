import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Modal, Radio } from 'antd';
import { createSpecialCharge } from 'common/reducers/trackingLandException';
import { showSpecialChargeModal } from 'common/reducers/trackingLandStatus';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.trackingLandStatus.shipmentSpecialChargeModal.visible,
    dispId: state.trackingLandStatus.shipmentSpecialChargeModal.dispId,
    spTenantId: state.trackingLandStatus.shipmentSpecialChargeModal.spTenantId,
    parentDispId: state.trackingLandStatus.shipmentSpecialChargeModal.parentDispId,
    shipmtNo: state.trackingLandStatus.shipmentSpecialChargeModal.shipmtNo,
  }),
  { createSpecialCharge, showSpecialChargeModal }
)
@Form.create()
export default class CreateSpecialCharge extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    spTenantId: PropTypes.number.isRequired,
    parentDispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    createSpecialCharge: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    showSpecialChargeModal: PropTypes.func.isRequired,

  }
  handleOk = () => {
    const { form, dispId, parentDispId, shipmtNo, loginName, loginId, tenantId } = this.props;
    // console.log(dispId, parentDispId, shipmtNo, loginName, loginId, tenantId);
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.charge) {
      this.props.form.setFieldsValue({ charge: '', remark: '', type: '1' });
      const type = Number(fieldsValue.type);
      this.props.createSpecialCharge({
        shipmtNo,
        dispId: type === 1 ? parentDispId : dispId,
        type,
        remark: fieldsValue.remark,
        submitter: loginName,
        charge: Number(fieldsValue.charge),
        loginId,
        tenantId,
      }).then((result) => {
        if (result.error) {
          message.error(result.error);
        } else {
          this.handleCancel();
          message.info('添加成功');
        }
      });
    } else {
      message.error('请填写特殊费用金额');
    }
  }
  handleCancel = () => {
    this.props.showSpecialChargeModal({ visible: false, dispId: -1, shipmtNo: '', parentDispId: -1, spTenantId: -2 });
  }
  render() {
    const { form: { getFieldDecorator }, spTenantId } = this.props;
    const colSpan = 6;
    return (
      <Modal title="添加特殊费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('type', {
              initialValue: '1',
            })(<RadioGroup>
              <RadioButton value="1">应收</RadioButton>
              {spTenantId !== 0 && spTenantId !== -1 ? (<RadioButton value="-1">应付</RadioButton>) : ''}
            </RadioGroup>)}
          </FormItem>
          <FormItem label="金额" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('charge', {
              initialValue: '',
            })(<Input type="number" placeholder="请输入金额" addonAfter="元" />)}
          </FormItem>
          <FormItem label="备注" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('remark', {
              initialValue: '',
            })(
              <Input type="textarea" id="control-textarea" rows="5" placeholder="请输入备注信息" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
