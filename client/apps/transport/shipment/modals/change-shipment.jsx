import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, message } from 'antd';
import { loadForm, showChangeShipmentModal } from 'common/reducers/shipment';
import { saveEdit } from 'common/reducers/transport-acceptance';
import ConsignInfo from '../forms/consign-info';
import GoodsInfo from '../forms/goods-info';
import ModeInfo from '../forms/mode-info';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.shipment.changeShipmentModal.visible,
    shipmtNo: state.shipment.changeShipmentModal.shipmtNo,
    type: state.shipment.changeShipmentModal.type,
    formData: state.shipment.formData,
  }),
  { loadForm, showChangeShipmentModal, saveEdit }
)
@Form.create()
export default class ChangeShipment extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    showChangeShipmentModal: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    formData: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.shipmtNo !== this.props.shipmtNo) {
      this.props.loadForm(null, {
        tenantId: this.props.tenantId,
        shipmtNo: nextProps.shipmtNo,
      });
    }
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const { formData, tenantId, loginId, type } = this.props;
        const form = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.saveEdit(form, tenantId, loginId, type)
        .then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            message.success(this.msg('changeShipmentSuccess'));
            this.handleCancel();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.showChangeShipmentModal({ visible: false, shipmtNo: '' });
  }
  renderForm() {
    const { form, intl, type } = this.props;
    if (type === 'consignerInfoChanged') {
      return (<ConsignInfo type="consigner" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={form} />);
    } else if (type === 'consigneeInfoChanged') {
      return (<ConsignInfo type="consignee" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={form} />);
    } else if (type === 'transitModeChanged') {
      return (<ModeInfo intl={intl} formhoc={form} />);
    } else if (type === 'timeInfoChanged') {
      return (<ModeInfo intl={intl} formhoc={form} />);
    } else if (type === 'goodsInfoChanged') {
      return (<GoodsInfo intl={intl} labelColSpan={8} formhoc={form} />);
    }
    return null;
  }
  render() {
    const { visible, formData } = this.props;
    return (
      <Modal title={`${this.msg('changeShipment')} ${formData.shipmt_no}`} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel} width="75%"
      >
        <div className="changeShipment">
          {this.renderForm()}
        </div>
      </Modal>
    );
  }
}
