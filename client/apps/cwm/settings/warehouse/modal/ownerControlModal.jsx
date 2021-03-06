import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Tooltip, Modal, Form, Input, Switch, Radio, message } from 'antd';
import { hideOwnerControlModal, updateWhOwnerControl, showPickPrintModal } from 'common/reducers/cwmWarehouse';
import OwnerPickPrintModal from './ownerPickPrintControlModal';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function SuAttribFormItem(props) {
  const {
    label, field, onChange, suBarcodeSetting, formItemLayout,
  } = props;
  const attribField = suBarcodeSetting[field];
  function handleChange(key, value) {
    onChange(field, key, value);
  }
  return (
    <FormItem {...formItemLayout} label={label}>
      <RadioGroup
        value={attribField.enabled === false ? 'false' : attribField.enabled}
        onChange={(ev) => {
        let enabledv = ev.target.value;
        if (enabledv === 'false') {
          enabledv = false;
        }
        handleChange('enabled', enabledv);
      }}
      >
        <RadioButton value="false">不启用</RadioButton>
        <RadioButton value="subarcode">扫码截取</RadioButton>
        <RadioButton value="maninput">手工输入</RadioButton>
      </RadioGroup>
      {attribField.enabled !== false &&
        <Input
          onChange={ev => handleChange('display', ev.target.value)}
          placeholder="显示名称必填"
          value={attribField.display}
        /> }
      {attribField.enabled === 'subarcode' &&
      <Input.Group compact>
        <Input
          addonBefore="分隔项"
          placeholder="从0开始"
          value={attribField.part}
          style={{ width: '30%', borderRight: 0 }}
          onChange={ev => this.handleChange('part', ev.target.value)}
        />
        <Input
          addonBefore="距头部"
          placeholder="字符数"
          onChange={ev => handleChange('start', ev.target.value)}
          value={attribField.start}
          style={{ width: '35%' }}
        />
        <Input
          addonBefore="距尾部"
          placeholder="字符数"
          value={attribField.end}
          onChange={ev => handleChange('end', ev.target.value)}
          style={{ width: '35%', borderLeft: 0 }}
        />
      </Input.Group>}
      {attribField.enabled === 'subarcode' &&
        <Input
          placeholder="时间解析格式YYYYMMDD选填"
          value={attribField.time_format}
          onChange={ev => handleChange('time_format', ev.target.value)}
          style={{ width: '35%' }}
        />}
    </FormItem>);
}

const initialSuBarcodeSetting = {
  enabled: false,
  product_no: {
    part: null, start: 0, end: 0,
  },
  serial_no: {
    part: null, start: 0, end: 0,
  },
  expiry_date: {
    enabled: false, part: null, start: 0, end: 0, time_format: null,
  },
  attrib_1_string: {
    enabled: false, display: null, part: null, start: 0, end: 0, time_format: null,
  },
  attrib_2_string: {
    enabled: false, display: null, part: null, start: 0, end: 0, time_format: null,
  },
  attrib_3_string: {
    enabled: false, display: null, part: null, start: 0, end: 0, time_format: null,
  },
  attrib_4_string: {
    enabled: false, display: null, part: null, start: 0, end: 0, time_format: null,
  },
};

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.ownerControlModal.visible,
    ownerAuth: state.cwmWarehouse.ownerControlModal.whOwnerAuth,
  }),
  { hideOwnerControlModal, updateWhOwnerControl, showPickPrintModal }
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
  componentDidMount() {
    if (this.props.visible) {
      this.handleAuthSetting(this.props.ownerAuth);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.handleAuthSetting(nextProps.ownerAuth);
    }
  }
  handleAuthSetting = (ownerAuth) => {
    let suBarcodeSetting = {
      ...initialSuBarcodeSetting,
      product_no: { ...initialSuBarcodeSetting.product_no },
      serial_no: { ...initialSuBarcodeSetting.serial_no },
      expiry_date: { ...initialSuBarcodeSetting.expiry_date },
      attrib_1_string: { ...initialSuBarcodeSetting.attrib_1_string },
      attrib_2_string: { ...initialSuBarcodeSetting.attrib_2_string },
      attrib_3_string: { ...initialSuBarcodeSetting.attrib_3_string },
      attrib_4_string: { ...initialSuBarcodeSetting.attrib_4_string },
    };
    if (ownerAuth.subarcode_setting) {
      suBarcodeSetting = { ...suBarcodeSetting, ...JSON.parse(ownerAuth.subarcode_setting) };
    }
    this.setState({ ownerAuth, suBarcodeSetting });
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
  handlePickPrintSetting = () => {
    let printRule = {
      columns: [{ key: 'product_no', text: '货号', column: 1 },
        { key: 'name', text: '产品名称', column: 2 },
        { key: 'external_lot_no', text: '批次号', column: 3 },
        { key: 'attrib_1_string', text: '客户属性', column: 4 },
        { key: 'location', text: '库位', column: 5 },
      ],
      print_remain: true,
      pick_order: ['location'],
    };
    if (this.props.ownerAuth.pick_print) {
      printRule = JSON.parse(this.props.ownerAuth.pick_print);
    }
    this.props.showPickPrintModal({
      visible: true,
      printRule,
    });
  }
  handlePickPrintChange = (newPickPrint) => {
    const control = { ...this.state.control };
    control.pick_print = JSON.stringify(newPickPrint);
    this.setState({ control });
  }
  handleSubarcodeSetting = () => {
    const { suBarcodeSetting } = this.state;
    const suBarcodeBackup = { // deep copy
      ...suBarcodeSetting,
      product_no: { ...suBarcodeSetting.product_no },
      serial_no: { ...suBarcodeSetting.serial_no },
      expiry_date: { ...suBarcodeSetting.expiry_date },
      attrib_1_string: { ...suBarcodeSetting.attrib_1_string },
    };
    this.setState({
      suBarcodeSettingVisible: true, suBarcodeBackup,
    });
  }
  handleSuBarScanEnable = (checked) => {
    if (!checked) {
      const suBarcodeSetting = {
        ...initialSuBarcodeSetting,
        product_no: { ...initialSuBarcodeSetting.product_no },
        serial_no: { ...initialSuBarcodeSetting.serial_no },
        expiry_date: { ...initialSuBarcodeSetting.expiry_date },
        attrib_1_string: { ...initialSuBarcodeSetting.attrib_1_string },
        attrib_2_string: { ...initialSuBarcodeSetting.attrib_2_string },
        attrib_3_string: { ...initialSuBarcodeSetting.attrib_3_string },
        attrib_4_string: { ...initialSuBarcodeSetting.attrib_4_string },
      };
      this.setState({ suBarcodeSetting });
      return;
    }
    const suBarcodeSetting = { ...this.state.suBarcodeSetting };
    suBarcodeSetting.enabled = checked;
    this.setState({ suBarcodeSetting });
  }
  handleChangeSuField = (field, key, value) => {
    const suBarcodeSetting = { ...this.state.suBarcodeSetting };
    if (key === 'start' || key === 'end' || key === 'part') {
      const fltValue = parseFloat(value);
      if (Number.isNaN(fltValue)) {
        suBarcodeSetting[field][key] = 0;
      } else {
        suBarcodeSetting[field][key] = fltValue;
      }
    } else {
      suBarcodeSetting[field][key] = value;
    }
    this.setState({ suBarcodeSetting });
  }
  handleSubarFieldChange = (field, changedVal) => {
    const suBarcodeSetting = { ...this.state.suBarcodeSetting };
    suBarcodeSetting[field] = changedVal;
    this.setState({ suBarcodeSetting });
  }
  handleSuSettingCancel = () => {
    const suBarcodeSetting = { ...this.state.suBarcodeBackup };
    this.setState({
      suBarcodeSettingVisible: false,
      suBarcodeSetting,
      suBarcodeBackup: null,
    });
  }
  checkSuBarPart = (setting) => {
    const { suBarcodeSetting } = this.state;
    const start = parseFloat(setting.start);
    const end = parseFloat(setting.end);
    const part = parseFloat(setting.part);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return false;
    }
    if (suBarcodeSetting.separator && Number.isNaN(part)) {
      return false;
    }
    return true;
  }
  handleSuSettingOk = () => {
    const { suBarcodeSetting } = this.state;
    if (suBarcodeSetting.enabled) {
      const suKeys = Object.keys(suBarcodeSetting);
      let completed = true;
      for (let i = 0; i < suKeys.length; i++) {
        const suKey = suKeys[i];
        const setting = suBarcodeSetting[suKey];
        if (suKey === 'product_no') {
          if (!this.checkSuBarPart(setting)) {
            completed = false;
            break;
          }
        } else if (suKey === 'serial_no') {
          if (!this.checkSuBarPart(setting)) {
            completed = false;
            break;
          }
        } else if (setting.enabled) {
          if (suKey === 'expiry_date') {
            if (!this.checkSuBarPart(setting) || !setting.time_format) {
              completed = false;
              break;
            }
          } else if (setting.enabled === 'maninput' && !setting.display) {
            completed = false;
            break;
          } else if (setting.enabled === 'subarcode' && (!this.checkSuBarPart(setting) || !setting.display)) {
            completed = false;
            break;
          }
        }
      }
      if (!completed) {
        message.error('SU扫码启用字段配置项未填写完整');
        return;
      }
    }
    const control = { ...this.state.control };
    control.subarcode_setting = JSON.stringify(suBarcodeSetting);
    this.setState({ control, suBarcodeSettingVisible: false, suBarcodeBackup: null });
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
          <FormItem {...formItemLayout} label="默认发货模式">
            <RadioGroup value={ownerAuth.shipping_mode} onChange={this.handleShipModeChange}>
              <RadioButton value="scan">扫码</RadioButton>
              <RadioButton value="manual">手动</RadioButton>
            </RadioGroup>
          </FormItem>
          {ownerAuth.receiving_mode === 'manual' &&
          <FormItem {...formItemLayout} label="SU条码收发货">
            <Tooltip title="SU条码启用配置"><Button icon="setting" style={{ marginLeft: '20px' }} onClick={this.handleSubarcodeSetting} /></Tooltip>
          </FormItem>
          }
          <FormItem {...formItemLayout} label="出库启用分拨">
            <Switch checked={!!ownerAuth.portion_enabled} onChange={this.handlePortionEnable} />
          </FormItem>
          <FormItem {...formItemLayout} label="拣货单打印">
            <Button icon="setting" style={{ marginLeft: '20px' }} onClick={this.handlePickPrintSetting} />
          </FormItem>
        </Form>
        {suBarcodeSettingVisible === true && <Modal
          maskClosable={false}
          title="SU扫码配置"
          onCancel={this.handleSuSettingCancel}
          visible={suBarcodeSettingVisible}
          onOk={this.handleSuSettingOk}
          width={960}
        >
          <Form>
            <FormItem {...formItemLayout} label="启用">
              <Switch checked={suBarcodeSetting.enabled} onChange={this.handleSuBarScanEnable} />
            </FormItem>
            <FormItem {...formItemLayout} label="分隔符">
              <Input
                value={suBarcodeSetting.separator}
                placeholder="条码内不同项分隔符号"
                onChange={ev => this.handleSubarFieldChange('separator', ev.target.value)}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="货号">
              <Input.Group compact>
                <Input
                  addonBefore="分隔项"
                  placeholder="从0开始"
                  value={suBarcodeSetting.product_no.part}
                  style={{ width: '30%', borderRight: 0 }}
                  onChange={ev => this.handleChangeSuField('product_no', 'part', ev.target.value)}
                />
                <Input
                  addonBefore="距头部"
                  placeholder="字符数"
                  value={suBarcodeSetting.product_no.start}
                  style={{ width: '35%', borderLeft: 0, borderRight: 0 }}
                  onChange={ev => this.handleChangeSuField('product_no', 'start', ev.target.value)}
                />
                <Input
                  addonBefore="距尾部"
                  placeholder="字符数"
                  value={suBarcodeSetting.product_no.end}
                  style={{ width: '35%', borderLeft: 0 }}
                  onChange={ev => this.handleChangeSuField('product_no', 'end', ev.target.value)}
                />
              </Input.Group>
            </FormItem>
            <FormItem {...formItemLayout} label="序列号">
              <Input.Group compact>
                <Input
                  addonBefore="分隔项"
                  placeholder="从0开始"
                  value={suBarcodeSetting.serial_no.part}
                  style={{ width: '30%', borderRight: 0 }}
                  onChange={ev => this.handleChangeSuField('serial_no', 'part', ev.target.value)}
                />
                <Input
                  addonBefore="距头部"
                  placeholder="字符数"
                  value={suBarcodeSetting.serial_no.start}
                  style={{ width: '35%', borderLeft: 0, borderRight: 0 }}
                  onChange={ev => this.handleChangeSuField('serial_no', 'start', ev.target.value)}
                />
                <Input
                  addonBefore="距尾部"
                  placeholder="字符数"
                  value={suBarcodeSetting.serial_no.end}
                  style={{ width: '35%', borderLeft: 0 }}
                  onChange={ev => this.handleChangeSuField('serial_no', 'end', ev.target.value)}
                />
              </Input.Group>
            </FormItem>
            <FormItem {...formItemLayout} label="失效时间">
              <Switch
                checked={suBarcodeSetting.expiry_date.enabled}
                onChange={checked => this.handleChangeSuField('expiry_date', 'enabled', checked)}
              />
              {suBarcodeSetting.expiry_date.enabled &&
              <Input.Group compact>
                <Input
                  addonBefore="分隔项"
                  placeholder="从0开始"
                  value={suBarcodeSetting.expiry_date.part}
                  style={{ width: '30%', borderRight: 0 }}
                  onChange={ev => this.handleChangeSuField('expiry_date', 'part', ev.target.value)}
                />
                <Input
                  addonBefore="距头部"
                  placeholder="字符数"
                  value={suBarcodeSetting.expiry_date.start}
                  style={{ width: '35%', borderLeft: 0 }}
                  onChange={ev => this.handleChangeSuField('expiry_date', 'start', ev.target.value)}
                />
                <Input
                  addonBefore="距尾部"
                  placeholder="字符数"
                  value={suBarcodeSetting.expiry_date.end}
                  style={{ width: '35%', borderLeft: 0 }}
                  onChange={ev => this.handleChangeSuField('expiry_date', 'end', ev.target.value)}
                />
              </Input.Group>}
              {suBarcodeSetting.expiry_date.enabled &&
              <Input
                onChange={ev => this.handleChangeSuField('expiry_date', 'time_format', ev.target.value)}
                placeholder="解析时间格式YYYYMMDD必填"
                value={suBarcodeSetting.expiry_date.time_format}
                style={{ width: '30%' }}
              />}
            </FormItem>
            <SuAttribFormItem
              formItemLayout={formItemLayout}
              label="扩展属性1"
              suBarcodeSetting={suBarcodeSetting}
              onChange={this.handleChangeSuField}
              field="attrib_1_string"
            />
            <SuAttribFormItem
              formItemLayout={formItemLayout}
              label="扩展属性2"
              suBarcodeSetting={suBarcodeSetting}
              onChange={this.handleChangeSuField}
              field="attrib_2_string"
            />
            <SuAttribFormItem
              formItemLayout={formItemLayout}
              label="扩展属性3"
              suBarcodeSetting={suBarcodeSetting}
              onChange={this.handleChangeSuField}
              field="attrib_3_string"
            />
            <SuAttribFormItem
              formItemLayout={formItemLayout}
              label="扩展属性4"
              suBarcodeSetting={suBarcodeSetting}
              onChange={this.handleChangeSuField}
              field="attrib_4_string"
            />
            <FormItem {...formItemLayout} label="保存键">
              <Input value={suBarcodeSetting.submit_key} onChange={ev => this.handleSubarFieldChange('submit_key', ev.target.value)} />
            </FormItem>
            <FormItem {...formItemLayout} label="切换库位扫码键">
              <Input value={suBarcodeSetting.location_focus_key} onChange={ev => this.handleSubarFieldChange('location_focus_key', ev.target.value)} />
            </FormItem>
          </Form>
        </Modal>}
        <OwnerPickPrintModal setPickPrint={this.handlePickPrintChange} />
      </Modal>
    );
  }
}
