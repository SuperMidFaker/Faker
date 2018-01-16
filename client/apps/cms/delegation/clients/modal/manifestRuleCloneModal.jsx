import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { hideManifestRulesCloneModal, cloneManifestRules } from 'common/reducers/cmsManifest';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  loginName: state.account.username,
  tenantName: state.account.tenantName,
  visible: state.cmsManifest.manifestRulesCloneModal.visible,
  templateId: state.cmsManifest.manifestRulesCloneModal.templateId,
  ietype: state.cmsManifest.manifestRulesCloneModal.ietype,
}), { hideManifestRulesCloneModal, cloneManifestRules })
@Form.create()
export default class manifestRuleCloneModal extends React.Component {
  static propTypes = {
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleOk = () => {
    const { templateId, loginName } = this.props;
    const templateName = this.props.form.getFieldValue('template_name');
    const ietype = this.props.ietype === 0 ? 'import' : 'export';
    if (!templateName) {
      message.error('请填写规则名称');
    } else {
      this.props.cloneManifestRules(templateName, templateId, loginName).then((result) => {
        if (!result.error) {
          this.handleCancel();
          this.context.router.push(`/clearance/${ietype}/manifest/rules/edit/${result.data}`);
        }
      });
    }
  }
  handleCancel = () => {
    this.props.hideManifestRulesCloneModal();
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal maskClosable={false} title="复制制单规则" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="horizontal">
          <FormItem label="规则名称" {...formItemLayout}>
            {getFieldDecorator('template_name', {
              rules: [{ required: true, message: '规则名称必填' }],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
