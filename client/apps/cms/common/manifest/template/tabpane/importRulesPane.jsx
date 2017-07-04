import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { SOURCE_CHOOSE } from 'common/constants';
import { Mention, Switch, Card, Row, Col, Form, Radio } from 'antd';

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
    init.rule_element = formData.rule_element ? formData.rule_element : '$g_model';
  }
  return init;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    fieldInits: getFieldInits(state.cmsManifest.formData),
  })
)
export default class ImportRulesPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object,
    formData: PropTypes.object.isRequired,
  }
  state = {
    specialCode: true,
    suggestions: [],
  }
  componentWillReceiveProps(nextProps) {
    const { fieldInits } = nextProps;
    if (nextProps.formData !== this.props.formData) {
      this.setState({ specialCode: !!nextProps.formData.set_special_code });
      this.props.form.setFieldsValue({ rule_element: Mention.toContentState(fieldInits.rule_element) });
    }
  }
  handleOnChange = (checked) => {
    this.setState({ specialCode: checked });
  }
  formulaParams = [
    { value: 'g_model', text: '规格型号' },
    { value: 'remark', text: '备注' },
    { value: 'cop_product_no', text: '商品货号' },
    { value: 'null', text: '空' },
  ];
  handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = this.formulaParams.filter(item =>
      item.value.toLowerCase().indexOf(searchValue) !== -1
    );
    const suggestions = filtered.map(suggestion =>
      (<Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>));
    this.setState({ suggestions });
  }
  render() {
    const { form: { getFieldDecorator }, fieldInits } = this.props;
    const { specialCode } = this.state;
    return (
      <div className="pane">
        <div className="panel-header">
          <FormItem>{getFieldDecorator('set_special_code')(
            <Switch checked={specialCode} onChange={this.handleOnChange} checkedChildren={'启用'} unCheckedChildren={'关闭'} />)}
          </FormItem>
        </div>
        <div className="pane-content">
          <Card>
            <Row gutter={20}>
              <Col sm={24} lg={12}>
                <FormItem label={'商品名称'} {...formItemLayout} >
                  {getFieldDecorator('rule_g_name', { initialValue: fieldInits.rule_g_name })(
                    <RadioGroup disabled={!specialCode} >
                      <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                      <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                    </RadioGroup>)}
                </FormItem>
              </Col>
              <Col sm={24} lg={12}>
                <FormItem label={'币制'} {...formItemLayout} >
                  {getFieldDecorator('rule_currency', { initialValue: fieldInits.rule_currency })(
                    <RadioGroup disabled={!specialCode} >
                      <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                      <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                    </RadioGroup>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col sm={24} lg={12}>
                <FormItem label={'原产国'} {...formItemLayout} >
                  {getFieldDecorator('rule_orig_country', { initialValue: fieldInits.rule_orig_country })(
                    <RadioGroup disabled={!specialCode} >
                      <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                      <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                    </RadioGroup>)}
                </FormItem>
              </Col>
              <Col sm={24} lg={12}>
                <FormItem label={'净重'} {...formItemLayout} >
                  {getFieldDecorator('rule_net_wt', { initialValue: fieldInits.rule_net_wt })(
                    <RadioGroup disabled={!specialCode} >
                      <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                      <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
                    </RadioGroup>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col>
                <FormItem label={'申报单位'} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
                  {getFieldDecorator('rule_gunit_num', { initialValue: fieldInits.rule_gunit_num })(
                    <RadioGroup disabled={!specialCode} >
                      <Radio value="g_unit_1">申报单位一</Radio>
                      <Radio value="g_unit_2">申报单位二</Radio>
                      <Radio value="g_unit_3">申报单位三</Radio>
                    </RadioGroup>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col>
                <FormItem label={'规格型号'} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
                  {getFieldDecorator('rule_element', {
                    initialValue: Mention.toContentState(fieldInits.rule_element),
                  })(<Mention suggestions={this.state.suggestions} prefix="$" onSearchChange={this.handleSearch}
                    placeholder="示例(固定值+备注)：String + $remark" multiLines style={{ width: '100%', height: '100%' }}
                  />)}
                </FormItem>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    );
  }
}