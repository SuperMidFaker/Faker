import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, DatePicker, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeDateModal, saveBatchPickOrDeliverDate } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.trackingLandStatus.dateModal.visible,
    type: state.trackingLandStatus.dateModal.type,
    shipments: state.trackingLandStatus.dateModal.shipments,
  }),
  { closeDateModal, saveBatchPickOrDeliverDate }
)
@Form.create()
export default class PickupDeliverUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    shipments: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    onOK: PropTypes.func,
    closeDateModal: PropTypes.func.isRequired,
    saveBatchPickOrDeliverDate: PropTypes.func.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { form, type, shipments, onOK, loginId, loginName, tenantId, tenantName } = this.props;
        const { actDate } = form.getFieldsValue();
        this.props.saveBatchPickOrDeliverDate({ type, shipments: JSON.stringify(shipments), actDate, loginId, tenantId, loginName, tenantName }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.props.closeDateModal();
              form.resetFields();
              onOK();
            }
          });
      }
    });
  }
  handleCancel = () => {
    this.props.closeDateModal();
    this.props.form.resetFields();
  }
  render() {
    const { form: { getFieldProps } } = this.props;
    const colSpan = 6;
    let title;
    let ruleMsg;
    if (this.props.type === 'pickup') {
      title = this.msg('pickupModalTitle');
      ruleMsg = this.msg('pickupTimeMust');
    } else {
      title = this.msg('deliverModalTitle');
      ruleMsg = this.msg('deliverTimeMust');
    }

    return (
      <Modal title={title} onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('chooseActualTime')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }} required
          >
            <DatePicker showTime format="yyyy-MM-dd HH:mm:ss"
              {...getFieldProps('actDate', {
                rules: [{
                  type: 'date', required: true, message: ruleMsg,
                }],
              })}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
