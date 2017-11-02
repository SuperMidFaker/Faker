import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Switch, Radio, message } from 'antd';
import { hideOwnerControlModal, updateWhOwnerControl } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.ownerControlModal.visible,
    ownerAuth: state.cwmWarehouse.ownerControlModal.whOwnerAuth,
  }),
  { hideOwnerControlModal, updateWhOwnerControl }
)
@Form.create()
export default class OwnerControlModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ownerAuth: PropTypes.shape({
      id: PropTypes.number.isRequired,
      portion_enabled: PropTypes.number.isRequired,
    }),
    reload: PropTypes.func.isRequired,
  }
  state = {
    ownerAuth: {},
    control: {},
  }
  componentWillMount() {
    this.setState({ ownerAuth: this.props.ownerAuth });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({ ownerAuth: nextProps.ownerAuth });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.hideOwnerControlModal();
    this.setState({ ownerAuth: {}, control: {} });
  }
  handleRecModeChange = (ev) => {
    this.setState({
      ownerAuth: { ...this.state.ownerAuth, receiving_mode: ev.target.value },
      control: { ...this.state.control, receiving_mode: ev.target.value },
    });
  }
  handleShipModeChange = (ev) => {
    this.setState({
      ownerAuth: { ...this.state.ownerAuth, shipping_mode: ev.target.value },
      control: { ...this.state.control, shipping_mode: ev.target.value },
    });
  }

  handlePortionEnable = (checked) => {
    this.setState({ ownerAuth: { ...this.state.ownerAuth, portion_enabled: checked },
      control: { ...this.state.control, portion_enabled: checked } });
  }
  handleSubmit = () => {
    this.props.updateWhOwnerControl(this.props.ownerAuth.id, this.state.control, this.props.loginId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handleCancel();
        this.props.reload();
      }
    });
  }
  render() {
    const { ownerAuth } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal maskClosable={false} title="控制属性" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="默认收货模式">
            <RadioGroup value={ownerAuth.receiving_mode} onChange={this.handleRecModeChange}>
              <RadioButton value="scan">扫码</RadioButton>
              <RadioButton value="manual">手动</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem {...formItemLayout} label="默认发货模式">
            <RadioGroup value={ownerAuth.shipping_mode} onChange={this.handleShipModeChange}>
              <RadioButton value="scan">扫码</RadioButton>
              <RadioButton value="manual">手动</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem {...formItemLayout} label="出库启用分拨">
            <Switch checked={ownerAuth.portion_enabled} onChange={this.handlePortionEnable} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
