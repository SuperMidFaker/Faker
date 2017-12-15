import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Button, Form, Modal, message, Layout } from 'antd';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import AgreementForm from './forms/agreement';
import RatesForm from './forms/rates';
import SurchargeForm from './forms/surcharge';
import RevisionTable from './forms/revisionTable';
import { showPublishTariffModal, submitAgreement, updateAgreement, loadTariff } from 'common/reducers/transportTariff';
import { TARIFF_KINDS } from 'common/constants';
import PublishTariffModal from './modals/publishTariffModal';
const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;

@connect(state => ({
  selectedKey: state.transportTariff.selectedMenuItemKey,
  tenantId: state.account.tenantId,
  tenantName: state.account.tenantName,
  loginId: state.account.loginId,
  loginName: state.account.username,
  tariffId: state.transportTariff.tariffId,
  formData: state.transportTariff.agreement,
  formParams: state.transportTariff.formParams,
  saving: state.transportTariff.tariffSaving,
}), {
  showPublishTariffModal, submitAgreement, updateAgreement, loadTariff,
})
@connectNav({
  depth: 3,
  moduleName: 'transport',
})
@Form.create()
export default class Main extends Component {
  static propTyps = {
    form: PropTypes.object.isRequired,
    showPublishTariffModal: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tariffId: PropTypes.string,
    formData: PropTypes.object.isRequired,
    submitAgreement: PropTypes.func.isRequired,
    updateAgreement: PropTypes.func.isRequired,
    loadTariff: PropTypes.func.isRequired,
    formParams: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedKey: '0',
  }
  handleMenuItemClick = (key) => {
    this.setState({ selectedKey: key });
  }
  handleSubmit = () => {
    const { formData, type } = this.props;
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error('表单信息错误');
      } else if (type === 'edit' && formData.priceChanged) {
        Modal.confirm({
          title: '确定修改？',
          content: '价格区间或运输模式修改后，原来的基础费率、附加费用等会被清空',
          onOk: this.submit,
          onCancel: () => {},
        });
      } else {
        this.submit();
      }
    });
  }

  submit = () => {
    const {
      tariffId, tenantId, tenantName, loginId, formData: { quoteNo, version },
    } = this.props;
    const editForm = this.props.form.getFieldsValue();
    const tms = this.props.formParams.transModes.find(tm => tm.mode_code === editForm.transModeCode);
    const forms = {
      ...this.props.formData,
      ...editForm,
      transMode: tms.mode_name,
      transModeCode: tms.mode_code,
    };
    forms.id = tariffId;
    forms.tenantId = tenantId;
    forms.tenantName = tenantName;
    forms.loginId = loginId;
    forms.loginName = this.props.loginName;
    if (this.props.tariffId) {
      this.props.updateAgreement(forms).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.success('保存成功');
          this.props.loadTariff({
            quoteNo,
            version,
            tenantId,
            status: 'draft',
          });
        }
      });
    } else {
      this.props.submitAgreement(forms).then((result) => {
        if (result.error) {
          if (result.error.message === 'found_tariff') {
            message.error('相同条件报价协议已存在');
          } else {
            message.error(result.error.message, 10);
          }
        } else {
          message.success('保存成功');
          this.context.router.push(`/transport/billing/tariff/edit/${result.data.quoteNo}/${result.data.version}`);
        }
      });
    }
  }
  render() {
    const {
      type, tariffId, formData, saving,
    } = this.props;
    const { selectedKey } = this.state;
    let content = [
      <TabPane tab="报价设置" key="0"><AgreementForm form={this.props.form} type={type} /></TabPane>,
      <TabPane tab="基础费率" key="1"><RatesForm form={this.props.form} type={type} /></TabPane>,
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
        <TabPane tab="基础费率" key="1"><RatesForm form={this.props.form} type={type} /></TabPane>,
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
        <Header className="page-header">
          <span>{`${formData.quoteNo} - ${formData.partnerName ? formData.partnerName : ''} - ${kindText}`}</span>
          { type === 'edit' && (
            <div className="page-header-tools">
              <Button type="default" onClick={this.handleSubmit} loading={saving}>保存</Button>
              <Button type="primary" onClick={() => this.props.showPublishTariffModal(true)}>发布</Button>
              <PublishTariffModal tariffForm={this.props.form} />
            </div>
            )}
          { (type === 'create') && (
            <div className="page-header-tools">
              <Button type="default" onClick={this.handleSubmit} loading={saving}>保存</Button>
            </div>
          )}
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <Tabs activeKey={selectedKey} onChange={this.handleMenuItemClick}>
              {content}
            </Tabs>
          </div>
        </Content>
      </div>
    );
  }
}
