import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Radio, Mention, Row, Col } from 'antd';
import { closeRuleModel } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import { SOURCE_CHOOSE } from 'common/constants';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Nav = Mention.Nav;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['rule_currency', 'rule_orig_country', 'rule_net_wt',
    ].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : '1';
    });
    ['rule_g_name', 'rule_g_unit'].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : '0';
    });
    init.rule_gunit_num = formData.rule_gunit_num ? formData.rule_gunit_num : 'g_unit_1';
    init.rule_element = formData.rule_element ? formData.rule_element : '';
  }
  return init;
}

@Form.create()
@injectIntl
@connect(
  state => ({
    visibleRuleModal: state.cmsManifest.visibleRuleModal,
    billHead: state.cmsManifest.billHead,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    fieldInits: getFieldInits(state.cmsSettings.formData),
  }),
  { closeRuleModel }
)
export default class RelateImportRuleModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleRuleModal: PropTypes.bool.isRequired,
  }
  state = {
    suggestions: [],
  }
  handleCancel = () => {
    this.props.closeRuleModel();
  }
  handleOk = () => {
  }
  formulaParams = [
    { value: 'element', text: '规格型号' },
    { value: 'remark', text: '备注' },
    { value: 'cop_product_no', text: '商品货号' },
  ];
  handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = this.formulaParams.filter(item =>
      item.value.toLowerCase().indexOf(searchValue) !== -1
    );
    const suggestions = filtered.map(suggestion =>
      <Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>);
    this.setState({ suggestions });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator, getFieldValue }, visibleRuleModal, fieldInits } = this.props;
    return (
      <Modal title={'特殊字段规则设置确认'} width={650} visible={visibleRuleModal} onCancel={this.handleCancel}>
        <Row>
          <Row>
            <Col sm={24} lg={12}>
              <FormItem label={'商品名称'} {...formItemLayout} >
                {getFieldDecorator('rule_g_name', { initialValue: fieldInits.rule_g_name })(
                  <RadioGroup>
                    <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                    <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                  </RadioGroup>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={'币制'} {...formItemLayout} >
                {getFieldDecorator('rule_currency', { initialValue: fieldInits.rule_currency })(
                  <RadioGroup>
                    <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                    <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                  </RadioGroup>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <FormItem label={'原产国'} {...formItemLayout} >
                {getFieldDecorator('rule_orig_country', { initialValue: fieldInits.rule_orig_country })(
                  <RadioGroup>
                    <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                    <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                  </RadioGroup>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={'净重'} {...formItemLayout} >
                {getFieldDecorator('rule_net_wt', { initialValue: fieldInits.rule_net_wt })(
                  <RadioGroup>
                    <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                    <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                  </RadioGroup>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <FormItem label={'申报单位'} {...formItemLayout} >
                {getFieldDecorator('rule_g_unit', { initialValue: fieldInits.rule_g_unit })(
                  <RadioGroup>
                    <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                    <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                  </RadioGroup>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              {getFieldValue('rule_g_unit') === '0' &&
              <FormItem>
                {getFieldDecorator('rule_gunit_num', { initialValue: fieldInits.rule_gunit_num })(
                  <RadioGroup>
                    <Radio value="g_unit_1">申报单位一</Radio>
                    <Radio value="g_unit_2">申报单位二</Radio>
                    <Radio value="g_unit_3">申报单位三</Radio>
                  </RadioGroup>)}
              </FormItem>}
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem label={'规格型号'} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
                {getFieldDecorator('rule_element', {
                  initialValue: Mention.toEditorState(fieldInits.rule_element),
                })(<Mention suggestions={this.state.suggestions} prefix="$" onSearchChange={this.handleSearch}
                  placeholder="$公式" multiLines style={{ width: '100%', height: '100%' }}
                />)}
              </FormItem>
            </Col>
          </Row>
        </Row>
      </Modal>
    );
  }
}

