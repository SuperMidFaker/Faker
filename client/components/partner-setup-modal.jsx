import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Radio, Select, Form, Checkbox, Input, message } from 'ant-ui';
import { openClosePartnerModal, setModalViewport } from
'../../universal/redux/reducers/partner';
const Option = Select.Option;

@connect(
  state => ({
    partnershipTypes: state.partner.partnershipTypes,
    tenants: state.partner.tenants,
    stepView: state.partner.modalViewport,
    visible: state.partner.visibleModal
  }),
  { openClosePartnerModal, setModalViewport}
)
export default class PartnerSetupDialog extends React.Component {
  static propTypes = {
    openClosePartnerModal: PropTypes.func.isRequired,
    setModalViewport: PropTypes.func.isRequired,
    partnershipTypes: PropTypes.array.isRequired,
    tenants: PropTypes.array.isRequired,
    stepView: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired
  }
  state = {
    isPlatformTenant: false,
    offlineContact: '',
    selectedTenantId: '',
    partnershipType: 'client'
  }
  getTenantOptions = () => {
    return this.props.tenants.map(t =>
      <Option datalink={t} key={t.id} value={t.id}>
        {t.name}
      </Option>);
  }
  getTenantFilterOption = (input, option) => {
    return option.props.datalink.name.toLowerCase().indexOf(input.toLowerCase()) !== -1;
  }
  handleTenantSelect = (value) => {
    this.setState({
      selectedTenantId: value
    });
  }
  handlePartnerForm = () => {
    this.props.setModalViewport('invite-offline');
  }
  handlePartnershipTypeChange = () => {
  }
  handleProviderTypeChange = () => {
  }
  handleOfflineInvite = () => {
  }
  handleContactChange = (ev) => {
    this.setState({
      offlineContact: ev.target.value
    });
  }
  handleCancel = () => {
    this.props.openClosePartnerModal();
  }
  render() {
    const { isPlatformTenant, offlineContact } = this.state;
    const { stepView, visible } = this.props;
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
              filterOption={this.getTenantFilterOption} onSelect={this.handleTenantSelect}
            >
            {this.getTenantOptions()}
            </Select>
          </Form.Item>
          <Form.Item label="伙伴关系:" labelCol={{ span: 7 }} wrapperCol={{ span: 14 }}>
            <Radio.Group onChange={this.handlePartnershipTypeChange} defaultValue="client">
              <Radio.Button value="client">客户</Radio.Button>
              <Radio.Button value="provider">供应商</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 12 }}>
            <Checkbox.Group options={['aa']} onChange={this.handleProviderTypeChange} />
          </Form.Item>
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
        <div className="ant-confirm-body">
          <i className="anticon anticon-info-circle" />
          对方还不是平台用户，请填写邮箱/手机号发送邀请
          <Input placeholder="输入邮箱/手机号码" onChange={this.handleContactChange}
            value={offlineContact}
          />
        </div>);
    } else if (stepView === 'invite-sent') {
      footer = [
        <Button key="send-invite" type="primary" size="large" onClick={this.handleCancel}>
          知道了
        </Button>
      ];
      modalContent = (
        <div className="ant-confirm-body">
          <i className="anticon anticon-info-circle" />
          <span className="ant-confirm-title">已发送邀请</span>
          <div className="ant-confirm-content">对方是
            { isPlatformTenant ? '平台' : '线下' }用户,已发送合作伙伴邀请
          </div>
        </div>);
    }
    return (
      <Modal title="添加合作伙伴" visible={visible} closable={false} footer={footer}>
      {modalContent}
      </Modal>
    );
  }
}
