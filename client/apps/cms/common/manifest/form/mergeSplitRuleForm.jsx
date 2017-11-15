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
const Option = Select.Option;
const Panel = Collapse.Panel;

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    isCustomRegisted: !!state.cmsManifest.billHead.manual_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
  })
)

export default class MergeSplitForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    hscodeCategories: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
  }
  state = {
    mergeOpt: {
      checked: this.props.formData.merge_checked,
      byCopGNo: (this.props.formData.mergeOpt_arr.indexOf('byCopGNo') !== -1),
    },
    splitCategories: [],
    mergeCategories: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.hscodeCategories !== this.props.hscodeCategories && nextProps.hscodeCategories.length > 0) {
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
    label: this.msg('icountry'),
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
  handleMergeRadioChange = () => {
    this.setState({
      mergeOpt: { checked: !this.state.mergeOpt.checked },
    });
    return !this.state.mergeOpt.checked;
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, formData } = this.props;
    const { splitCategories, mergeCategories, mergeOpt } = this.state;
    return (
      <Row style={{ marginBottom: 24 }}>
        <Collapse bordered={false} defaultActiveKey={['merge', 'split', 'sort']}>
          <Panel key="merge" header={this.msg('mergePrinciple')} >
            <FormItem>
              <Col span="3">
                {getFieldDecorator('merge_checked', { getValueFromEvent: this.handleMergeRadioChange })(
                  <Radio checked={mergeOpt.checked}>
                    {this.msg('conditionalMerge')}
                  </Radio>)}
              </Col>
              <Col offset="2" span="19">
                {getFieldDecorator('mergeOpt_arr', { initialValue: formData.mergeOpt_arr,
                })(<CheckboxGroup options={this.mergeConditions} disabled={!mergeOpt.checked}
                  onChange={this.handleMergeCheck}
                />)}
              </Col>
            </FormItem>
            {mergeOpt.checked && !mergeOpt.byCopGNo ? <Col offset="5">
              <FormItem>
                {getFieldDecorator('merge_bysplhs', { initialValue: formData.merge_bysplhs === 1 })(
                  <Checkbox defaultChecked={formData.merge_bysplhs}>{this.msg('mergeSpecialHscode')}</Checkbox>)
                  }
                {getFieldValue('merge_bysplhs') &&
                <div>
                  {getFieldDecorator('merge_spl_hs', {
                    rules: [{ type: 'array' }],
                    initialValue: formData.splHsMergeArr,
                  })(<Select mode="multiple" placeholder={this.msg('specialHscodeSort')}>
                    {mergeCategories.map(ct =>
                      <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                  </Select>)}
                </div>
                  }
              </FormItem>
              <FormItem>
                {getFieldDecorator('merge_bysplno', { initialValue: formData.merge_bysplno === 1 })(
                  <Checkbox defaultChecked={formData.merge_bysplno}>{this.msg('mergeSpecialNo')}</Checkbox>)
                  }
                {getFieldValue('merge_bysplno') &&
                <div>
                  {getFieldDecorator('merge_spl_no', {
                    rules: [{ type: 'array' }],
                    initialValue: formData.splNoMergeArr,
                  })(<Select mode="multiple">
                    { SPECIAL_COPNO_TERM.map(data => (<Option value={data.value} key={data.value}>{data.text}</Option>))}
                  </Select>)}
                </div>
                  }
              </FormItem>
            </Col> : null}
            <FormItem>
              <Col span="3">
                {getFieldDecorator('merge_checked', { getValueFromEvent: this.handleMergeRadioChange })(
                  <Radio checked={!mergeOpt.checked}>
                    {this.msg('nonMerge')}
                  </Radio>)}
              </Col>
              <Col offset="2" span="19">
                按清单数据直接生成报关建议书
              </Col>
            </FormItem>
          </Panel>
          <Panel key="split" header={this.msg('splitPrinciple')} >
            <FormItem>
              {getFieldDecorator('split_percount', {
                initialValue: formData.split_percount })(
                  <Select >
                    {
                      CMS_SPLIT_COUNT.map(sc => <Option key={sc.value} value={sc.value}>{sc.text}</Option>)
                    }
                  </Select>)}
            </FormItem>
            <FormItem>
              {getFieldDecorator('split_hscode', { initialValue: formData.split_hscode === 1 })(
                <Checkbox defaultChecked={formData.split_hscode}>{this.msg('specialHscodeDeclare')}</Checkbox>)
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
            <FormItem>
              {getFieldDecorator('split_curr', { initialValue: formData.split_curr })(
                <Checkbox defaultChecked={formData.split_curr}>{this.msg('currencySplit')}</Checkbox>)}
            </FormItem>
          </Panel>
          <Panel key="sort" header={this.msg('sortPrinciple')} >
            <Row>
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('sort_customs', { initialValue: formData.sort_customs })(
                    <Checkbox defaultChecked={formData.sort_customs}>{this.msg('customOnTop')}</Checkbox>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('sort_dectotal', { initialValue: formData.sort_dectotal })(
                    <Checkbox defaultChecked={formData.sort_dectotal}>{this.msg('priceDescSort')}</Checkbox>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('sort_hscode', { initialValue: formData.sort_hscode })(
                    <Checkbox defaultChecked={formData.sort_hscode}>{this.msg('hsCodeAscSort')}</Checkbox>)}
                </FormItem>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Row>
    );
  }
}
