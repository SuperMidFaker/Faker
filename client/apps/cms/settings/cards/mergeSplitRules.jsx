import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Card, Radio, Checkbox, Select, Row, Col, Form, Switch, Collapse } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const Panel = Collapse.Panel;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}

function getFieldInits(formData) {
  const init = { mergeOptArr: [], specialHsSortArr: [] };
  if (formData.mergeOpt_arr) {
    init.mergeOptArr = formData.mergeOpt_arr.split(',');
  }
  if (formData.specialHsSort) {
    init.specialHsSortArr = formData.specialHsSort.split(',');
  }
  return init;
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    isCustomRegisted: !!state.cmsManifest.billHead.manual_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
    fieldInits: getFieldInits(state.cmsSettings.formData),
  })
)

export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    hscodeCategories: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
  }
  state = {
    mergeSplit: true,
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
      byHsCode: false, byGName: false,
      byCurr: false, byCountry: false, byCopGNo: false, byEmGNo: false,
    };
    checkeds.forEach((chk) => {
      opt[chk] = true;
    });
  }
  handleOnChange = (checked) => {
    this.setState({ mergeSplit: checked });
  }
  render() {
    const { mergeSplit } = this.state;
    const { form: { getFieldDecorator, getFieldValue }, hscodeCategories, formData, fieldInits } = this.props;
    return (
      <Card title="归并拆分规则设置" extra={
        <FormItem>{getFieldDecorator('set_merge_split')(
          <Switch checked={mergeSplit} onChange={this.handleOnChange} />)}
        </FormItem>}
      >
        <Collapse defaultActiveKey={['merge']}>
          <Panel key="merge" header={this.msg('mergePrinciple')} >
            <Row>
              <Col span="3">
                <FormItem>
                  {getFieldDecorator('mergeOpt_checked', { initialValue: formData.mergeOpt_checked })(
                    <RadioGroup>
                      <Radio value={1}>{this.msg('conditionalMerge')}</Radio>
                      <Radio value={0}>{this.msg('nonMerge')}</Radio>
                    </RadioGroup>)}
                </FormItem>
              </Col>
              <Col offset="2">
                <Row style={{ padding: 6 }}>
                  {getFieldDecorator('mergeOpt_arr', { initialValue: fieldInits.mergeOptArr,
                  })(<CheckboxGroup options={this.mergeConditions} disabled={!getFieldValue('mergeOpt_checked')}
                    onChange={this.handleMergeCheck}
                  />)}
                </Row>
                <Row style={{ padding: 8 }}>
                  按清单数据直接生成报关单
                </Row>
              </Col>
            </Row>
          </Panel>
          <Panel key="split" header={this.msg('splitPrinciple')} >
            <Row>
              {getFieldDecorator('splitOpt_byHsCode')(
                <Checkbox defaultChecked={formData.splitOpt_byHsCode}>{this.msg('specialHscodeDeclare')}</Checkbox>)
              }
              <Col offset="1" span="20">
                {getFieldValue('splitOpt_byHsCode') &&
                <FormItem label={this.msg('specialHscodeSort')} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} >
                  {getFieldDecorator('specialHsSort', {
                    rules: [{ type: 'array' }],
                    initialValue: fieldInits.specialHsSortArr,
                  })(<Select multiple style={{ width: '100%' }} >
                    {hscodeCategories.map(ct =>
                      <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                  </Select>)}
                </FormItem>}
              </Col>
            </Row>
            <FormItem>
              {getFieldDecorator('splitOpt_tradeCurr')(
                <Checkbox defaultChecked={formData.splitOpt_tradeCurr}>{this.msg('currencySplit')}</Checkbox>)}
            </FormItem>
            {getFieldDecorator('splitOpt_perCount', {
              initialValue: formData.splitOpt_perCount })(
                <Select>
                  <Option value={20}>{'按20品拆分'}</Option>
                  <Option value={50}>{'按50品拆分'}</Option>
                </Select>)}
          </Panel>
          <Panel key="sort" header={this.msg('sortPrinciple')} >
            <FormItem>
              {getFieldDecorator('sortOpt_customControl')(
                <Checkbox defaultChecked={formData.sortOpt_customControl}>{this.msg('customOnTop')}</Checkbox>)}
            </FormItem>
            <FormItem>
              {getFieldDecorator('sortOpt_decTotal')(
                <Checkbox defaultChecked={formData.sortOpt_decTotal}>{this.msg('priceDescSort')}</Checkbox>)}
            </FormItem>
            <FormItem>
              {getFieldDecorator('sortOpt_hsCodeAsc')(
                <Checkbox defaultChecked={formData.sortOpt_hsCodeAsc}>{this.msg('hsCodeAscSort')}</Checkbox>)}
            </FormItem>
          </Panel>
        </Collapse>
      </Card>
    );
  }
}
