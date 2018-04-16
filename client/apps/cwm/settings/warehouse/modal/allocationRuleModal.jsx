import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Switch, message } from 'antd';
import { updateWhOwnerControl } from 'common/reducers/cwmWarehouse';
import { showAllocRuleModal } from 'common/reducers/cwmAllocRule';
import { ALLOC_MATCH_FIELDS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

function AllocMatchFieldForm(props) {
  const {
    label, field, onChange, formItemLayout, setting,
  } = props;
  function handleChange(key, value) {
    const newSetting = { ...setting };
    newSetting[key] = value;
    onChange(field, newSetting);
  }
  if (!setting) {
    return null;
  }
  return (
    <FormItem {...formItemLayout} label={label}>
      <Switch checked={setting.enabled} onChange={checked => handleChange('enabled', checked)} />
      {setting.enabled &&
      <Input value={setting.eigen} onChange={ev => handleChange('eigen', ev.target.value)} placeholder="特征值" />}
    </FormItem>);
}

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    visible: state.cwmAllocRule.allocRuleModalVisible,
    ownerAuth: state.cwmAllocRule.allocRuleModal.ownerAllocRule,
  }),
  { showAllocRuleModal, updateWhOwnerControl }
)
export default class AllocRuleModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ownerAuth: PropTypes.shape({
      id: PropTypes.number.isRequired,
      alloc_rule: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
    }),
    reload: PropTypes.func.isRequired,
  }
  state = {
    allocRule: {},
  }
  componentDidMount() {
    if (this.props.visible) {
      this.handleAllocSetting(this.props.ownerAuth.alloc_rule);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.handleAllocSetting(nextProps.ownerAuth.alloc_rule);
    }
  }
  msg = formatMsg(this.props.intl)
  handleAllocSetting = (allocRules) => {
    const allocRuleState = {};
    allocRules.forEach((rule) => {
      allocRuleState[rule.key] = { enabled: true, eigen: rule.eigen };
    });
    ALLOC_MATCH_FIELDS.forEach((amf) => {
      if (!allocRuleState[amf.field]) {
        allocRuleState[amf.field] = { enabled: false };
      }
    });
    this.setState({ allocRule: allocRuleState });
  }
  handleSettingChange = (field, setting) => {
    const allocRuleState = { ...this.state.allocRule };
    allocRuleState[field] = setting;
    this.setState({ allocRule: allocRuleState });
  }
  handleCancel = () => {
    this.setState({ allocRule: {} });
    this.props.showAllocRuleModal({ visible: false, rule: {} });
  }

  handleSubmit = () => {
    const rules = [];
    Object.keys(this.state.allocRule).forEach((rulekey) => {
      if (this.state.allocRule[rulekey].enabled) {
        rules.push({ key: rulekey, eigen: this.state.allocRule[rulekey].eigen });
      }
    });
    this.props.updateWhOwnerControl(
      this.props.ownerAuth.id,
      { alloc_rule: JSON.stringify(rules) }, this.props.loginId
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
    const { allocRule } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal maskClosable={false} title="配货匹配字段" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          {ALLOC_MATCH_FIELDS.map(amf =>
            (<AllocMatchFieldForm
              field={amf.field}
              formItemLayout={formItemLayout}
              label={amf.label}
              onChange={this.handleSettingChange}
              setting={allocRule[amf.field]}
              key={amf.field}
            />))}
        </Form>
      </Modal>);
  }
}
