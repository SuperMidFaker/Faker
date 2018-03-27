import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Select, DatePicker, Form, Modal, Input, Radio, message } from 'antd';
import { closeShippingModal, shipConfirm, shipBatchSoConfirm } from 'common/reducers/cwmOutbound';
import { WRAP_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.shippingModal.visible,
    pickedQty: state.cwmOutbound.shippingModal.pickedQty,
    skuPackQty: state.cwmOutbound.shippingModal.skuPackQty,
    id: state.cwmOutbound.shippingModal.id,
    loginId: state.account.loginId,
    username: state.account.username,
    submitting: state.cwmOutbound.submitting,
  }),
  {
    closeShippingModal, shipConfirm, shipBatchSoConfirm,
  }
)
@Form.create()
export default class ShippingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    shipMode: PropTypes.oneOf(['single', 'batch', 'batchSo']).isRequired,
    selectedRows: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.shape({ picked_qty: PropTypes.number }),
      PropTypes.string])),
    onShipped: PropTypes.func,
  }
  state = {
    shippingMode: 0,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeShippingModal();
    this.props.form.resetFields();
  }
  handleChange = (ev) => {
    this.setState({ shippingMode: ev.target.value });
  }
  handleConfirmResult = (result) => {
    if (!result.error) {
      this.props.closeShippingModal();
      if (this.props.onShipped) {
        this.props.onShipped();
      }
    } else if (result.error.message === 'normal_relno_empty') {
      message.error('对应保税普通出库未完成备案');
    } else if (result.error.message === 'normal_cusdeclno_empty') {
      message.error('对应保税普通出库未完成清关');
    } else {
      message.error(result.error.message);
    }
  }
  handleSubmit = () => {
    const {
      outboundNo, skuPackQty, pickedQty, username, shipMode, selectedRows, id,
    } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const outbounddata = {
          pieces: values.pieces,
          volumes: values.volumes,
          pack_type: values.pack,
          waybill: values.waybill,
          drop_id: '',
          shipped_type: this.state.shippingMode,
        };
        if (shipMode === 'batchSo') {
          outbounddata.shipped_by = values.shippedBy;
          outbounddata.shipped_date = values.shippedDate;
          this.props.shipBatchSoConfirm(
            outbounddata,
            selectedRows,
          ).then(this.handleConfirmResult);
        } else {
          outbounddata.no = outboundNo;
          let list = [];
          if (shipMode === 'single') {
            list.push({
              id,
              shipped_qty: pickedQty,
              shipped_pack_qty: pickedQty / skuPackQty,
            });
          } else {
            list = selectedRows.filter(sr => sr.picked_qty > 0 && sr.picked_qty > sr.shipped_qty)
              .map(sr => ({
                id: sr.id,
                shipped_qty: sr.picked_qty - sr.shipped_qty,
                shipped_pack_qty: (sr.picked_qty - sr.shipped_qty) / sr.sku_pack_qty,
              }));
          }
          this.props.shipConfirm(
            outbounddata, list, username,
            values.shippedBy, values.shippedDate
          ).then(this.handleConfirmResult);
        }
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, username, submitting } = this.props;
    const { shippingMode } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal maskClosable={false} title="发货确认" onOk={this.handleSubmit} onCancel={this.handleCancel} confirmLoading={submitting} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="发货方式" >
            <Radio.Group value={shippingMode} onChange={this.handleChange}>
              <Radio.Button value={0}>配送单发货</Radio.Button>
              <Radio.Button value={1}>装车单发货</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem {...formItemLayout} label="配送面单号">
            {
              getFieldDecorator('waybill', {
                rules: [{ required: true, messages: '面单号必填' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="包装类型">
            {
              getFieldDecorator('pack', {
              })(<Select allowClear>
                {WRAP_TYPE.map(wt => <Option value={wt.value} key={wt.value}>{wt.text}</Option>)}
              </Select>)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="总包装件数">
            {
              getFieldDecorator('pieces')(<Input type="number" />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="总体积">
            {
              getFieldDecorator('volumes')(<Input type="number" />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="发货人员" >
            {
              getFieldDecorator('shippedBy', {
                initialValue: username,
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="发货时间" >
            {
              getFieldDecorator('shippedDate', {
                initialValue: moment(new Date()),
              })(<DatePicker showTime format="YYYY/MM/DD HH:mm" />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
