import React, { Component, PropTypes } from 'react';
import { Tabs, Button, Form, message } from 'antd';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import AgreementForm from './forms/agreement';
import RatesForm from './forms/rates';
import SurchargeForm from './forms/surcharge';
import RevisionTable from './forms/revisionTable';
import { showPublishTariffModal, submitAgreement, updateAgreement } from 'common/reducers/transportTariff';
import { TARIFF_KINDS } from 'common/constants';
import PublishTariffModal from './modals/publishTariffModal';

const TabPane = Tabs.TabPane;

@connect(state => ({
  selectedKey: state.transportTariff.selectedMenuItemKey,
  tenantId: state.account.tenantId,
  tenantName: state.account.tenantName,
  loginId: state.account.loginId,
  loginName: state.account.username,
  tariffId: state.transportTariff.tariffId,
  formData: state.transportTariff.agreement,
}), { showPublishTariffModal, submitAgreement, updateAgreement })
@connectNav({
  depth: 3,
  moduleName: 'transport',
})
@Form.create()
export default class Main extends Component {
  static propTyps = {
    form: PropTypes.object.isRequired,
    showPublishTariffModal: PropTypes.func.isRequired,        // itemItem点击后执行的回调函数,
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tariffId: PropTypes.string,
    formData: PropTypes.object.isRequired,
    submitAgreement: PropTypes.func.isRequired,
    updateAgreement: PropTypes.func.isRequired,
  }
  state = {
    selectedKey: '0',
  }
  handleMenuItemClick = (key) => {
    this.setState({ selectedKey: key });
  }
  handleSubmit = () => {
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error('表单信息错误');
      } else {
        const editForm = this.props.form.getFieldsValue();
        const forms = {
          ...this.props.formData, ...editForm,
        };
        let promise;
        if (this.props.tariffId) {
          forms.loginName = this.props.loginName;
          promise = this.props.updateAgreement(forms);
        } else {
          const { tariffId, tenantId, tenantName, loginId } = this.props;
          forms.id = tariffId;
          forms.tenantId = tenantId;
          forms.tenantName = tenantName;
          forms.loginId = loginId;

          promise = this.props.submitAgreement(forms);
        }
        promise.then((result) => {
          if (result.error) {
            if (result.error.message === 'found_tariff') {
              message.error('相同条件报价协议已存在');
            } else {
              message.error(result.error.message);
            }
          } else {
            message.success('保存成功');
          }
        });
      }
    });
  }
  render() {
    const { type, tariffId, formData } = this.props;
    const { selectedKey } = this.state;
    let content = [
      <TabPane tab="报价设置" key="0"><AgreementForm form={this.props.form} type={type} /></TabPane>,
      <TabPane tab="基础费率" key="1"><RatesForm type={type} /></TabPane>,
      <TabPane tab="附加费用" key="2"><SurchargeForm type={type} /></TabPane>,
      <TabPane tab="历史版本" key="3"><RevisionTable type={type} /></TabPane>,
    ];

    if (type === 'create') {
      if (!tariffId) {
        content = [
          <TabPane tab="报价设置" key="0"><AgreementForm form={this.props.form} /></TabPane>,
        ];
      }
    } else if (type === 'view') {
      content = [
        <TabPane tab="报价设置" key="0"><AgreementForm readonly form={this.props.form} type={type} /></TabPane>,
        <TabPane tab="基础费率" key="1"><RatesForm type={type} /></TabPane>,
        <TabPane tab="附加费用" key="2"><SurchargeForm type={type} /></TabPane>,
        <TabPane tab="历史版本" key="3"><RevisionTable type={type} /></TabPane>,
      ];
    }
    let kindText = '';
    if (TARIFF_KINDS[formData.kind]) {
      kindText = TARIFF_KINDS[formData.kind].text;
    }

    return (
      <div>
        <header className="top-bar">
          <span>{`${formData.quoteNo} - ${formData.partnerName ? formData.partnerName : ''} - ${kindText}`}</span>
        </header>
        <div className="top-bar-tools">
          { type === 'edit' && (
          <span>
            <Button type="primary" onClick={() => this.props.showPublishTariffModal(true)}>发布</Button>
            <PublishTariffModal tariffForm={this.props.form} />
          </span>
            )}
          { (type === 'edit' || type === 'create') && (
          <Button type="ghost" onClick={this.handleSubmit}>保存</Button>
            )}
        </div>
        <div className="main-content">
          <div className="page-body">
            <Tabs activeKey={selectedKey} onChange={this.handleMenuItemClick}>
              {content}
            </Tabs>
          </div>

        </div>
      </div>
    );
  }
}
