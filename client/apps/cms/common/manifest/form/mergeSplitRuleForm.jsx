import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Radio, Checkbox, Select, Row, Col, Form, Collapse } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { CMS_SPLIT_COUNT, SPECIAL_COPNO_TERM } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
const { Panel } = Collapse;

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  hscodeCategories: state.cmsHsCode.hscodeCategories,
}))

export default class MergeSplitForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    hscodeCategories: PropTypes.arrayOf(PropTypes.shape({ type: PropTypes.oneOf(['split', 'merge']) })).isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    formData: PropTypes.shape({ merge_checked: PropTypes.bool }).isRequired,
  }
  state = {
    mergeOpt: {
      byCopGNo: (this.props.formData.mergeOpt_arr.indexOf('byCopGNo') !== -1),
    },
    splitCategories: [],
    mergeCategories: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.hscodeCategories !== this.props.hscodeCategories
      && nextProps.hscodeCategories.length > 0) {
      const splitCategories = nextProps.hscodeCategories.filter(ct => ct.type === 'split');
      const mergeCategories = nextProps.hscodeCategories.filter(ct => ct.type === 'merge');
      this.setState({ splitCategories, mergeCategories });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  mergeConditions = [{
    label: this.msg('codeT'),
    value: 'byHsCode',
  }, {
    label: this.msg('productName'),
    value: 'byGName',
  }, {
    label: this.msg('currency'),
    value: 'byCurr',
  }, {
    label: this.msg('origCountry'),
    value: 'byCountry',
  }, {
    label: this.msg('productCode'),
    value: 'byCopGNo',
  }]
  handleMergeCheck = (checkeds) => {
    const opt = {
      byHsCode: false,
      byGName: false,
      byCurr: false,
      byCountry: false,
      byCopGNo: false,
      byEmGNo: false,
    };
    checkeds.forEach((chk) => {
      opt[chk] = true;
    });
    this.setState({ mergeOpt: { ...this.state.mergeOpt, byCopGNo: opt.byCopGNo } });
  }
  handleSplitCiqdeclCheck = (ev) => {
    if (ev.target.checked) {
      this.props.form.setFieldsValue({ split_percount: CMS_SPLIT_COUNT[0].value });
    } else {
      this.props.form.setFieldsValue({ split_applcert: false });
    }
  }
  handleMergeRadioUncheck = (ev) => {
    this.props.form.setFieldsValue({
      merge_check_radio: false,
      mergeOpt_arr: [],
      merge_bysplhs: false,
      merge_spl_hs: [],
      merge_bysplno: false,
      merge_spl_no: [],
    });
    return ev.target.checked;
  }
  handleMergeRadioCheck = (ev) => {
    this.props.form.setFieldsValue({ merge_uncheck_radio: false });
    return ev.target.checked;
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, formData } = this.props;
    const { splitCategories, mergeCategories, mergeOpt } = this.state;
    const ciqdeclSplit = getFieldValue('split_ciqdecl');
    const mergeChecked = getFieldValue('merge_check_radio');
    return (
      <Row style={{ marginBottom: 24 }}>
        <Collapse bordered={false} defaultActiveKey={['merge', 'split', 'sort']}>
          <Panel key="merge" header={this.msg('mergePrinciple')} >
            <FormItem>
              <Col span="3">
                {getFieldDecorator('merge_uncheck_radio', { valuePropName: 'checked', getValueFromEvent: this.handleMergeRadioUncheck, initialValue: !formData.merge_checked })(<Radio>
                  {this.msg('nonMerge')}
                </Radio>)}
              </Col>
              <Col offset="2" span="19">
                按清单数据直接生成报关建议书
              </Col>
            </FormItem>
            <FormItem>
              <Col span="3">
                {getFieldDecorator('merge_check_radio', { valuePropName: 'checked', getValueFromEvent: this.handleMergeRadioCheck, initialValue: formData.merge_checked })(<Radio>
                  {this.msg('conditionalMerge')}
                </Radio>)}
              </Col>
              <Col offset="2" span="19">
                {getFieldDecorator('mergeOpt_arr', { initialValue: formData.mergeOpt_arr })(<CheckboxGroup
                  options={this.mergeConditions}
                  disabled={!mergeChecked}
                  onChange={this.handleMergeCheck}
                />)}
              </Col>
            </FormItem>
            {mergeChecked && !mergeOpt.byCopGNo ? <Col offset="5">
              <FormItem>
                {getFieldDecorator('merge_bysplhs', { initialValue: !!formData.merge_bysplhs, valuePropName: 'checked' })(<Checkbox>{this.msg('mergeSpecialHscode')}</Checkbox>)
                  }
                {getFieldValue('merge_bysplhs') &&
                <div>
                  {getFieldDecorator('merge_spl_hs', {
                    rules: [{ type: 'array' }],
                    initialValue: formData.splHsMergeArr,
                  })(<Select mode="multiple">
                    {mergeCategories.map(ct =>
                      <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                  </Select>)}
                </div>
                  }
              </FormItem>
              <FormItem>
                {getFieldDecorator('merge_bysplno', { initialValue: !!formData.merge_bysplno, valuePropName: 'checked' })(<Checkbox>{this.msg('mergeSpecialNo')}</Checkbox>)
                  }
                {getFieldValue('merge_bysplno') &&
                <div>
                  {getFieldDecorator('merge_spl_no', {
                    rules: [{ type: 'array' }],
                    initialValue: formData.splNoMergeArr,
                  })(<Select mode="multiple">
                    { SPECIAL_COPNO_TERM.map(data => (
                      <Option value={data.value} key={data.value}>{data.text}</Option>))}
                  </Select>)}
                </div>
                  }
              </FormItem>
            </Col> : null}
          </Panel>
          <Panel key="split" header={this.msg('splitPrinciple')} >
            <FormItem>
              {getFieldDecorator('split_percount', { initialValue: formData.split_percount })(<Select >
                {
                  CMS_SPLIT_COUNT.map(sc =>
                    <Option key={sc.value} value={sc.value}>{sc.text}</Option>)
                    }
              </Select>)}
            </FormItem>
            <FormItem>
              {getFieldDecorator('split_hscode', { initialValue: !!formData.split_hscode, valuePropName: 'checked' })(<Checkbox>{this.msg('specialHscodeDeclare')}</Checkbox>)
              }
              {getFieldValue('split_hscode') &&
                <div>
                    {getFieldDecorator('split_spl_category', {
                      rules: [{ type: 'array' }],
                      initialValue: formData.specialHsSortArr,
                    })(<Select mode="multiple" placeholder={this.msg('specialHscodeSort')}>
                      {splitCategories.map(ct =>
                        <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                    </Select>)}
                </div>
              }
            </FormItem>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('split_ciqdecl', {
                  initialValue: formData.split_ciqdecl,
                  onChange: this.handleSplitCiqdeclCheck,
                  valuePropName: 'checked',
                })(<Checkbox>{this.msg('byCiqDeclSplit')}</Checkbox>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator(
                  'split_applcert',
                  { initialValue: formData.split_applcert, valuePropName: 'checked' }
                )(<Checkbox disabled={!ciqdeclSplit}>{this.msg('byApplCertSplit')}</Checkbox>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('split_curr', { initialValue: formData.split_curr, valuePropName: 'checked' })(<Checkbox>{this.msg('currencySplit')}</Checkbox>)}
              </FormItem>
            </Col>
          </Panel>
          <Panel key="sort" header={this.msg('sortPrinciple')} >
            <Row>
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('sort_customs', { initialValue: formData.sort_customs, valuePropName: 'checked' })(<Checkbox>{this.msg('customOnTop')}</Checkbox>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('sort_dectotal', { initialValue: formData.sort_dectotal, valuePropName: 'checked' })(<Checkbox>{this.msg('priceDescSort')}</Checkbox>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('sort_hscode', { initialValue: formData.sort_hscode, valuePropName: 'checked' })(<Checkbox>{this.msg('hsCodeAscSort')}</Checkbox>)}
                </FormItem>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Row>
    );
  }
}
