import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Collapse, Radio, Checkbox, Select, message, notification, Row, Col, Form } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeMergeSplitModal, submitBillMegeSplit } from 'common/reducers/cwmShFtz';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { CMS_SPLIT_COUNT, SPECIAL_COPNO_TERM } from 'common/constants';
import { formatMsg } from '../../../message.i18n';


const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
const { Panel } = Collapse;

@injectIntl
@connect(
  state => ({
    visible: state.cwmShFtzDecl.visibleMSModal,
    hscodeCategories: state.cwmShFtzDecl.hscodeCategories,
  }),
  { closeMergeSplitModal, submitBillMegeSplit, loadHsCodeCategories }
)
@Form.create()
export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    hscodeCategories: PropTypes.arrayOf(PropTypes.shape({ type: PropTypes.oneOf(['split', 'merge']) })).isRequired,
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
      bySplHscode: false,
      bySplCopNo: false,
      splHsSorts: [],
      splNoSorts: [],
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
      decTotal: '0',
      decPriceDesc: false,
      hsCodeAsc: false,
    },
    mergeOptArr: [],
    splitCategories: [],
    mergeCategories: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.loadHsCodeCategories();
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
        const splHsMergeArr = [];
        if (rule.merge_spl_hs) {
          const splArr = rule.merge_spl_hs.split(',');
          splArr.forEach((data) => {
            const numData = Number(data);
            splHsMergeArr.push(numData);
          });
        }
        const splNoMergeArr = rule.merge_spl_no ? rule.merge_spl_no.split(',') : [];
        this.setState({
          mergeOpt: {
            checked: rule.merge_checked,
            byHsCode: rule.merge_byhscode,
            byGName: rule.merge_bygname,
            byCurr: rule.merge_bycurr,
            byCountry: rule.merge_bycountry,
            byCopGNo: rule.merge_bycopgno,
            byEmGNo: rule.merge_byengno,
            bySplHscode: rule.merge_bysplhs,
            bySplCopNo: rule.merge_bysplno,
            splHsSorts: splHsMergeArr,
            splNoSorts: splNoMergeArr,
          },
          splitOpt: {
            byHsCode: rule.split_hscode,
            tradeCurr: rule.split_curr,
            byCiqDecl: !!rule.split_ciqdecl,
            byApplCert: !!rule.split_applcert,
            hsCategory: specialHsSortArr,
            perCount: rule.split_percount ? rule.split_percount.toString() : '20',
          },
          mergeOptArr,
        });
      }
      if (nextProps.hscodeCategories !== this.props.hscodeCategories &&
       nextProps.hscodeCategories.length > 0) {
        const splitCategories = nextProps.hscodeCategories.filter(ct => ct.type === 'split');
        const mergeCategories = nextProps.hscodeCategories.filter(ct => ct.type === 'merge');
        this.setState({ splitCategories, mergeCategories });
      }
    }
  }
  msg = formatMsg(this.props.intl)
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
  handleCancel = () => {
    this.props.closeMergeSplitModal();
    this.props.loadBillBody(this.props.billSeqNo);
    this.setState({ alertMsg: '', alertTitle: '' });
  }
  handleMergeRadioChange = () => {
    this.setState({
      mergeOpt: { checked: !this.state.mergeOpt.checked },
    });
  }
  handleMergeCheck = (checkeds) => {
    const opt = {
      ...this.state.mergeOpt,
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
    this.setState({
      mergeOpt: opt,
      mergeOptArr: checkeds,
    });
  }
  handleSplitSelectChange = (value) => {
    const splitOpt = { ...this.state.splitOpt, perCount: value };
    this.setState({ splitOpt });
  }
  handleCheckChange = (fieldOpt, field, value) => {
    const opt = { ...this.state[fieldOpt] };
    opt[field] = value;
    if (field === 'byCiqDecl') {
      if (value === true) {
        opt.perCount = CMS_SPLIT_COUNT[0].value;
      }
      if (value === false) {
        opt.byApplCert = false;
      }
    }
    this.setState({
      [fieldOpt]: opt,
    });
  }
  handleDecTotalSort = (value) => {
    const opt = { ...this.state.sortOpt };
    opt.decTotal = value;
    this.setState({ sortOpt: opt });
  }
  handleOk = () => {
    const { billSeqNo } = this.props;
    const {
      splitOpt, mergeOpt, sortOpt, invGen,
    } = this.state;
    if (mergeOpt.checked) {
      if (!(mergeOpt.byHsCode || mergeOpt.byGName || mergeOpt.byCurr ||
        mergeOpt.byCountry || mergeOpt.byCopGNo || mergeOpt.byEmGNo)) {
        message.error('请选择归并项');
      }
    }
    if (mergeOpt.bySplHscode) {
      mergeOpt.splHsSorts = this.props.form.getFieldValue('mergeHsSort');
    }
    if (mergeOpt.bySplCopNo) {
      mergeOpt.splNoSorts = this.props.form.getFieldValue('mergeNoSort');
    }
    if (splitOpt.byHsCode) {
      splitOpt.hsCategory = this.props.form.getFieldValue('specialSort');
    }
    this.props.submitBillMegeSplit({
      billSeqNo, splitOpt, mergeOpt, sortOpt, invGen,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        notification.success({
          message: '操作成功',
          description: '已生成报关建议书.',
        });
        this.props.closeMergeSplitModal();
      }
    });
  }
  render() {
    const {
      mergeOpt, splitOpt, splitCategories, mergeCategories,
    } = this.state;
    const { form: { getFieldDecorator }, mergeConditions } = this.props;
    return (
      <Modal
        maskClosable={false}
        title="拆分提货单明细"
        width={800}
        style={{ top: 24 }}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Form className="form-layout-compact">
          <Collapse bordered={false} defaultActiveKey={['merge', 'split']}>
            <Panel key="merge" header={this.msg('mergePrinciple')} >
              <FormItem>
                <Col span="3">
                  <Radio checked={mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                    {this.msg('conditionalMerge')}
                  </Radio>
                </Col>
                <Col offset="2" span="19">
                  <CheckboxGroup
                    options={mergeConditions}
                    disabled={!mergeOpt.checked}
                    onChange={this.handleMergeCheck}
                    value={this.state.mergeOptArr}
                  />
                </Col>
              </FormItem>
              {mergeOpt.checked && !mergeOpt.byCopGNo ? <Col offset="5">
                <FormItem>
                  <Checkbox
                    fieldOpt="mergeOpt"
                    field="bySplHscode"
                    text={this.msg('mergeSpecialHscode')}
                    onChange={this.handleCheckChange}
                    state={this.state}
                  />
                  { mergeOpt.bySplHscode ?
                    <div>
                      {getFieldDecorator('mergeHsSort', {
                  rules: [{ type: 'array' }],
                  initialValue: mergeOpt.splHsSorts,
                })(<Select
                  mode="multiple"
                  placeholder={this.msg('specialHscodeSort')}
                  style={{ width: '80%' }}
                  disabled={mergeCategories.length === 0}
                >
                  { mergeCategories.map(ct =>
                    <Option value={ct.id} key={ct.id}>{ct.name}</Option>) }
                </Select>)}
                    </div> : null}
                </FormItem>
                <FormItem>
                  <Checkbox
                    fieldOpt="mergeOpt"
                    field="bySplCopNo"
                    text={this.msg('mergeSpecialNo')}
                    onChange={this.handleCheckChange}
                    state={this.state}
                  />
                  { mergeOpt.bySplCopNo ?
                    <div>
                      {getFieldDecorator('mergeNoSort', {
                  rules: [{ type: 'array' }],
                  initialValue: mergeOpt.splNoSorts,
                })(<Select mode="multiple" style={{ width: '80%' }}>
                  { SPECIAL_COPNO_TERM.map(data =>
                     (<Option value={data.value} key={data.value}>{data.text}</Option>))}
                </Select>)}
                    </div> : null}
                </FormItem>
              </Col> : null}
              <FormItem>
                <Col span="3">
                  <Radio checked={!mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                    {this.msg('nonMerge')}
                  </Radio>
                </Col>
              </FormItem>
            </Panel>
            <Panel key="split" header={this.msg('splitPrinciple')} >
              <FormItem>
                <Checkbox
                  fieldOpt="splitOpt"
                  field="byHsCode"
                  text={this.msg('specialHscodeDeclare')}
                  onChange={this.handleCheckChange}
                  state={this.state}
                />
                { splitOpt.byHsCode ?
                  <div>
                    {getFieldDecorator('specialSort', {
                        rules: [{ type: 'array' }],
                        initialValue: splitOpt.hsCategory,
                      })(<Select mode="multiple" placeholder={this.msg('specialHscodeSort')} disabled={splitCategories.length === 0}>
                        {
                          splitCategories.map(ct =>
                            <Option value={ct.id} key={ct.id}>{ct.name}</Option>)
                        }
                      </Select>)}
                  </div> : null}
              </FormItem>

              <Row>
                <Col span={12}>
                  <FormItem>
                    <Checkbox
                      fieldOpt="splitOpt"
                      field="byCiqDecl"
                      text={this.msg('byCiqDeclSplit')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                    />
                  </FormItem>
                  <FormItem>
                    <Checkbox
                      fieldOpt="splitOpt"
                      field="byApplCert"
                      text={this.msg('byApplCertSplit')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                      disabled={!splitOpt.byCiqDecl}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem>
                    <Select
                      onChange={this.handleSplitSelectChange}
                      value={this.state.splitOpt.perCount}
                    >
                      {
                    CMS_SPLIT_COUNT.map(sc =>
                      <Option key={sc.value} value={sc.value}>{sc.text}</Option>)
                  }
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Checkbox
                      fieldOpt="splitOpt"
                      field="tradeCurr"
                      text={this.msg('currencySplit')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                    />
                  </FormItem>
                </Col>

              </Row>
            </Panel>
          </Collapse>
        </Form>
      </Modal>
    );
  }
}
