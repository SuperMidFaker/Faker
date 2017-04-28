import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Modal, Card, Radio, Checkbox, Select, message, notification, Row, Col, Form } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeMergeSplitModal, submitBillMegeSplit, loadBillBody } from 'common/reducers/cmsManifest';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { CMS_SPLIT_COUNT } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

function MSCheckbox(props) {
  const { state, fieldOpt, field, text, onChange } = props;
  function handleChange(ev) {
    onChange(fieldOpt, field, ev.target.checked);
  }
  return (
    <div>
      <Checkbox onChange={handleChange} checked={state[fieldOpt][field]}>
        {text}
      </Checkbox>
    </div>
  );
}

MSCheckbox.propTypes = {
  fieldOpt: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    visible: state.cmsManifest.visibleMSModal,
    isCustomRegisted: !!state.cmsManifest.billHead.manual_no,
    billSeqNo: state.cmsManifest.billHead.bill_seq_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
    billRule: state.cmsManifest.billRule,
  }),
  { closeMergeSplitModal, submitBillMegeSplit, loadBillBody }
)
@Form.create()
export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    billSeqNo: PropTypes.string,
    hscodeCategories: PropTypes.array.isRequired,
  }
  state = {
    mergeOpt: {
      checked: false,
      byHsCode: true,
      byGName: false,
      byCurr: false,
      byCountry: false,
      byCopGNo: false,
      byEmGNo: false,
    },
    splitOpt: {
      byHsCode: false,
      tradeCurr: false,
      hsCategory: [],
      perCount: '20',
    },
    sortOpt: {
      customControl: true,
      inspectQuarantine: false,
      decTotal: false,
      decPriceDesc: false,
      hsCodeAsc: false,
    },
    mergeOptArr: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billRule !== this.props.billRule) {
      const rule = nextProps.billRule;
      const mergeOptArr = [];
      if (rule.merge_byhscode) {
        mergeOptArr.push('byHsCode');
      }
      if (rule.merge_bygname) {
        mergeOptArr.push('byGName');
      }
      if (rule.merge_bycurr) {
        mergeOptArr.push('byCurr');
      }
      if (rule.merge_bycountry) {
        mergeOptArr.push('byCountry');
      }
      if (rule.merge_bycopgno) {
        mergeOptArr.push('byCopGNo');
      }
      if (rule.merge_byengno) {
        mergeOptArr.push('byEmGNo');
      }
      const specialHsSortArr = [];
      if (rule.split_spl_category) {
        const splArr = rule.split_spl_category.split(',');
        splArr.forEach((data) => {
          const numData = Number(data);
          specialHsSortArr.push(numData);
        });
      }
      this.setState({
        mergeOpt: {
          checked: rule.merge_checked,
          byHsCode: rule.merge_byhscode,
          byGName: rule.merge_bygname,
          byCurr: rule.merge_bycurr,
          byCountry: rule.merge_bycountry,
          byCopGNo: rule.merge_bycopgno,
          byEmGNo: rule.merge_byengno,
        },
        splitOpt: {
          byHsCode: rule.split_hscode,
          tradeCurr: rule.split_curr,
          hsCategory: specialHsSortArr,
          perCount: rule.split_percount || '20',
        },
        sortOpt: {
          customControl: rule.sort_customs,
          decTotal: rule.sort_dectotal,
          hsCodeAsc: rule.sort_hscode,
        },
        mergeOptArr,
      });
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
  handleCancel = () => {
    this.props.closeMergeSplitModal();
    this.props.loadBillBody(this.props.billSeqNo);
  }
  handleMergeRadioChange = () => {
    this.setState({
      mergeOpt: { checked: !this.state.mergeOpt.checked },
    });
  }
  handleMergeCheck = (checkeds) => {
    const opt = {
      checked: this.state.mergeOpt.checked, byHsCode: false, byGName: false,
      byCurr: false, byCountry: false, byCopGNo: false, byEmGNo: false,
    };
    checkeds.forEach((chk) => {
      opt[chk] = true;
    });
    this.setState({
      mergeOpt: opt,
      mergeOptArr: checkeds,
    });
  }
  handleSortSelectChange = (value) => {
    const sortOpt = { ...this.state.sortOpt };
    if (value === 'hsCodeAsc') {
      sortOpt.hsCodeAsc = true;
      sortOpt.decTotal = false;
    } else if (value === 'decTotal') {
      sortOpt.decTotal = true;
      sortOpt.hsCodeAsc = false;
    }
    this.setState({
      sortOpt,
      sortSelectValue: value,
    });
  }
  handleSplitSelectChange = (value) => {
    const splitOpt = { ...this.state.splitOpt, perCount: value };
    this.setState({ splitOpt });
  }
  handleCheckChange = (fieldOpt, field, value) => {
    const opt = { ...this.state[fieldOpt] };
    opt[field] = value;
    this.setState({
      [fieldOpt]: opt,
    });
  }
  handleOk = () => {
    const { billSeqNo } = this.props;
    const { splitOpt, mergeOpt, sortOpt } = this.state;
    if (mergeOpt.checked) {
      if (!(mergeOpt.byHsCode || mergeOpt.byGName || mergeOpt.byCurr ||
        mergeOpt.byCountry || mergeOpt.byCopGNo || mergeOpt.byEmGNo)) {
        return message.error('请选择归并项');
      }
    }
    if (splitOpt.byHsCode) {
      splitOpt.hsCategory = this.props.form.getFieldValue('specialSort');
    }
    this.props.submitBillMegeSplit({ billSeqNo, splitOpt, mergeOpt, sortOpt }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        notification.success({
          message: '操作成功',
          description: '已生成报关草单.',
        });
        this.props.closeMergeSplitModal();
        this.props.loadBillBody(this.props.billSeqNo);
      }
    });
  }
  render() {
    const { mergeOpt, splitOpt } = this.state;
    const { form: { getFieldDecorator }, hscodeCategories } = this.props;
    let mergeConditions = this.mergeConditions;
    if (this.props.isCustomRegisted) {
      mergeConditions = [...mergeConditions, { label: this.msg('emGNo'), value: 'byEmGNo' }];
    }
    return (
      <Modal title="生成报关草单" width={800} onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Form>
          <Row gutter={16}>
            <Col span="24">
              <Card title={this.msg('mergePrinciple')}>
                <FormItem>
                  <Col span="3">
                    <Radio checked={mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                      {this.msg('conditionalMerge')}
                    </Radio>
                  </Col>
                  <Col offset="2" span="19">
                    <CheckboxGroup options={mergeConditions} disabled={!mergeOpt.checked}
                      onChange={this.handleMergeCheck} value={this.state.mergeOptArr}
                    />
                  </Col>
                </FormItem>
                <FormItem>
                  <Col span="3">
                    <Radio checked={!mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                      {this.msg('nonMerge')}
                    </Radio>
                  </Col>
                  <Col offset="2" span="19">
                  按清单数据直接生成报关单（并按原数据排序）
                </Col>
                </FormItem>
              </Card>
            </Col>
            <Col span="12">
              <Card title={this.msg('splitPrinciple')}>
                <FormItem>
                  <Select onChange={this.handleSplitSelectChange} value={this.state.splitOpt.perCount}>
                    {
                    CMS_SPLIT_COUNT.map(sc => <Option key={sc.value} value={sc.value}>{sc.text}</Option>)
                  }
                  </Select>
                </FormItem>
                <FormItem>
                  <MSCheckbox fieldOpt="splitOpt" field="byHsCode"
                    text={this.msg('specialHscodeDeclare')}
                    onChange={this.handleCheckChange} state={this.state}
                  />
                  { splitOpt.byHsCode ?
                    <div>
                      {getFieldDecorator('specialSort', {
                        rules: [{ type: 'array' }],
                        initialValue: splitOpt.hsCategory,
                      })(<Select size="large" mode="multiple" placeholder={this.msg('specialHscodeSort')}>
                        {
                          hscodeCategories.map(ct =>
                            <Option value={ct.id} key={ct.id}>{ct.name}</Option>
                          )
                        }
                      </Select>)}
                    </div> : null}
                </FormItem>
                <FormItem>
                  <MSCheckbox fieldOpt="splitOpt" field="tradeCurr"
                    text={this.msg('currencySplit')}
                    onChange={this.handleCheckChange} state={this.state}
                  />
                </FormItem>
              </Card>
            </Col>
            <Col span="12">
              <Card title={this.msg('sortPrinciple')}>
                <FormItem>
                  <MSCheckbox fieldOpt="sortOpt" field="customControl"
                    text={this.msg('customOnTop')}
                    onChange={this.handleCheckChange} state={this.state}
                  />
                </FormItem>
                <FormItem>
                  <MSCheckbox fieldOpt="sortOpt" field="decTotal"
                    text={this.msg('priceDescSort')}
                    onChange={this.handleCheckChange} state={this.state}
                  />
                </FormItem>
                <FormItem>
                  <MSCheckbox fieldOpt="sortOpt" field="hsCodeAsc"
                    text={this.msg('hsCodeAscSort')}
                    onChange={this.handleCheckChange} state={this.state}
                  />
                </FormItem>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
