import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Mention, message } from 'antd';
import { closeRuleModel, saveBillRules } from 'common/reducers/cmsManifest';

import ImportRuleForm from '../form/bodyImportRuleForm';
import { formatMsg } from '../../message.i18n';


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
    ['rule_dest_country', 'rule_duty_mode'].forEach((fd) => {
      init[fd] = formData[fd] ? formData[fd] : '';
    });
    init.rule_gunit_num = formData.rule_gunit_num ? formData.rule_gunit_num : 'g_unit_1';
    init.rule_element = formData.rule_element ? formData.rule_element : '$g_model';
  }
  return init;
}

@Form.create()
@injectIntl
@connect(
  state => ({
    visibleRuleModal: state.cmsManifest.visibleRuleModal,
    billHead: state.cmsManifest.billHead,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    billRule: state.cmsManifest.billRule,
    fieldInits: getFieldInits(state.cmsManifest.billRule),
  }),
  { closeRuleModel, saveBillRules }
)
export default class RelateImportRuleModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleRuleModal: PropTypes.bool.isRequired,
  }
  handleCancel = () => {
    this.props.closeRuleModel();
  }
  handleOk = () => {
    const element = Mention.toString(this.props.form.getFieldValue('rule_element'));
    const rules = { ...this.props.form.getFieldsValue(), rule_element: element, template_id: -1 };
    this.props.saveBillRules({ rules, billSeqNo: this.props.billHead.bill_seq_no }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.closeRuleModel();
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, visibleRuleModal, fieldInits } = this.props;
    return (
      <Modal maskClosable={false} title="特殊字段规则设置确认" width={650} visible={visibleRuleModal} onOk={this.handleOk} onCancel={this.handleCancel}>
        <ImportRuleForm form={form} formData={fieldInits} />
      </Modal>
    );
  }
}

