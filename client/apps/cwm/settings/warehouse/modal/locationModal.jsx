import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import { hideLocationModal, addLocation, loadLocations, updateLocation } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmWarehouse.locationModal.visible,
    record: state.cwmWarehouse.record,
  }),
  { hideLocationModal, addLocation, loadLocations, updateLocation }
)
@Form.create()
export default class AddLocationModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    zoneCode: PropTypes.string.isRequired,
  }
  state = {
    type: 0,
    status: 0,
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
        type: 0,
        status: 0,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.hideLocationModal();
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
            this.props.hideLocationModal();
            this.props.loadLocations(whseCode, zoneCode);
          }
        }
      );
    } else {
      this.props.addLocation(whseCode, zoneCode, location, type, status).then(
        (result) => {
          if (!result.error) {
            message.info('创建成功');
            this.props.hideLocationModal();
            this.props.loadLocations(whseCode, zoneCode);
          }
        }
      );
    }
  }
  render() {
    const { type, status, location } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="创建库位" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="库位编号">
            <Input onChange={this.locationChange} value={location} />
          </FormItem>
          <FormItem {...formItemLayout} label="库位类型">
            <RadioGroup value={type} onChange={this.typeChange}>
              <RadioButton value={0}>地面平仓</RadioButton>
              <RadioButton value={1}>重力式货架</RadioButton>
              <RadioButton value={2}>货架</RadioButton>
              <RadioButton value={3}>窄巷道货架</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem {...formItemLayout} label="库位状态">
            <RadioGroup value={status} onChange={this.statusChange}>
              <RadioButton value={1}>正常</RadioButton>
              <RadioButton value={0}>封存</RadioButton>
              <RadioButton value={-1}>禁用</RadioButton>
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}