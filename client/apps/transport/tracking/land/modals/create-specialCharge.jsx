import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Modal, Radio } from 'antd';
import { showSpecialChargeModal, createSpecialCharge } from 'common/reducers/transportBilling';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.transportBilling.specialChargeModal.visible,
    dispId: state.transportBilling.specialChargeModal.dispId,
    spTenantId: state.transportBilling.specialChargeModal.spTenantId,
    shipmtNo: state.transportBilling.specialChargeModal.shipmtNo,
    type: state.transportBilling.specialChargeModal.type,
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
    shipmtNo: PropTypes.string.isRequired,
    createSpecialCharge: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    showSpecialChargeModal: PropTypes.func.isRequired,
    type: PropTypes.number.isRequired,
  }
  handleOk = () => {
    const {
      form, dispId, shipmtNo, loginName, loginId, tenantId,
    } = this.props;
    // console.log(dispId, shipmtNo, loginName, loginId, tenantId);
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.charge) {
      this.props.form.setFieldsValue({ charge: '', remark: '', type: 1 });
      let type = this.props.type;
      if (this.props.type !== -1 && this.props.type !== 1) {
        type = Number(fieldsValue.type);
      }
      this.props.createSpecialCharge({
        shipmtNo,
        dispId,
        type,
        remark: fieldsValue.remark,
        submitter: loginName,
        charge: Number(fieldsValue.charge),
        loginId,
        tenantId,
      }).then((result) => {
        this.handleCancel();
        if (result.error) {
          message.error(result.error);
        } else {
          message.info('添加成功');
        }
      });
    } else {
      message.error('请填写特殊费用金额');
    }
  }
  handleCancel = () => {
    this.props.showSpecialChargeModal({
      visible: false, type: -1, dispId: -1, shipmtNo: '', spTenantId: -2,
    });
  }
  render() {
    const { form: { getFieldDecorator }, spTenantId, type } = this.props;
    const colSpan = 6;
    return (
      <Modal maskClosable={false} title="添加特殊费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Form className="row" style={{ width: '400px' }}>
          {
            type !== -1 && type !== 1 ?
            (
              <FormItem label="类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
                {getFieldDecorator('type', {
                  initialValue: 1,
                })(<RadioGroup>
                  <RadioButton value={1}>向客户收取</RadioButton>
                  {spTenantId !== 0 && spTenantId !== -1 ? (<RadioButton value={-1}>向承运商支付</RadioButton>) : ''}
                </RadioGroup>)}
              </FormItem>
            ) : null
          }

          <FormItem label="金额" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('charge', {
              initialValue: '',
            })(<Input type="number" placeholder="请输入金额" addonAfter="元" />)}
          </FormItem>
          <FormItem label="备注" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            {getFieldDecorator('remark', {
              initialValue: '',
            })(<Input.TextArea id="control-textarea" rows="5" placeholder="请输入备注信息" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
