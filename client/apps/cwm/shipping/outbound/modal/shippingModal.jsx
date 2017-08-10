import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Form, Modal, Input, Radio } from 'antd';

import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeShippingModal, shipConfirm, loadPickDetails, loadOutboundHead, loadShipDetails } from 'common/reducers/cwmOutbound';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.shippingModal.visible,
    pickedQty: state.cwmOutbound.shippingModal.pickedQty,
    skuPackQty: state.cwmOutbound.shippingModal.skuPackQty,
    id: state.cwmOutbound.shippingModal.id,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    username: state.account.username,
  }),
  { closeShippingModal, shipConfirm, loadPickDetails, loadOutboundHead, loadShipDetails }
)
@Form.create()
export default class ShippingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    shipMode: PropTypes.string.isRequired,
    selectedRows: PropTypes.array,
    resetState: PropTypes.func,
  }
  state = {
    shippingMode: 0,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible && this.props.visible !== nextProps.visible) {
      this.props.form.setFieldsValue({
        waybill: '',
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeShippingModal();
  }
  handleChange = (e) => {
    this.setState({ shippingMode: e.target.value });
  }
  handleSubmit = () => {
    const { outboundNo, skuPackQty, pickedQty, loginId, tenantId, shipMode, selectedRows, id } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const list = [];
        if (shipMode === 'single') {
          const data = {};
          data.id = id;
          data.shipped_qty = pickedQty;
          data.shipped_pack_qty = pickedQty / skuPackQty;
          data.drop_id = '';
          data.waybill = values.waybill;
          data.shipped_type = this.state.shippingMode;
          list.push(data);
        } else {
          for (let i = 0; i < selectedRows.length; i++) {
            const data = {};
            data.id = selectedRows[i].id;
            data.shipped_qty = selectedRows[i].picked_qty;
            data.shipped_pack_qty = selectedRows[i].picked_qty / selectedRows[i].sku_pack_qty;
            data.drop_id = '';
            data.waybill = values.waybill;
            data.shipped_type = this.state.shippingMode;
            list.push(data);
          }
        }
        this.props.shipConfirm(outboundNo, list, loginId, tenantId, values.shippedBy, values.shippedDate).then((result) => {
          if (!result.error) {
            this.props.closeShippingModal();
            this.props.loadPickDetails(this.props.outboundNo);
            this.props.loadOutboundHead(this.props.outboundNo);
            this.props.resetState();
            this.props.loadShipDetails(this.props.outboundNo);
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, username } = this.props;
    const { shippingMode } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal title="发货确认" maskClosable={false} onOk={this.handleSubmit} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="发货方式" >
            <Radio.Group value={shippingMode} onChange={this.handleChange}>
              <Radio.Button value={0}>配送单发货</Radio.Button>
              <Radio.Button value={1}>装车单发货</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem {...formItemLayout} label="配送面单号" >
            {
              getFieldDecorator('waybill', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
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
