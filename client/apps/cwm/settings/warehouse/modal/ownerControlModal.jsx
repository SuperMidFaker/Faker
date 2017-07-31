import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Switch, Radio } from 'antd';
import { hideOwnerControlModal, updateOwnerAttr } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.ownerControlModal.visible,
    id: state.cwmWarehouse.ownerControlModal.id,
  }),
  { hideOwnerControlModal, updateOwnerAttr }
)
@Form.create()
export default class OwnerControlModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  state = {
    defaultReceivingMode: 'scan',
    defaultShippingMode: 'scan',
    portionEnable: false,
  }

  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.hideOwnerControlModal();
  }
  receivingModeChange = (e) => {
    this.setState({
      defaultReceivingMode: e.target.value,
    });
  }
  shippingModeChange = (e) => {
    this.setState({
      defaultShippingMode: e.target.value,
    });
  }
  chkPckChange = () => {
    this.setState({
      portionEnable: !this.state.portionEnable,
    });
  }
  handleSubmit = () => {
    const { id, loginId } = this.props;
    const { defaultReceivingMode, defaultShippingMode, portionEnable } = this.state;
    this.props.updateOwnerAttr(id, defaultReceivingMode, defaultShippingMode, portionEnable, loginId).then((result) => {
      if (!result.err) {
        this.props.hideOwnerControlModal();
      }
    });
  }
  render() {
    const { defaultReceivingMode, defaultShippingMode } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="控制属性" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="默认收货模式">
            <RadioGroup value={defaultReceivingMode} onChange={this.receivingModeChange}>
              <RadioButton value="scan">扫码</RadioButton>
              <RadioButton value="manual">手动</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem {...formItemLayout} label="默认发货模式">
            <RadioGroup value={defaultShippingMode} onChange={this.shippingModeChange}>
              <RadioButton value="scan">扫码</RadioButton>
              <RadioButton value="manual">手动</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem {...formItemLayout} label="出库启用分拨">
            <Switch defaultChecked={false} onChange={this.chkPckChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
