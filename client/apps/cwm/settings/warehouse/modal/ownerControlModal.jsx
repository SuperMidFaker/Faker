import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Switch, Radio, message } from 'antd';
import { hideOwnerControlMoal } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmWarehouse.ownerControlMoal.visible,
    record: state.cwmWarehouse.record,
  }),
  { hideOwnerControlMoal }
)
@Form.create()
export default class OwnerControlModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    zoneCode: PropTypes.string.isRequired,
  }
  state = {
    type: 1,
    status: 1,
    location: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.record.id && nextProps.record.id !== this.props.record.id) {
      const { location, type, status } = nextProps.record;
      this.setState({
        location,
        type: Number(type),
        status: Number(status),
      });
    } else {
      this.setState({
        location: '',
        type: 1,
        status: 1,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.hideOwnerControlMoal();
  }
  statusChange = (e) => {
    this.setState({
      status: e.target.value,
    });
  }
  typeChange = (e) => {
    this.setState({
      type: e.target.value,
    });
  }
  locationChange = (e) => {
    this.setState({
      location: e.target.value,
    });
  }
  handleSubmit = () => {
    const { whseCode, zoneCode, record } = this.props;
    const { type, status, location } = this.state;
    if (record.id) {
      this.props.updateLocation(type, status, location, record.id).then(
        (result) => {
          if (!result.error) {
            message.info('保存成功');
            this.props.hideOwnerControlMoal();
            this.props.loadLocations(whseCode, zoneCode);
          }
        }
      );
    } else {
      this.props.addLocation(whseCode, zoneCode, location, type, status).then(
        (result) => {
          if (!result.error) {
            message.info('创建成功');
            this.props.hideOwnerControlMoal();
            this.props.loadLocations(whseCode, zoneCode);
          }
        }
      );
    }
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
          <FormItem {...formItemLayout} label="复核装箱">
            <Switch defaultChecked={false} onChange={this.chkPckChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
