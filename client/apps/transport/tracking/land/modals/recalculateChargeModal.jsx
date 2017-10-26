import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, Alert } from 'antd';
import { updateFee, toggleRecalculateChargeModal } from 'common/reducers/shipment';
import { createSpecialCharge } from 'common/reducers/transportBilling';
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.shipment.recalculateChargeModal.visible,
    shipmtNo: state.shipment.recalculateChargeModal.shipmtNo,
    charges: state.shipment.charges,
  }),
  { updateFee, toggleRecalculateChargeModal, createSpecialCharge }
)

export default class RecalculateChargeModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    updateFee: PropTypes.func.isRequired,
    charges: PropTypes.object.isRequired,
    toggleRecalculateChargeModal: PropTypes.func.isRequired,
    createSpecialCharge: PropTypes.func.isRequired,
  }
  state = {
    revenue: 0,
    expense: 0,
  }
  handleOk = () => {
    const { shipmtNo, loginName, loginId, tenantId, charges } = this.props;
    const { revenue, expense } = this.state;
    if (revenue !== 0) {
      this.props.createSpecialCharge({
        shipmtNo,
        dispId: charges.revenue.disp_id,
        type: 1,
        remark: `手动修改收入：${charges.revenue.freight_charge} 改为 ${revenue}`,
        submitter: loginName,
        charge: revenue + charges.revenue.excp_charge - charges.revenue.freight_charge,
        loginId,
        tenantId,
      }).then(() => {
        this.props.updateFee(charges.revenue.disp_id, { need_recalculate: 0 });
        this.props.toggleRecalculateChargeModal(false);
      });
    }
    if (expense !== 0) {
      this.props.createSpecialCharge({
        shipmtNo,
        dispId: charges.expense.disp_id,
        type: -1,
        remark: `手动修改成本：${charges.expense.freight_charge} 改为 ${expense}`,
        submitter: loginName,
        charge: expense + charges.expense.excp_charge - charges.expense.freight_charge,
        loginId,
        tenantId,
      }).then(() => {
        this.props.updateFee(charges.expense.disp_id, { need_recalculate: 0 });
        this.props.toggleRecalculateChargeModal(false);
      });
    }
  }

  handleCancel = () => {
    this.props.toggleRecalculateChargeModal(false);
  }
  render() {
    const { intl, charges: { revenue, expense } } = this.props;
    return (
      <Modal maskClosable={false} title="修改费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Alert type="info" message="代垫费用需单独添加" />
        {revenue.need_recalculate === 1 &&
          <FormItem label={`原收入${intl.formatNumber((revenue.freight_charge + revenue.excp_charge).toFixed(2), { style: 'currency', currency: 'cny' })}`} >
            <Input
              type="number"
              placeholder="请填写收入"
              value={this.state.revenue} onChange={e => this.setState({ revenue: Number(e.target.value) })}
            />
          </FormItem>}
        {expense.need_recalculate === 1 &&
          <FormItem label={`原成本${intl.formatNumber((expense.freight_charge + expense.excp_charge).toFixed(2), { style: 'currency', currency: 'cny' })}`} >
            <Input
              type="number"
              placeholder="请填写成本"
              value={this.state.expense} onChange={e => this.setState({ expense: Number(e.target.value) })}
            />
          </FormItem>}
      </Modal>
    );
  }
}
