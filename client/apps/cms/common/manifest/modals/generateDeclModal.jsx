import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Modal, Collapse, Radio, Checkbox, Select, message, notification, Row, Col, Form } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeMergeSplitModal, submitBillMegeSplit, loadBillBody } from 'common/reducers/cmsManifest';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { CMS_SPLIT_COUNT, SPECIAL_COPNO_TERM } from 'common/constants';
import { formatMsg } from '../../message.i18n';


const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
const { Panel } = Collapse;

function MSCheckbox(props) {
  const {
    state, fieldOpt, field, text, onChange, disabled,
  } = props;
  function handleChange(ev) {
    onChange(fieldOpt, field, ev.target.checked);
  }
  return (
    <Checkbox onChange={handleChange} checked={state[fieldOpt][field]} disabled={disabled}>
      {text}
    </Checkbox>
  );
}

MSCheckbox.propTypes = {
  fieldOpt: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  state: PropTypes.shape({ mergeOpt: PropTypes.shape({ checked: PropTypes.bool }) }).isRequired,
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
    manualDecl: !!state.cmsManifest.billHead.manual_no,
    billSeqNo: state.cmsManifest.billHead.bill_seq_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
    billRule: state.cmsManifest.billRule,
    billMeta: state.cmsManifest.billMeta,
    tenantId: state.account.tenantId,
    invTemplates: state.cmsInvoice.invTemplates,
  }),
  { closeMergeSplitModal, submitBillMegeSplit, loadBillBody }
)
@Form.create()
export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    manualDecl: PropTypes.bool.isRequired,
    billSeqNo: PropTypes.string,
    hscodeCategories: PropTypes.arrayOf(PropTypes.shape({ type: PropTypes.oneOf(['split', 'merge']) })).isRequired,
    invTemplates: PropTypes.array.isRequired,
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
    invGen: {
      gen_invoice: false,
      invoice_template_id: null,
      gen_contract: false,
      contract_template_id: null,
      gen_packing_list: false,
      packing_list_template_id: null,
    },
    mergeOptArr: [],
    splitCategories: [],
    mergeCategories: [],
    alertTitle: '',
    alertMsg: '',
    invoiceTemplates: [],
    packingListTemplates: [],
    contractTemplates: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.invTemplates !== this.props.invTemplates) {
      const invoiceTemplates = nextProps.invTemplates.filter(tp => tp.docu_type === 0);
      const contractTemplates = nextProps.invTemplates.filter(tp => tp.docu_type === 1);
      const packingListTemplates = nextProps.invTemplates.filter(tp => tp.docu_type === 2);
      this.setState({ invoiceTemplates, contractTemplates, packingListTemplates });
    }
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
        sortOpt: {
          customControl: rule.sort_customs,
          decTotal: String(rule.sort_dectotal),
          hsCodeAsc: rule.sort_hscode,
        },
        invGen: {
          gen_invoice: rule.gen_invoice,
          invoice_template_id: rule.invoice_template_id,
          gen_contract: rule.gen_contract,
          contract_template_id: rule.contract_template_id,
          gen_packing_list: rule.gen_packing_list,
          packing_list_template_id: rule.packing_list_template_id,
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
    const { splitOpt, mergeOpt, sortOpt, invGen } = this.state;
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
    if (invGen.gen_invoice) {
      invGen.invoice_template_id = this.props.form.getFieldValue('invoice_template_id');
    }
    if (invGen.gen_packing_list) {
      invGen.packing_list_template_id = this.props.form.getFieldValue('packing_list_template_id');
    }
    if (invGen.gen_contract) {
      invGen.contract_template_id = this.props.form.getFieldValue('contract_template_id');
    }
    this.props.submitBillMegeSplit({
      billSeqNo, splitOpt, mergeOpt, sortOpt, invGen
    }).then((result) => {
      if (result.error) {
        if (result.error.message.key === 'ftz-detail-splited') {
          const ids = result.error.message.details;
          const title = '以下相同分拨出库明细会被拆分至不同报关单,将导致报关单与集中申报单内容不一致:';
          const msg = <span>{ids.join(',')} <br />请考虑去掉货号归并或者重新选择分拨出库项</span>;
          this.setState({ alertMsg: msg, alertTitle: title });
        } else if (result.error.message.key === 'gross-less-netwt') {
          const title = '净重毛重拆分失败';
          const msg = '拆分生成的报关单存在毛重小于净重情况,请手工调整清单表体净毛重';
          this.setState({ alertMsg: msg, alertTitle: title });
        } else {
          message.error(result.error.message, 10);
        }
      } else {
        notification.success({
          message: '操作成功',
          description: '已生成报关建议书.',
        });
        const zeroPacks = result.data.filter(head => head.pack_count === 0);
        if (zeroPacks.length > 0) {
          notification.warn({
            message: '件数为0',
            description: `${zeroPacks.map(zp => zp.pre_entry_seq_no).join(',')}拆分成表头件数为0`,
            duration: 0,
          });
        }
        this.props.closeMergeSplitModal();
        this.props.loadBillBody(this.props.billSeqNo);
      }
    });
  }
  render() {
    const {
      alertMsg, alertTitle, mergeOpt, splitOpt, invGen, splitCategories, mergeCategories,
      invoiceTemplates, packingListTemplates, contractTemplates,
    } = this.state;
    const { form: { getFieldDecorator, getFieldValue } } = this.props;
    let { mergeConditions } = this;
    if (this.props.manualDecl) {
      mergeConditions = [...mergeConditions, { label: this.msg('emGNo'), value: 'byEmGNo' }];
    }
    return (
      <Modal
        maskClosable={false}
        title="生成报关建议书"
        width={800}
        style={{ top: 24 }}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Form className="form-layout-compact">
          {alertMsg && <Alert message={alertTitle} description={alertMsg} type="error" showIcon />}
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
                  <MSCheckbox
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
                  <MSCheckbox
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
                <Col offset="2" span="19">
            按清单数据直接生成报关建议书
                </Col>
              </FormItem>
            </Panel>
            <Panel key="split" header={this.msg('splitPrinciple')} >
              <FormItem>
                <MSCheckbox
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
                    <MSCheckbox
                      fieldOpt="splitOpt"
                      field="byCiqDecl"
                      text={this.msg('byCiqDeclSplit')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                    />
                  </FormItem>
                  <FormItem>
                    <MSCheckbox
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
                    <MSCheckbox
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
            <Panel key="sort" header={this.msg('sortPrinciple')} >
              <Col span={8}>
                <FormItem>
                  <MSCheckbox
                    fieldOpt="sortOpt"
                    field="customControl"
                    text={this.msg('customOnTop')}
                    onChange={this.handleCheckChange}
                    state={this.state}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="申报金额" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select style={{ width: '120px' }} value={this.state.sortOpt.decTotal} onChange={this.handleDecTotalSort}>
                    <Option value="0">不排序</Option>
                    <Option value="1">降序</Option>
                    <Option value="2">升序</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  <MSCheckbox
                    fieldOpt="sortOpt"
                    field="hsCodeAsc"
                    text={this.msg('hsCodeAscSort')}
                    onChange={this.handleCheckChange}
                    state={this.state}
                  />
                </FormItem>
              </Col>
            </Panel>
            <Panel key="docu" header={this.msg('docuTemplate')} >
              <Row gutter={8}>
                <Col span={8}>
                  <FormItem>
                    <MSCheckbox
                      fieldOpt="invGen"
                      field="gen_invoice"
                      text={this.msg('生成发票')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                    />
                    {invGen.gen_invoice &&
                    <div>
                      {getFieldDecorator('invoice_template_id', { initialValue: invGen.invoice_template_id
                  })(<Select placeholder={this.msg('选择发票模板')}>
                    {invoiceTemplates && invoiceTemplates.map(ct =>
                      <Option value={ct.id} key={ct.id}>{ct.template_name}</Option>)}
                  </Select>)}
                    </div>}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem>
                    <MSCheckbox
                      fieldOpt="invGen"
                      field="gen_packing_list"
                      text={this.msg('生成箱单')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                    />
                    {invGen.gen_packing_list &&
                    <div>
                      {getFieldDecorator('packing_list_template_id', { initialValue: invGen.packing_list_template_id
                  })(<Select placeholder={this.msg('选择箱单模板')}>
                    {packingListTemplates && packingListTemplates.map(ct =>
                      <Option value={ct.id} key={ct.id}>{ct.template_name}</Option>)}
                  </Select>)}
                    </div>}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem>
                    <MSCheckbox
                      fieldOpt="invGen"
                      field="gen_contract"
                      text={this.msg('生成合同')}
                      onChange={this.handleCheckChange}
                      state={this.state}
                    />
                    {invGen.gen_contract &&
                    <div>
                      {getFieldDecorator('contract_template_id', { initialValue: invGen.contract_template_id
                  })(<Select placeholder={this.msg('选择合同模板')}>
                    {contractTemplates && contractTemplates.map(ct =>
                      <Option value={ct.id} key={ct.id}>{ct.template_name}</Option>)}
                  </Select>)}
                    </div>}
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
