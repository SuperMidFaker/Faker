import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import { hideLocationModal, addLocation, loadLocations, updateLocation } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';
import { CWM_LOCATION_TYPES, CWM_LOCATION_STATUS } from 'common/constants';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
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
    zoneCode: PropTypes.string,
  }
  state = {
    type: '1',
    status: '1',
    location: '',
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      const { location, type, status } = nextProps.record;
      this.setState({ location, type, status });
    } else {
      this.setState({
        location: nextProps.record.location ? nextProps.record.location : '',
        type: '1',
        status: '1',
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
    const { whseCode, zoneCode, record, tenantId, loginId } = this.props;
    const { type, status, location } = this.state;
    if (record.id) {
      this.props.updateLocation(type, status, location, record.id, loginId).then(
        (result) => {
          if (!result.error) {
            message.info('保存成功');
            this.props.hideLocationModal();
            this.props.loadLocations(whseCode, zoneCode, tenantId);
          } else {
            message.error(result.error.message);
          }
        }
      );
    } else {
      this.props.addLocation(whseCode, zoneCode, location, type, status, tenantId, loginId).then(
        (result) => {
          if (!result.error) {
            message.info('创建成功');
            this.props.hideLocationModal();
            this.props.loadLocations(whseCode, zoneCode, tenantId);
          } else {
            message.error(result.error.message);
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
      <Modal maskClosable={false} title="创建库位" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="库位编号">
            <Input onChange={this.locationChange} value={location} />
          </FormItem>
          <FormItem {...formItemLayout} label="库位类型">
            <RadioGroup value={type} onChange={this.typeChange}>
              {CWM_LOCATION_TYPES.map(item => <RadioButton key={item.value} value={item.value}>{item.text}</RadioButton>)}
            </RadioGroup>
          </FormItem>
          <FormItem {...formItemLayout} label="库位状态">
            <RadioGroup value={status} onChange={this.statusChange}>
              {CWM_LOCATION_STATUS.map(item => <RadioButton key={item.value} value={item.value}>{item.text}</RadioButton>)}
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
