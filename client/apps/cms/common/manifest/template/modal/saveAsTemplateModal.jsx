import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Mention, message, Steps, Button, Row, Col, Input } from 'antd';
import { setStepVisible, createGeneratedTemplate, validateTempName } from 'common/reducers/cmsManifest';
import ImportRuleForm from '../../form/bodyImportRuleForm';
import MergeSplitForm from '../../form/mergeSplitRuleForm';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Step = Steps.Step;

function getFieldInits(formData) {
  const init = { mergeOpt_arr: [], specialHsSortArr: [], splHsMergeArr: [], splNoMergeArr: [] };
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
    if (formData.merge_byhscode) {
      init.mergeOpt_arr.push('byHsCode');
    }
    if (formData.merge_bygname) {
      init.mergeOpt_arr.push('byGName');
    }
    if (formData.merge_bycurr) {
      init.mergeOpt_arr.push('byCurr');
    }
    if (formData.merge_bycountry) {
      init.mergeOpt_arr.push('byCountry');
    }
    if (formData.merge_bycopgno) {
      init.mergeOpt_arr.push('byCopGNo');
    }
    if (formData.merge_byengno) {
      init.mergeOpt_arr.push('byEmGNo');
    }
    if (formData.split_spl_category) {
      const splArr = formData.split_spl_category.split(',');
      splArr.forEach((data) => {
        const numData = Number(data);
        init.specialHsSortArr.push(numData);
      });
    }
    if (formData.merge_spl_hs) {
      const splArr = formData.merge_spl_hs.split(',');
      splArr.forEach((data) => {
        const numData = Number(data);
        init.splHsMergeArr.push(numData);
      });
    }
    if (formData.merge_spl_no) {
      init.splNoMergeArr = formData.merge_spl_no.split(',');
    }
    ['merge_checked', 'sort_customs'].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : 1;
    });
    ['sort_dectotal', 'sort_hscode', 'split_hscode', 'split_curr', 'merge_bysplhs', 'merge_bysplno'].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : 0;
    });
    init.split_percount = formData.split_percount ? formData.split_percount.toString() : '20';
  }
  return init;
}

@Form.create()
@injectIntl
@connect(
  state => ({
    visibleStepModal: state.cmsManifest.visibleStepModal,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    billRule: state.cmsManifest.billRule,
    billHead: state.cmsManifest.billHead,
  }),
  { setStepVisible, createGeneratedTemplate, validateTempName }
)
export default class SaveAsTemplateModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleStepModal: PropTypes.bool.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
  }
  state = {
    current: 0,
    formData: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billRule !== this.props.billRule) {
      const formData = getFieldInits(nextProps.billRule);
      this.setState({ formData });
    }
  }
  handlenext = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        let current = this.state.current;
        if (current === 0) {
          const name = this.props.form.getFieldValue('template_name');
          this.props.validateTempName({ name, tenantId: this.props.tenantId }).then((result) => {
            if (result.error) {
              return message.error(result.error.message, 10);
            } else {
              current += 1;
              this.setState({ current });
            }
          });
        } else {
          current += 1;
          this.setState({ current });
        }
        const formData = { ...this.state.formData, ...this.props.form.getFieldsValue() };
        this.setState({ formData });
      }
    });
  }
  handleprev = () => {
    const current = this.state.current - 1;
    const formData = { ...this.state.formData, ...this.props.form.getFieldsValue() };
    let element = formData.rule_element;
    if (typeof formData.rule_element !== 'string') {
      element = Mention.toString(formData.rule_element);
    }
    this.setState({ formData: { ...formData, rule_element: element }, current });
  }
  handleCancel = () => {
    this.props.setStepVisible(false);
  }
  handleOk = () => {
    const { tenantId, tenantName, loginId, loginName, ietype, billHead } = this.props;
    const { formData } = this.state;
    const ieType = ietype === 'import' ? 0 : 1;
    const params = { template_name: formData.template_name, i_e_type: ieType, tenant_id: tenantId, tenantName, modify_id: loginId, modify_name: loginName };
    let element = formData.rule_element;
    if (typeof formData.rule_element !== 'string') {
      element = Mention.toString(formData.rule_element);
    }
    const mergeOptArr = this.props.form.getFieldValue('mergeOpt_arr');
    const specialHsSortArr = this.props.form.getFieldValue('split_spl_category');
    const splHsMergeArr = this.props.form.getFieldValue('merge_spl_hs');
    const splNoMergeArr = this.props.form.getFieldValue('merge_spl_no');
    const mergeObj = { merge_byhscode: 0, merge_bygname: 0, merge_bycurr: 0, merge_bycountry: 0, merge_bycopgno: 0, merge_byengno: 0 };
    for (const mergeOpt of mergeOptArr) {
      if (mergeOpt === 'byHsCode') {
        mergeObj.merge_byhscode = 1;
      } else if (mergeOpt === 'byGName') {
        mergeObj.merge_bygname = 1;
      } else if (mergeOpt === 'byCurr') {
        mergeObj.merge_bycurr = 1;
      } else if (mergeOpt === 'byCountry') {
        mergeObj.merge_bycountry = 1;
      } else if (mergeOpt === 'byCopGNo') {
        mergeObj.merge_bycopgno = 1;
      } else if (mergeOpt === 'byEmGNo') {
        mergeObj.merge_byengno = 1;
      }
    }
    mergeObj.merge_checked = this.props.form.getFieldValue('merge_checked') || formData.merge_checked;
    let specialHsSorts = '';
    if (specialHsSortArr) {
      specialHsSorts = specialHsSortArr.join(',');
    }
    let splHsMergeSorts = '';
    if (splHsMergeArr) {
      splHsMergeSorts = splHsMergeArr.join(',');
    }
    let splNoMergeSorts = '';
    if (splNoMergeArr) {
      splNoMergeSorts = splNoMergeArr.join(',');
    }
    const ruleDatas = { ...billHead,
      ...formData,
      ...this.props.form.getFieldsValue(),
      ...mergeObj,
      rule_element: element,
      split_spl_category: specialHsSorts,
      merge_spl_hs: splHsMergeSorts,
      merge_spl_no: splNoMergeSorts };
    this.props.createGeneratedTemplate({ params, ruleDatas }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功');
        this.props.setStepVisible(false);
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form, form: { getFieldDecorator }, visibleStepModal } = this.props;
    const { current, formData } = this.state;
    const steps = [{
      title: '第一步',
      description: '设置模板名称',
    }, {
      title: '第二步',
      description: '确认表体规则',
    }, {
      title: '第三步',
      description: '确认合并拆分规则',
    }];
    return (
      <Modal maskClosable={false} title="保存为模板" width={800} visible={visibleStepModal} onCancel={this.handleCancel} footer={null}>
        <Steps size="small" current={current}>
          {steps.map(item => <Step key={item.title} title={item.title} description={item.description} />)}
        </Steps>
        <Form layout="horizontal" style={{ marginTop: 24 }}>
          { this.state.current === 0 &&
            <FormItem label="模板名称:" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} >
                {getFieldDecorator('template_name', {
                  initialValue: this.state.formData.template_name,
                  rules: [{ required: true, message: '模板名称必填' }],
                })(
                  <Input />
                )}
            </FormItem>
          }
          {this.state.current === 1 &&
            <ImportRuleForm form={form} formData={formData} />
          }
          {this.state.current === 2 &&
            <MergeSplitForm form={form} formData={formData} />
          }
        </Form>
        <Row type="flex">
          <Col className="col-flex-primary" />
          <Col className="col-flex-secondary">
            {this.state.current > 0 && <Button style={{ marginRight: 8 }} onClick={this.handleprev}>上一步</Button>}
            {this.state.current < steps.length - 1 && <Button type="primary" onClick={this.handlenext}>下一步</Button>}
            {this.state.current === steps.length - 1 && <Button type="primary" onClick={this.handleOk}>保存</Button>}
          </Col>
        </Row>
      </Modal>
    );
  }
}

