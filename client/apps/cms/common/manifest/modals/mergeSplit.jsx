import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Modal, Card, Radio, Checkbox, Select, message, Row, Col, Form } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeMergeSplitModal, submitBillMegeSplit } from 'common/reducers/cmsManifest';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
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
  let disabled = false;
  if (fieldOpt === 'sortOpt' && field === 'customControl') {
    disabled = true;
  }
  return (
    <div>
      <Checkbox onChange={handleChange} checked={state[fieldOpt][field]} disabled={disabled}>
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
    billNo: state.cmsManifest.billHead.bill_seq_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
  }),
  { closeMergeSplitModal, submitBillMegeSplit }
)
@Form.create()
export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    billNo: PropTypes.string,
    hscodeCategories: PropTypes.array.isRequired,
  }
  state = {
    mergeOpt: {
      checked: false,
      byHsCode: false,
      byGName: false,
      byCurr: false,
      byCountry: false,
      byCopGNo: false,
      byEmGNo: false,
    },
    splitOpt: {
      byHsCode: false,
      byCustom: false,
      tradeCurr: false,
      hsCategory: [],
      perCount: 20,
    },
    sortOpt: {
      customControl: true,
      inspectQuarantine: false,
      decTotal: false,
      decPriceDesc: false,
      hsCodeAsc: false,
    },
    sortSelectValue: '',
    gnameVal: 'by20',
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
    const splitOpt = { ...this.state.splitOpt };
    if (value === 'by20') {
      splitOpt.perCount = 20;
    } else if (value === 'by50') {
      splitOpt.perCount = 50;
    }
    this.setState({
      splitOpt,
      gnameVal: value,
    });
  }
  handleCheckChange = (fieldOpt, field, value) => {
    const opt = { ...this.state[fieldOpt] };
    opt[field] = value;
    this.setState({
      [fieldOpt]: opt,
    });
  }
  handleOk = () => {
    const { billNo } = this.props;
    const { splitOpt, mergeOpt, sortOpt } = this.state;
    if (splitOpt.byHsCode) {
      splitOpt.hsCategory = this.props.form.getFieldValue('specialSort');
    }
    this.props.submitBillMegeSplit({ billNo, splitOpt, mergeOpt, sortOpt }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.closeMergeSplitModal();
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
      <Modal onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Row style={{ paddingTop: '20px' }}>
          <Col span="24" style={{ marginBottom: '10px' }}>
            <Card title={this.msg('mergePrinciple')} bordered>
              <Row>
                <Col span="3">
                  <Radio checked={mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                    {this.msg('conditionalMerge')}
                  </Radio>
                </Col>
                <Col offset="2" span="19">
                  <CheckboxGroup options={mergeConditions} disabled={!mergeOpt.checked}
                    onChange={this.handleMergeCheck}
                  />
                </Col>
              </Row>
              <Row>
                <Col span="3">
                  <Radio checked={!mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                    {this.msg('nonMerge')}
                  </Radio>
                </Col>
                <Col offset="2" span="19">
                  按清单数据直接生成报关单（并按原数据排序）
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span="12">
            <Card title={this.msg('splitPrinciple')} bordered>
              <MSCheckbox fieldOpt="splitOpt" field="byHsCode"
                text={this.msg('specialHscodeDeclare')}
                onChange={this.handleCheckChange} state={this.state}
              />
              { splitOpt.byHsCode &&
                <FormItem label={this.msg('specialHscodeSort')}>
                  {getFieldDecorator('specialSort', {
                    rules: [{ type: 'array' }],
                  })(<Select multiple style={{ width: '100%' }} >
                    {
                        hscodeCategories.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.name}</Option>
                        )
                      }
                  </Select>)}
                </FormItem>
              }
              <MSCheckbox fieldOpt="splitOpt" field="tradeCurr"
                text={this.msg('currencySplit')}
                onChange={this.handleCheckChange} state={this.state}
              />
              <Select onChange={this.handleSplitSelectChange} value={this.state.gnameVal}
                style={{ width: '100%' }}
              >
                <Option value="by20">{'按20品拆分'}</Option>
                <Option value="by50">{'按50品拆分'}</Option>
              </Select>
            </Card>
          </Col>
          <Col span="11" offset="1">
            <Card title={this.msg('sortPrinciple')} bordered>
              <MSCheckbox fieldOpt="sortOpt" field="customControl"
                text={this.msg('customOnTop')}
                onChange={this.handleCheckChange} state={this.state}
              />
              <Select onChange={this.handleSortSelectChange} value={this.state.sortSelectValue}
                style={{ width: '100%' }}
              >
                <Option value="hsCodeAsc">{this.msg('hsCodeAscSort')}</Option>
                <Option value="decTotal">{this.msg('priceDescSort')}</Option>
              </Select>
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}
