import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Checkbox, message } from 'antd';
import { showSkuRuleModal, updateWhOwnerControl } from 'common/reducers/cwmWarehouse';
import { SKU_REQUIRED_PROPS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.skuRuleModalVisible,
    skuRuleModal: state.cwmWarehouse.skuRuleModal,
  }),
  { showSkuRuleModal, updateWhOwnerControl }
)
export default class SkuRuleModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    skuRuleModal: PropTypes.shape({
      ownerAuthId: PropTypes.number.isRequired,
      sku_rule: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
    }),
    reload: PropTypes.func.isRequired,
  }
  state = {
    skuRule: {
      requiredProps: [],
    },
  }
  componentDidMount() {
    if (this.props.visible) {
      this.handleRuleParse(this.props.skuRuleModal.sku_rule);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.handleRuleParse(nextProps.skuRuleModal.sku_rule);
    }
  }
  msg = formatMsg(this.props.intl)
  handleRuleParse = (skuRule) => {
    const ruleState = {
      requiredProps: skuRule.required_props,
    };
    this.setState({ skuRule: ruleState });
  }
  handlePropsRequireChange= (checkedVals) => {
    const ruleState = { ...this.state.skuRule };
    ruleState.requiredProps = checkedVals;
    this.setState({ skuRule: ruleState });
  }
  handleCancel = () => {
    this.setState({ skuRule: { } });
    this.props.showSkuRuleModal({ visible: false, rule: {} });
  }

  handleSubmit = () => {
    const rule = {
      required_props: this.state.skuRule.requiredProps,
    };
    this.props.updateWhOwnerControl(
      this.props.skuRuleModal.ownerAuthId,
      { sku_rule: JSON.stringify(rule) }, this.props.loginId
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
    const { skuRule } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal maskClosable={false} title="SKU规则设置" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="必填属性">
            <CheckboxGroup
              options={SKU_REQUIRED_PROPS}
              value={skuRule.requiredProps}
              onChange={this.handlePropsRequireChange}
            />
          </FormItem>
        </Form>
      </Modal>);
  }
}
