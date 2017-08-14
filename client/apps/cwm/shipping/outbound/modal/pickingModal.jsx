import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
    id: state.cwmOutbound.pickingModal.id,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
  }),
  { closePickingModal, pickConfirm, loadPickDetails, loadOutboundHead }
)
@Form.create()
export default class PickingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    pickMode: PropTypes.string,
    selectedRows: PropTypes.array,
    resetState: PropTypes.func,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.form.setFieldsValue({
        picked_qty: '',
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closePickingModal();
  }
  handleSubmit = () => {
    const { outboundNo, allocQty, skuPackQty, tenantId, loginId, pickMode, selectedRows, id } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const list = [];
        if (pickMode === 'single') {
          const data = {};
          data.id = id;
          if (values.picked_qty) {
            data.picked_qty = Number(values.picked_qty);
            data.picked_pack_qty = values.picked_qty / skuPackQty;
          } else {
            data.picked_qty = Number(allocQty);
            data.picked_pack_qty = allocQty / skuPackQty;
          }
          list.push(data);
        } else {
          for (let i = 0; i < selectedRows.length; i++) {
            const data = {};
            data.id = selectedRows[i].id;
            data.picked_qty = selectedRows[i].alloc_qty;
            data.picked_pack_qty = selectedRows[i].alloc_qty / selectedRows[i].sku_pack_qty;
            list.push(data);
          }
        }
        this.props.pickConfirm(outboundNo, list, loginId, tenantId, values.pickedBy, values.pickedDate).then((result) => {
          if (!result.error) {
            this.props.closePickingModal();
            this.props.resetState();
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, traceId, location, pickMode, username } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal title="拣货确认" maskClosable={false} onOk={this.handleSubmit} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          {pickMode === 'single' && <FormItem {...formItemLayout} label="目标库位" >
            {
              getFieldDecorator('targetLocation', {
                initialValue: location,
              })(<Input disabled />)
            }
          </FormItem>}
          {pickMode === 'single' && <FormItem {...formItemLayout} label="跟踪ID" >
            {
              getFieldDecorator('traceId', {
                initialValue: traceId,
              })(<Input disabled />)
            }
          </FormItem>}
          {pickMode === 'single' && <FormItem {...formItemLayout} label="拣货数量" >
            {
              getFieldDecorator('picked_qty')(<Input />)
            }
          </FormItem>}
          <FormItem {...formItemLayout} label="拣货人员" >
            {
              getFieldDecorator('pickedBy', {
                initialValue: username,
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="拣货时间" >
            {
              getFieldDecorator('pickedDate', {
                initialValue: moment(new Date()),
              })(<DatePicker showTime format="YYYY/MM/DD HH:mm" />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
