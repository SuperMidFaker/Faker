import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Form, Modal, Input } from 'antd';
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
export default class PickingModal extends Component {
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
      <Modal title="拣货确认" maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="目标库位" >
            {
              getFieldDecorator('targetLocation', {
                rules: [{ required: true, messages: 'please input whseCode' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="目标跟踪号" >
            {
              getFieldDecorator('dropId', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="拣货人员" >
            {
              getFieldDecorator('pickedBy')(<Input />)
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
