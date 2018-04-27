import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { DatePicker, Form, Modal, Input } from 'antd';
import { toggleExchangeDocModal } from 'common/reducers/cmsDelegation';
import { exchangeBlNo } from 'common/reducers/cmsDelegationDock';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.exchangeDocModal.visible,
    delgNo: state.cmsDelegation.exchangeDocModal.delgNo,
    blWbNo: state.cmsDelegation.exchangeDocModal.blWbNo,
  }),
  { toggleExchangeDocModal, exchangeBlNo }
)
@Form.create()
export default class ExchangeDocModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }
  handleCancel = () => {
    this.props.toggleExchangeDocModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.exchangeBlNo(
          this.props.delgNo,
          {
            delivery_order_no: values.delivery_order_no,
            bl_date: values.exchange_bl_date,
            amount: values.exchange_bl_account,
          }
        ).then((result) => {
          if (!result.error) {
            this.handleCancel();
            this.props.reload();
          }
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible } = this.props;
    const { form: { getFieldDecorator }, blWbNo } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('换单')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="提单号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('bl_wb_no', {
              initialValue: blWbNo,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label="提货单号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('delivery_order_no', {
               rules: [{ required: true, message: '提货单号必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label="换单日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('exchange_bl_date', {
              rules: [{ required: true, message: '换单日期必填' }],
            })(<DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              showTime
            />)}
          </FormItem>
          <FormItem label="换单费金额" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('exchange_bl_account', {
              rules: [{ required: true, message: '换单费金额必填' }],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
