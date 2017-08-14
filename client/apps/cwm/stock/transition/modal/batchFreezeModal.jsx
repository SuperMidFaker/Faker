
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Input, Modal, Alert, Form, Switch } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeBatchFreezeModal, batchFreeze } from 'common/reducers/cwmTransition';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visible: state.cwmTransition.batchFreezeModal.visible,
  }),
  { closeBatchFreezeModal, batchFreeze }
)
export default class BatchFreezeModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array.isRequired,
  }
  state = {
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeBatchFreezeModal();
    this.setState({
      location: '',
    });
  }

  handleSubmit = () => {
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    return (
      <Modal title="批量冻结" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit} okText="确认冻结">
        <Alert message="已选择 项 库存数量总计" type="info" />
        <FormItem {...formItemLayout} label="是否冻结">
          <Switch checkedChildren="冻结" unCheckedChildren="解除" checked />
        </FormItem>
        <FormItem {...formItemLayout} label="冻结原因" >
          <Input />
        </FormItem>
      </Modal>
    );
  }
}
