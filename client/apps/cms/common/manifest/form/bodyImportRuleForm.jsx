import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Radio, Mention, Row, Col } from 'antd';
import { closeRuleModel } from 'common/reducers/cmsManifest';
import { SOURCE_CHOOSE } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Nav } = Mention;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    billHead: state.cmsManifest.billHead,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    billRule: state.cmsManifest.billRule,
  }),
  { closeRuleModel }
)
export default class ImportRuleForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
  }
  state = {
    suggestions: [],
  }
  componentWillReceiveProps(nextProps) {
    const { formData } = nextProps;
    if (nextProps.formData !== this.props.formData) {
      this.props.form.setFieldsValue({ rule_element: Mention.toContentState(formData.rule_element) });
    }
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
      item.value.toLowerCase().indexOf(searchValue) !== -1);
    const suggestions = filtered.map(suggestion =>
      (<Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>));
    this.setState({ suggestions });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, formData } = this.props;
    return (
      <div className="form-layout-compact">
        <Row>
          <Col sm={24} lg={12}>
            <FormItem label="商品名称" {...formItemLayout} >
              {getFieldDecorator('rule_g_name', { initialValue: formData.rule_g_name })(<RadioGroup>
                <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
              </RadioGroup>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label="币制" {...formItemLayout} >
              {getFieldDecorator('rule_currency', { initialValue: formData.rule_currency })(<RadioGroup>
                <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
              </RadioGroup>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={12}>
            <FormItem label="原产国" {...formItemLayout} >
              {getFieldDecorator('rule_orig_country', { initialValue: formData.rule_orig_country })(<RadioGroup>
                <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
              </RadioGroup>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label="净重" {...formItemLayout} >
              {getFieldDecorator('rule_net_wt', { initialValue: formData.rule_net_wt })(<RadioGroup>
                <RadioButton value={SOURCE_CHOOSE.import.key}>{SOURCE_CHOOSE.import.value}</RadioButton>
                <RadioButton value={SOURCE_CHOOSE.item.key}>{SOURCE_CHOOSE.item.value}</RadioButton>
              </RadioGroup>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="申报单位" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
              {getFieldDecorator('rule_gunit_num', { initialValue: formData.rule_gunit_num })(<RadioGroup>
                <Radio value="g_unit_1">申报单位一</Radio>
                <Radio value="g_unit_2">申报单位二</Radio>
                <Radio value="g_unit_3">申报单位三</Radio>
              </RadioGroup>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="规格型号" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
              {getFieldDecorator('rule_element', {
                initialValue: Mention.toContentState(formData.rule_element),
              })(<Mention
                suggestions={this.state.suggestions}
                prefix="$"
                onSearchChange={this.handleSearch}
                placeholder="示例(固定值+备注)：String + $remark"
                multiLines
                style={{ width: '100%', height: '100%' }}
              />)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}

