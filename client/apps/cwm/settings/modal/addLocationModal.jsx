import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { hideLocationModal, addLocation, loadLocations } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmWarehouse.locationModal.visible,
  }),
  { hideLocationModal, addLocation, loadLocations }
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
  msg = key => formatMsg(this.props.intl, key);
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
    const { whseCode, zoneCode } = this.props;
    const { type, status, location } = this.state;
    this.props.addLocation(whseCode, zoneCode, location, type, status).then(
      (result) => {
        if (!result.error) {
          message.info('添加库位成功');
          this.props.hideLocationModal();
          this.props.loadLocations(whseCode, zoneCode);
        }
      }
    );
  }
  render() {
    const { type, status } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="添加库位" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem{...formItemLayout} label="location">
            <Input onChange={this.locationChange} />
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
              <RadioButton value={0}>正常</RadioButton>
              <RadioButton value={1}>封存</RadioButton>
              <RadioButton value={2}>禁用</RadioButton>
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
