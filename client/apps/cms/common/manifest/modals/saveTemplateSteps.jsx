import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Mention, message, Steps, Button, Card, Input } from 'antd';
import { setStepVisible, saveBillRules } from 'common/reducers/cmsManifest';
import ImportRuleForm from '../form/bodyImportRuleForm';
import MergeSplitForm from '../form/mergeSplitRuleForm';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Step = Steps.Step;

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['rule_currency', 'rule_orig_country', 'rule_net_wt',
    ].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : '1';
    });
    ['rule_g_name', 'rule_g_unit'].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : '0';
    });
    init.rule_gunit_num = formData.rule_gunit_num ? formData.rule_gunit_num : 'g_unit_1';
    init.rule_element = formData.rule_element ? formData.rule_element : '';
  }
  return init;
}

@Form.create()
@injectIntl
@connect(
  state => ({
    visibleStepModal: state.cmsManifest.visibleStepModal,
    billHead: state.cmsManifest.billHead,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    billRule: state.cmsManifest.billRule,
    fieldInits: getFieldInits(state.cmsManifest.billRule),
  }),
  { setStepVisible, saveBillRules }
)
export default class SaveTemplateModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleStepModal: PropTypes.bool.isRequired,
  }
  state = {
    current: 0,
    formData: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billRule !== this.props.billRule) {
      this.setState({ formData: nextProps.billRule });
    }
  }
  handlenext = () => {
    const current = this.state.current + 1;
    const formData = { ...this.state.formData, ...this.props.form.getFieldsValue() };
    this.setState({ formData, current });
  }
  handleprev = () => {
    const current = this.state.current - 1;
    const formData = { ...this.state.formData, ...this.props.form.getFieldsValue() };
    this.setState({ formData, current });
  }
  handleCancel = () => {
    this.props.setStepVisible(false);
  }
  handleOk = () => {
    const element = Mention.toString(this.props.form.getFieldValue('rule_element'));
    const rules = { ...this.props.form.getFieldsValue(), rule_element: element };
    this.props.saveBillRules({ rules, billSeqNo: this.props.billRule.bill_seq_no, template_id: -1 }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
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
    const modalTitle = (
      <Steps current={current}>
        {steps.map(item => <Step key={item.title} title={item.title} description={item.description} />)}
      </Steps>
    );
    return (
      <Modal title={modalTitle} width={800} visible={visibleStepModal} onCancel={this.handleCancel} footer={null}>
        <div>
          { this.state.current === 0 &&
            <Card>
              <FormItem label="模板名称:" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} >
                {getFieldDecorator('template_name', {
                  rules: [{ required: true, message: '模板名称必填' }],
                })(
                  <Input />
                )}
              </FormItem>
            </Card>
          }
          {this.state.current === 1 &&
            <ImportRuleForm form={form} formData={formData} />
          }
          {this.state.current === 2 &&
            <MergeSplitForm form={form} formData={formData} />
          }
        </div>
        <div>
          {this.state.current < steps.length - 1 && <Button type="primary" onClick={this.handlenext}>下一步</Button>}
          {this.state.current > 0 && <Button style={{ marginLeft: 8 }} onClick={this.handleprev}>上一步</Button>}
          {this.state.current === steps.length - 1 && <Button type="primary" onClick={this.handleOk}>保存</Button>}
        </div>
      </Modal>
    );
  }
}

