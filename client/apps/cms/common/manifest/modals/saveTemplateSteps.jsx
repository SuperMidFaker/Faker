import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Mention, message, Steps, Button, Card, Input } from 'antd';
import { setStepVisible } from 'common/reducers/cmsManifest';
import { createGeneratedTemplate } from 'common/reducers/cmsSettings';
import ImportRuleForm from '../form/bodyImportRuleForm';
import MergeSplitForm from '../form/mergeSplitRuleForm';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Step = Steps.Step;

@Form.create()
@injectIntl
@connect(
  state => ({
    visibleStepModal: state.cmsManifest.visibleStepModal,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    billRule: state.cmsManifest.billRule,
    billHead: state.cmsManifest.billHead,
  }),
  { setStepVisible, createGeneratedTemplate }
)
export default class SaveTemplateModal extends React.Component {
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
      this.setState({ formData: nextProps.billRule });
    }
  }
  handlenext = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const current = this.state.current + 1;
        const formData = { ...this.state.formData, ...this.props.form.getFieldsValue() };
        this.setState({ formData, current });
      }
    });
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
    const { tenantId, loginId, loginName, ietype, billHead } = this.props;
    const { formData } = this.state;
    const param = {};
    param.template_name = formData.template_name;
    const ieType = ietype === 'import' ? 0 : 1;
    const params = { template_name: formData.template_name, i_e_type: ieType, tenant_id: tenantId, modify_id: loginId, modify_name: loginName };
    const element = Mention.toString(formData.rule_element);
    const mergeOptArr = this.props.form.getFieldValue('mergeOpt_arr');
    const specialHsSortArr = this.props.form.getFieldValue('specialHsSort');
    let mergeOpts = '';
    if (mergeOptArr) {
      mergeOpts = mergeOptArr.join(',');
    }
    let specialHsSorts = '';
    if (specialHsSortArr) {
      specialHsSorts = specialHsSortArr.join(',');
    }
    const ruleDatas = { ...billHead, ...formData, ...this.props.form.getFieldsValue(),
      rule_element: element, mergeOpt_arr: mergeOpts, specialHsSort: specialHsSorts };
    console.log('ruleDatas', ruleDatas);
    this.props.createGeneratedTemplate({ params, ruleDatas }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        // this.context.router.push(`/clearance/settings/billtemplates/edit/${result.data.id}`);

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
                  initialValue: this.state.formData.template_name,
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

