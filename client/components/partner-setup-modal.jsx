import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Radio, Select, Form, Checkbox, Input, message } from 'ant-ui';
import { swapPartnerModal, setModalViewport, inviteOnlPartner, inviteOfflPartner } from
'../../universal/redux/reducers/partner';
import './partner-setup-modal.less';
const Option = Select.Option;

@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnershipTypes: state.partner.partnershipTypes,
    partnerTenants: state.partner.partnerTenants,
    isPlatformTenant: state.partner.isPlatformTenant,
    stepView: state.partner.modalViewport,
    visible: state.partner.visibleModal
  }),
  { swapPartnerModal, setModalViewport, inviteOnlPartner, inviteOfflPartner }
)
export default class PartnerSetupDialog extends React.Component {
  static propTypes = {
    swapPartnerModal: PropTypes.func.isRequired,
    setModalViewport: PropTypes.func.isRequired,
    inviteOnlPartner: PropTypes.func.isRequired,
    inviteOfflPartner: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    partnershipTypes: PropTypes.array.isRequired,
    partnerTenants: PropTypes.array.isRequired,
    isPlatformTenant: PropTypes.bool.isRequired,
    stepView: PropTypes.oneOf(['invite-initial', 'invite-sent', 'invite-offline']),
    visible: PropTypes.bool.isRequired
  }
  state = {
    isProviderPartner: false,
    checkedProviderTypes: [],
    tenantInput: '',
    offlineContact: ''
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        offlineContact: ''
      });
    }
    if (nextProps.visible && nextProps.stepView === 'invite-initial') {
      this.setState({
        tenantInput: ''
      });
    }
  }
  getTenantOptions = () => {
    return this.props.partnerTenants.map(t =>
      <Option datalink={t} key={t.id} value={t.name}>
        {t.name}
      </Option>);
  }
  getTenantFilterOption = (input, option) => {
    return option.props.datalink.name.toLowerCase().indexOf(input.toLowerCase()) !== -1;
  }
  handleTenantInputChange = (value) => {
    this.state.tenantInput = value;
  }
  handlePartnershipRadioChange = (ev) => {
    if (ev.target.value === 'client') {
      this.setState({
        isProviderPartner: false,
        checkedProviderTypes: []
      });
    } else {
      this.setState({ isProviderPartner: true });
    }
  }
  handlePartnerProviderTypeChange = (checkeds) => {
    this.setState({ checkedProviderTypes: checkeds });
  }
  handlePartnerForm = () => {
    if (this.state.tenantInput === '') {
      message.error('合作伙伴名称不能为空', 10);
      return;
    }
    const tenant = this.props.partnerTenants.find(elem => elem.name === this.state.tenantInput);
    const selectedTenantId = tenant ? tenant.id : -1;
    const partnerships = this.state.isProviderPartner ? this.state.checkedProviderTypes : ['客户'];
    if (selectedTenantId !== -1) {
      this.props.inviteOnlPartner(this.props.tenantId, selectedTenantId, partnerships,
                                  'invite-sent');
    } else {
      this.props.setModalViewport('invite-offline');
    }
  }
  handleContactInputChange = (ev) => {
    this.setState({
      offlineContact: ev.target.value
    });
  }
  handleOfflineInvite = () => {
    const partnerships = this.state.isProviderPartner ? this.state.checkedProviderTypes : ['客户'];
    this.props.inviteOfflPartner(this.props.tenantId, this.state.tenantInput, partnerships,
                                 this.state.offlineContact, 'invite-sent');
  }
  handleCancel = () => {
    this.props.swapPartnerModal();
  }
  render() {
    const { isProviderPartner, checkedProviderTypes, offlineContact }
    = this.state;
    const { stepView, visible, partnershipTypes, isPlatformTenant } = this.props;
    let modalContent = <div />;
    let footer = <div />;
    if (stepView === 'invite-initial') {
      footer = [
        <Button key="form-invite" type="primary" size="large" onClick={this.handlePartnerForm}>
          下一步
        </Button>,
        <Button key="cancel" onClick={this.handleCancel}>
          取消
        </Button>
      ];
      modalContent = (
        <Form horizontal>
          <Form.Item label="合作伙伴:" labelCol={{ span: 7 }} wrapperCol={{ span: 14 }}>
            <Select combobox style={{ width: '100%' }} searchPlaceholder="请输入公司名称"
              filterOption={this.getTenantFilterOption}
              onChange={this.handleTenantInputChange}
            >
            {this.getTenantOptions()}
            </Select>
          </Form.Item>
          <Form.Item label="伙伴关系:" labelCol={{ span: 7 }} wrapperCol={{ span: 14 }}>
            <Radio.Group onChange={this.handlePartnershipRadioChange}
              defaultValue={ !isProviderPartner ? 'client' : 'provider' }
            >
              <Radio.Button value="client">客户</Radio.Button>
              <Radio.Button value="provider">供应商</Radio.Button>
            </Radio.Group>
          </Form.Item>
          { isProviderPartner &&
          <Form.Item wrapperCol={{ span: 12, offset: 7 }}>
            <Checkbox.Group options={partnershipTypes.filter(pst => pst.name !== '客户')
              .map(pst => pst.name)} onChange={this.handlePartnerProviderTypeChange}
              value={ checkedProviderTypes }
            />
          </Form.Item>
          }
        </Form>);
    } else if (stepView === 'invite-offline') {
      footer = [
        <Button key="offline-invite" type="primary" size="large" onClick={this.handleOfflineInvite}>
          发送邀请
        </Button>,
        <Button key="cancel" onClick={this.handleCancel}>
          取消
        </Button>
      ];
      modalContent = (
        <div className="partner-modal-offline-body">
          <i className="anticon anticon-info-circle" />
          <span>
            对方还不是平台用户,请填写邮箱/手机号发送邀请
          </span>
          <div className="partner-modal-content">
            <Input placeholder="输入邮箱/手机号码" onChange={this.handleContactInputChange}
              value={offlineContact}
            />
          </div>
        </div>);
    } else if (stepView === 'invite-sent') {
      footer = [
        <Button key="send-invite" type="primary" size="large" onClick={this.handleCancel}>
          知道了
        </Button>
      ];
      modalContent = (
        <div className="partner-modal-confirm-body">
          <i className="anticon anticon-info-circle" />
          <span className="partner-modal-title">已发送邀请</span>
          <div className="partner-modal-content">对方是
            { isPlatformTenant ? '平台' : '线下' }用户,已发送合作伙伴邀请
          </div>
        </div>);
    }
    return (
      <Modal title="添加合作伙伴" visible={visible} closable={false} footer={footer}
        className="partner-modal"
      >
        {modalContent}
      </Modal>
    );
  }
}
