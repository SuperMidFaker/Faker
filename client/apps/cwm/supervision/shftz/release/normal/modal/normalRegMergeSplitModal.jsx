import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Modal, Collapse, Radio, Checkbox, Select, notification, Row, Col, Form } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { showNormalRegSplitModal, submitNormalRegSplit, loadNormalRegMSRepos } from 'common/reducers/cwmShFtzDecl';
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
    normalRegMSModal: state.cwmShFtzDecl.normalRegMSModal,
    repos: state.cwmShFtzDecl.normalRegMSRepos,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
  }),
  {
    showNormalRegSplitModal, submitNormalRegSplit, loadHsCodeCategories, loadNormalRegMSRepos,
  }
)
export default class NormalRegMergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    hscodeCategories: PropTypes.arrayOf(PropTypes.shape({ type: PropTypes.oneOf(['split', 'merge']) })).isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    miscOpt: {
      repoId: null,
    },
    mergeOpt: {
      checked: false,
      byHsCode: true,
      byGName: false,
      byCurr: false,
      byCountry: false,
      byCopGNo: false,
      bySplHscode: false,
      bySplCopNo: false,
      splHsMerges: [],
      splCopNoMerges: [],
    },
    splitOpt: {
      byHsCode: false,
      splHsSplits: [],
      byTradeCurr: false,
      bySupplier: false,
      byTxnMode: false,
      perCount: undefined,
    },
    mergeOptArr: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.normalRegMSModal.visible && !this.props.normalRegMSModal.visible) {
      this.props.loadHsCodeCategories();
      this.props.loadNormalRegMSRepos(nextProps.normalRegMSModal.owner);
      if (nextProps.regSplitRule !== this.props.regSplitRule) {
        const rule = nextProps.regSplitRule;
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
        const splHsSplitArrary = rule.split_splhs_category ?
          rule.split_splhs_category.split(',') : [];
        const splHsMergeArray = rule.merge_splhs_category ?
          rule.merge_splhs_category.split(',') : [];
        const splProductMergeArray = rule.merge_spl_copno ? rule.merge_spl_copno.split(',') : [];
        this.setState({
          mergeOpt: {
            checked: rule.merge_checked,
            byHsCode: rule.merge_byhscode,
            byGName: rule.merge_bygname,
            byCurr: rule.merge_bycurr,
            byCountry: rule.merge_bycountry,
            byCopGNo: rule.merge_bycopgno,
            bySplHscode: rule.merge_bysplhs,
            bySplCopNo: rule.merge_bysplno,
            splHsMerges: splHsMergeArray,
            splCopNoMerges: splProductMergeArray,
          },
          splitOpt: {
            byHsCode: rule.split_hscode,
            byTradeCurr: rule.split_curr,
            bySupplier: rule.split_supplier,
            byTxnMode: rule.split_txnmode,
            byCiqDecl: !!rule.split_ciqdecl,
            byApplCert: !!rule.split_applcert,
            splHsSplits: splHsSplitArrary,
            perCount: rule.split_percount ? rule.split_percount.toString() : null,
          },
          mergeOptArr,
        });
      }
    }
  }
  msg = formatMsg(this.props.intl)
  mergeConditions = [{
    label: this.msg('hscode'),
    value: 'byHsCode',
  }, {
    label: this.msg('gname'),
    value: 'byGName',
  }, {
    label: this.msg('currency'),
    value: 'byCurr',
  }, {
    label: this.msg('country'),
    value: 'byCountry',
  }, {
    label: this.msg('productCode'),
    value: 'byCopGNo',
  }]
  handleCancel = () => {
    this.props.showNormalRegSplitModal({
      visible: false,
      pre_entry_seq_no: '',
      owner: {},
    });
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
    };
    checkeds.forEach((chk) => {
      opt[chk] = true;
    });
    this.setState({
      mergeOpt: opt,
      mergeOptArr: checkeds,
    });
  }
  handleOptFieldChange = (fieldOpt, field, value) => {
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
  handleOk = () => {
    const { normalRegMSModal } = this.props;
    const {
      splitOpt, mergeOpt, miscOpt,
    } = this.state;
    if (mergeOpt.checked) {
      if (!(mergeOpt.byHsCode || mergeOpt.byGName || mergeOpt.byCurr ||
        mergeOpt.byCountry || mergeOpt.byCopGNo)) {
        this.setState({ alertMsg: '条件归并时归并项不能为空' });
        return;
      }
    }
    if ((mergeOpt.bySplCopNo || splitOpt.byCiqDecl) && !miscOpt.repoId) {
      this.setState({ alertMsg: '特殊货号合并或报检拆分需选择物料库' });
      return;
    }
    if (!mergeOpt.bySplHscode) {
      mergeOpt.splHsMerges = [];
    }
    if (!mergeOpt.bySplCopNo) {
      mergeOpt.splCopNoMerges = [];
    }
    if (!splitOpt.byHsCode) {
      splitOpt.splHsSplits = [];
    }
    this.props.submitNormalRegSplit({
      preEntrySeqNo: normalRegMSModal.pre_entry_seq_no, splitOpt, mergeOpt, miscOpt,
    }).then((result) => {
      if (result.error) {
        this.setState({ alertMsg: result.error.message });
      } else {
        notification.success({
          message: '操作成功',
          description: '已拆分明细',
        });
        this.props.reload();
        this.handleCancel();
      }
    });
  }
  render() {
    const {
      mergeOpt, splitOpt, mergeOptArr, alertMsg, miscOpt,
    } = this.state;
    const {
      hscodeCategories, repos, normalRegMSModal,
    } = this.props;
    const splitCategories = hscodeCategories.filter(ct => ct.type === 'split');
    const mergeCategories = hscodeCategories.filter(ct => ct.type === 'merge');
    return (
      <Modal
        maskClosable={false}
        title="拆分提货单明细"
        width={800}
        style={{ top: 24 }}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        visible={normalRegMSModal.visible}
      >
        <Form className="form-layout-compact">
          {alertMsg && <Alert message="拆分异常提示" description={alertMsg} type="error" showIcon />}
          <Collapse bordered={false} defaultActiveKey={['merge', 'split']}>
            <Panel key="merge" header={this.msg('mergePrinciple')} >
              <FormItem>
                <Col span={3}>
                  <Radio checked={mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                    {this.msg('conditionalMerge')}
                  </Radio>
                </Col>
                <Col offset={2} span={19}>
                  <CheckboxGroup
                    options={this.mergeConditions}
                    disabled={!mergeOpt.checked}
                    onChange={this.handleMergeCheck}
                    value={mergeOptArr}
                  />
                </Col>
              </FormItem>
              {mergeOpt.checked && !mergeOpt.byCopGNo ? <Col offset={5}>
                <FormItem>
                  <Checkbox
                    onChange={ev => this.handleOptFieldChange('mergeOpt', 'bySplHscode', ev.target.checked)}
                    value={mergeOpt.bySplHscode}
                  >{this.msg('mergeSpecialHscode')}
                  </Checkbox>
                  { mergeOpt.bySplHscode ?
                    <Select
                      mode="multiple"
                      placeholder={this.msg('specialHsCategory')}
                      style={{ width: '80%' }}
                      disabled={mergeCategories.length === 0}
                      value={mergeOpt.splHsMerges}
                      onChange={values => this.handleOptFieldChange('mergeOpt', 'splHsMerges', values)}
                    >
                      { mergeCategories.map(ct => (
                        <Option value={String(ct.id)} key={String(ct.id)}>{ct.name}</Option>)) }
                    </Select> : null}
                </FormItem>
                <FormItem>
                  <Checkbox
                    onChange={ev => this.handleOptFieldChange('mergeOpt', 'bySplCopNo', ev.target.checked)}
                    value={mergeOpt.bySplCopNo}
                  >{this.msg('mergeSpecialNo')}
                  </Checkbox>
                  { mergeOpt.bySplCopNo ?
                    <Select
                      mode="multiple"
                      style={{ width: '80%' }}
                      value={mergeOpt.splCopNoMerges}
                      onChange={values => this.handleOptFieldChange('mergeOpt', 'splCopNoMerges', values)}
                    >
                      { SPECIAL_COPNO_TERM.map(data => (
                        <Option value={data.value} key={data.value}> {data.text}</Option>))}
                    </Select> : null}
                </FormItem>
              </Col> : null}
              <FormItem>
                <Col span={3}>
                  <Radio checked={!mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                    {this.msg('nonMerge')}
                  </Radio>
                </Col>
              </FormItem>
            </Panel>
            <Panel key="split" header={this.msg('splitPrinciple')} >
              <FormItem>
                <Checkbox
                  onChange={ev => this.handleOptFieldChange('splitOpt', 'byHsCode', ev.target.checked)}
                  value={splitOpt.byHsCode}
                >{this.msg('specialHscodeSplit')}
                </Checkbox>
                { splitOpt.byHsCode ?
                  <Select
                    mode="multiple"
                    placeholder={this.msg('specialHsCategory')}
                    disabled={splitCategories.length === 0}
                    value={splitOpt.splHsSplits}
                    onChange={values => this.handleOptFieldChange('splitOpt', 'splHsSplits', values)}
                  >
                    {splitCategories.map(ct => (
                      <Option value={String(ct.id)} key={String(ct.id)}>{ct.name}</Option>))}
                  </Select> : null}
              </FormItem>

              <Row>
                <Col span={12}>
                  <FormItem>
                    <Checkbox
                      onChange={ev => this.handleOptFieldChange('splitOpt', 'byTradeCurr', ev.target.checked)}
                      value={splitOpt.byTradeCurr}
                    >{this.msg('currencySplit')}
                    </Checkbox>
                  </FormItem>
                  <FormItem>
                    <Checkbox
                      onChange={ev => this.handleOptFieldChange('splitOpt', 'byCiqDecl', ev.target.checked)}
                      value={splitOpt.byCiqDecl}
                    >{this.msg('byCiqDeclSplit')}
                    </Checkbox>
                  </FormItem>
                  <FormItem>
                    <Checkbox
                      onChange={ev => this.handleOptFieldChange('splitOpt', 'byApplCert', ev.target.checked)}
                      value={splitOpt.byApplCert}
                      disabled={!splitOpt.byCiqDecl}
                    >{this.msg('byApplCertSplit')}
                    </Checkbox>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem>
                    <Checkbox
                      onChange={ev => this.handleOptFieldChange('splitOpt', 'bySupplier', ev.target.checked)}
                      value={splitOpt.bySupplier}
                    >{this.msg('supplierSplit')}
                    </Checkbox>
                  </FormItem>
                  <FormItem>
                    <Checkbox
                      onChange={ev => this.handleOptFieldChange('splitOpt', 'byTxnMode', ev.target.checked)}
                      value={splitOpt.byTxnMode}
                    >{this.msg('txnModeSplit')}
                    </Checkbox>
                  </FormItem>
                  <FormItem>
                    <Select
                      placeholder="20品/50品拆分"
                      onChange={value => this.handleOptFieldChange('splitOpt', 'perCount', value)}
                      value={splitOpt.perCount}
                    >
                      {CMS_SPLIT_COUNT.map(sc => (<Option key={sc.value} value={sc.value}>
                        {sc.text}</Option>))}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </Panel>
          </Collapse>
          <FormItem label="物料库">
            <Select
              value={miscOpt.repoId}
              onChange={value => this.handleOptFieldChange('miscOpt', 'repoId', value)}
            >
              { repos.map(repo => (<Option value={String(repo.id)} key={String(repo.id)}>
                {repo.owner_name}</Option>))}
            </Select>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
