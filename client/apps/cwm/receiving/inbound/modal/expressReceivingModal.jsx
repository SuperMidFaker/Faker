import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Checkbox, DatePicker, Form, Modal, Input } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closePickingModal } from 'common/reducers/cwmOutbound';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.pickingModal.visible,
  }),
  { closePickingModal }
)
@Form.create()
export default class ExpressReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shippingMode: PropTypes.string,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closePickingModal();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal title="快捷收货" maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="收货数量" >
            <Checkbox checked>实际收货数量与预期一致</Checkbox>
          </FormItem>
          <FormItem {...formItemLayout} label="库位" >
            {
              getFieldDecorator('location', {
                rules: [{ required: true, messages: 'please input whseCode' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="破损级别" >
            {
              getFieldDecorator('damageLevel', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="收货人员" >
            {
              getFieldDecorator('receivedBy')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="收货时间" >
            {
              getFieldDecorator('receivedDate')(<DatePicker />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
