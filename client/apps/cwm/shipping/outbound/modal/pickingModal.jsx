import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Form, Modal, Input } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closePickingModal, pickConfirm, loadPickDetails, loadOutboundHead } from 'common/reducers/cwmOutbound';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.pickingModal.visible,
    traceId: state.cwmOutbound.pickingModal.traceId,
    location: state.cwmOutbound.pickingModal.location,
    allocQty: state.cwmOutbound.pickingModal.allocQty,
    skuPackQty: state.cwmOutbound.pickingModal.skuPackQty,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { closePickingModal, pickConfirm, loadPickDetails, loadOutboundHead }
)
@Form.create()
export default class PickingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shippingMode: PropTypes.string,
    outboundNo: PropTypes.string.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closePickingModal();
  }
  handleSubmit = () => {
    const { outboundNo, allocQty, skuPackQty, tenantId, loginId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {};
        data.trace_id = values.traceId;
        if (values.picked_qty) {
          data.picked_qty = Number(values.picked_qty);
          data.picked_pack_qty = values.picked_qty / skuPackQty;
        } else {
          data.picked_qty = Number(allocQty);
          data.picked_pack_qty = allocQty / skuPackQty;
        }
        this.props.pickConfirm(outboundNo, [data], loginId, tenantId, values.pickedBy, values.pickedDate).then((result) => {
          if (!result.error) {
            this.props.closePickingModal();
            this.props.loadPickDetails(this.props.outboundNo);
            this.props.loadOutboundHead(this.props.outboundNo);
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, traceId, location } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal title="拣货确认" maskClosable={false} onOk={this.handleSubmit} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="目标库位" >
            {
              getFieldDecorator('targetLocation', {
                initialValue: location,
              })(<Input disabled />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="目标跟踪号" >
            {
              getFieldDecorator('traceId', {
                initialValue: traceId,
              })(<Input disabled />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="拣货人员" >
            {
              getFieldDecorator('pickedBy')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="拣货数量" >
            {
              getFieldDecorator('picked_qty')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="拣货时间" >
            {
              getFieldDecorator('pickedDate')(<DatePicker />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
