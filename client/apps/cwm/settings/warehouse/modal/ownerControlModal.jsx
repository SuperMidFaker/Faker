import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Tooltip, Modal, Form, Input, Switch, Radio, message } from 'antd';
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
    ownerAuth: { },
    suBarcodeSetting: {},
    control: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      let suBarcodeSetting = {};
      if (nextProps.ownerAuth.subarcode) {
        suBarcodeSetting = JSON.parse(nextProps.ownerAuth.subarcode);
      }
      this.setState({ ownerAuth: nextProps.ownerAuth, suBarcodeSetting });
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
    this.setState({
      ownerAuth: { ...this.state.ownerAuth, portion_enabled: checked },
      control: { ...this.state.control, portion_enabled: checked },
    });
  }
  handleSuBarScanEnable = (checked) => {
    const suBarcodeSetting = { ...this.state.suBarcodeSetting };
    suBarcodeSetting.enabled = checked;
    if (checked) {
      suBarcodeSetting.product_no = suBarcodeSetting.product_no || {
        start: null, end: null,
      };
      suBarcodeSetting.serial_no = suBarcodeSetting.serial_no || {
        start: null, end: null,
      };
      suBarcodeSetting.expiry_date = suBarcodeSetting.expiry_date || {
        enabled: false, start: null, end: null, time_format: null,
      };
      suBarcodeSetting.attrib_1_string = suBarcodeSetting.attrib_1_string || {
        enabled: false, display: null, start: null, end: null, time_format: null,
      };
    }
    this.setState({ suBarcodeSetting });
  }
  handleSubarcodeSetting = () => {
    this.setState({
      suBarcodeSettingVisible: true,
    });
  }
  handleChangeSuField = (field, key, value) => {
    const suBarcodeSetting = { ...this.state.suBarcodeSetting };
    suBarcodeSetting[field][key] = value;
    this.setState({ suBarcodeSetting });
  }
  handleSuSettingCancel = () => {
    // const ownerAuth = { ...this.state.ownerAuth };
    this.setState({
      suBarcodeSettingVisible: false,
      // suBarcodeSetting: ownerAuth.suBarcodeSetting && JSON.parse(ownerAuth.suBarcodeSetting),
    });
  }
  handleSuSettingOk = () => {
    const ownerAuth = { ...this.state.ownerAuth };
    ownerAuth.suBarcodeSetting = JSON.string(this.state.suBarcodeSetting);
    this.setState({ ownerAuth, suBarcodeSettingVisible: false });
  }
  handleSubmit = () => {
    this.props.updateWhOwnerControl(
      this.props.ownerAuth.id,
      this.state.control, this.props.loginId
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handleCancel();
        this.props.reload();
      }
    });
  }
  render() {
    const { ownerAuth, suBarcodeSetting, suBarcodeSettingVisible } = this.state;
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
          {ownerAuth.receiving_mode === 'manual' &&
          <FormItem {...formItemLayout} label="SU条码收货">
            <Switch checked={suBarcodeSetting.enabled} onChange={this.handleSuBarScanEnable} />
            { suBarcodeSetting.enabled &&
            <Tooltip title="SU条码字段配置"><Button icon="setting" style={{ marginLeft: '20px' }} onClick={this.handleSubarcodeSetting} /></Tooltip>
            }
          </FormItem>
          }
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
        {suBarcodeSetting.enabled === true && <Modal
          maskClosable={false}
          title="SU扫码配置"
          onCancel={this.handleSuSettingCancel}
          visible={suBarcodeSettingVisible}
          onOk={this.handleSuSettingOk}
          width={960}
        >
          <Form>
            <FormItem {...formItemLayout} label="货号">
              <Input.Group compact>
                <Input
                  placeholder="起始位置"
                  value={suBarcodeSetting.product_no.start}
                  style={{ width: '40%' }}
                  onChange={ev => this.handleChangeSuField('product_no', 'start', parseFloat(ev.target.value))}
                />
                <Input
                  style={{
 width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff',
}}
                  placeholder="~"
                  disabled
                />
                <Input
                  placeholder="终止位置"
                  value={suBarcodeSetting.product_no.end}
                  style={{ width: '40%', borderLeft: 0 }}
                  onChange={ev => this.handleChangeSuField('product_no', 'end', parseFloat(ev.target.value))}
                />
              </Input.Group>
            </FormItem>
            <FormItem {...formItemLayout} label="序列号">
              <Input.Group compact>
                <Input
                  onChange={ev => this.handleChangeSuField('serial_no', 'start', parseFloat(ev.target.value))}
                  placeholder="起始位置"
                  value={suBarcodeSetting.serial_no.start}
                  style={{ width: '40%' }}
                />
                <Input
                  style={{
 width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff',
}}
                  placeholder="~"
                  disabled
                />
                <Input
                  onChange={ev => this.handleChangeSuField('serial_no', 'end', parseFloat(ev.target.value))}
                  placeholder="终止位置"
                  value={suBarcodeSetting.serial_no.end}
                  style={{ width: '40%', borderLeft: 0 }}
                />
              </Input.Group>
            </FormItem>
            <FormItem {...formItemLayout} label="失效时间">
              <Switch
                checked={suBarcodeSetting.expiry_date.enabled}
                onChange={checked => this.handleChangeSuField('expiry_date', 'enabled', checked)}
              />
              <Input.Group compact>
                <Input
                  placeholder="起始位置"
                  value={suBarcodeSetting.expiry_date.start}
                  onChange={ev => this.handleChangeSuField('expiry_date', 'start', parseFloat(ev.target.value))}
                  style={{ width: '30%' }}
                />
                <Input
                  style={{
 width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff',
}}
                  placeholder="~"
                  disabled
                />
                <Input
                  onChange={ev => this.handleChangeSuField('expiry_date', 'end', parseFloat(ev.target.value))}
                  placeholder="终止位置"
                  value={suBarcodeSetting.expiry_date.end}
                  style={{ width: '30%', borderLeft: 0 }}
                />
                <Input
                  onChange={ev => this.handleChangeSuField('expiry_date', 'time_format', ev.target.value)}
                  placeholder="解析时间格式YYYYMMDD"
                  value={suBarcodeSetting.expiry_date.time_format}
                  style={{ width: '30%' }}
                />
              </Input.Group>
            </FormItem>
            <FormItem {...formItemLayout} label="扩展属性1">
              <Switch
                checked={suBarcodeSetting.attrib_1_string.enabled}
                onChange={checked => this.handleChangeSuField('attrib_1_string', 'enabled', checked)}
              />
              <Input.Group compact>
                <Input
                  onChange={ev => this.handleChangeSuField('attrib_1_string', 'display', ev.target.value)}
                  placeholder="显示名称"
                  value={suBarcodeSetting.attrib_1_string.display}
                  style={{ width: '20%' }}
                />
                <Input
                  onChange={ev => this.handleChangeSuField('attrib_1_string', 'start', parseFloat(ev.target.value))}
                  placeholder="起始位置"
                  value={suBarcodeSetting.attrib_1_string.start}
                  style={{ width: '20%' }}
                />
                <Input
                  style={{
 width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff',
}}
                  placeholder="~"
                  disabled
                />
                <Input
                  placeholder="终止位置"
                  value={suBarcodeSetting.attrib_1_string.end}
                  onChange={ev => this.handleChangeSuField('attrib_1_string', 'end', parseFloat(ev.target.value))}
                  style={{ width: '20%', borderLeft: 0 }}
                />
                <Input
                  placeholder="解析时间格式YYYYMMDD"
                  value={suBarcodeSetting.attrib_1_string.time_format}
                  onChange={ev => this.handleChangeSuField('attrib_1_string', 'time_format', ev.target.value)}
                  style={{ width: '30%' }}
                />
              </Input.Group>
            </FormItem>
          </Form>
        </Modal>}
      </Modal>
    );
  }
}
