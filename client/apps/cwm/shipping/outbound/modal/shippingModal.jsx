import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Form, Modal, Input, Radio } from 'antd';

import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeShippingModal } from 'common/reducers/cwmOutbound';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.shippingModal.visible,
  }),
  { closeShippingModal }
)
@Form.create()
export default class ShippingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shippingMode: PropTypes.string,
  }

  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeShippingModal();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal title="发货确认" maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="发货方式" >
            <Radio.Group onChange={this.handleChange}>
              <Radio.Button value={0}>配送单发货</Radio.Button>
              <Radio.Button value={1}>装车单发货</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem {...formItemLayout} label="配送面单号" >
            {
              getFieldDecorator('dropId', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="发货人员" >
            {
              getFieldDecorator('pickedBy')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="发货时间" >
            {
              getFieldDecorator('pickedDate')(<DatePicker />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
