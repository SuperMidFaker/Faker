import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Radio, Select, Form, Checkbox, Input, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { PARTNERSHIP_TYPE_INFO } from 'universal/constants';
import { getFormatMsg } from 'reusable/browser-util/react-ant';
import { hidePartnerModal, setModalViewport, inviteOnlPartner, inviteOfflPartner } from
  '../../universal/redux/reducers/partner';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
import './partner-modal.less';
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnershipTypes: state.partner.partnershipTypes,
    partnerTenants: state.partner.partnerTenants,
    isPlatformTenant: state.partner.isPlatformTenant,
    stepView: state.partner.modalViewport,
    visible: state.partner.visibleModal
  }),
  { hidePartnerModal, setModalViewport, inviteOnlPartner, inviteOfflPartner }
)
export default class PartnerSetupDialog extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    hidePartnerModal: PropTypes.func.isRequired,
    setModalViewport: PropTypes.func.isRequired,
    inviteOnlPartner: PropTypes.func.isRequired,
    inviteOfflPartner: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    partnershipTypes: PropTypes.array.isRequired,
    partnerTenants: PropTypes.array.isRequired,
    isPlatformTenant: PropTypes.bool.isRequired,
    stepView: PropTypes.oneOf([ 'invite-initial', 'invite-sent', 'invite-offline' ]),
    visible: PropTypes.bool.isRequired
  }
  state = {
    isProviderPartner: false,
    checkedProviderTypes: [],
    tenantInput: '',
    tenantCode: '',
    tenantSelected: false,
    offlineContact: ''
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        offlineContact: ''
      });
    }
    /* todo select will focus input and dropdown if we change the value
     * rc-select componentWillReceiveProps setState({ open: false })
    if (nextProps.visible && nextProps.stepView === 'invite-initial') {
      this.setState({
        tenantInput: ''
      });
    }*/
  }
  getTenantOptions() {
    return this.props.partnerTenants.map(t =>
      <Option datalink={t} key={t.id} value={t.code}>
        {t.name}
      </Option>);
  }
  getTenantFilterOption = (input, option) => {
    return option.props.datalink.name.toLowerCase().indexOf(input.toLowerCase()) !== -1;
  }
  handleTenantInputChange = (value, label) => {
    if (label === value) {
      this.setState({
        tenantSelected: false,
        tenantCode: '',
        tenantInput: value
      });
    } else {
      this.setState({
        tenantSelected: true,
        tenantCode: value,
        tenantInput: label
      });
    }
  }
  handleTenantCodeChange = (ev) => {
    this.setState({
      tenantCode: ev.target.value
    });
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
  handlePartnerProviderTypeChange(codeOption) {
    const checkeds = this.state.checkedProviderTypes;
    const optionIdx = checkeds.indexOf(codeOption);
    if (optionIdx === -1) {
      checkeds.push(codeOption);
    } else {
      checkeds.splice(optionIdx, 1);
    }
    this.setState({ checkedProviderTypes: checkeds });
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handlePartnerForm = () => {
    if (this.state.tenantInput === '' || this.state.tenantCode === '') {
      message.error(this.msg('emptyPartnerInfo'), 10);
      return;
    }
    const tenant = this.props.partnerTenants.find(elem => elem.code === this.state.tenantCode);
    const selectedTenantId = tenant ? tenant.id : -1;
    const partnerships = this.state.isProviderPartner ?
      this.state.checkedProviderTypes : [ PARTNERSHIP_TYPE_INFO.customer ];
    if (selectedTenantId !== -1) {
      this.props.inviteOnlPartner(
        this.props.tenantId, selectedTenantId, this.state.tenantCode,
        partnerships, 'invite-sent'
      ).then(result => {
        if (result.error) {
          message.error(getFormatMsg(result.error.message, this.msg), 10);
        }
      });
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
    const partnerships = this.state.isProviderPartner ?
      this.state.checkedProviderTypes : [ PARTNERSHIP_TYPE_INFO.customer ];
    this.props.inviteOfflPartner(
      this.props.tenantId, this.state.tenantInput, this.state.tenantCode,
      partnerships, this.state.offlineContact, 'invite-sent'
    ).then(result => {
      if (result.error) {
        message.error(getFormatMsg(result.error.message, this.msg), 10);
      }
    });
  }
  handleCancel = () => {
    this.props.hidePartnerModal();
  }
  render() {
    const {
      isProviderPartner, checkedProviderTypes, offlineContact, tenantSelected,
      tenantInput, tenantCode
    } = this.state;
    const { intl, stepView, visible, partnershipTypes, isPlatformTenant } = this.props;
    let footer = <div />;
    if (stepView === 'invite-initial') {
      footer = [
        <Button key="form-invite" type="primary" size="large" onClick={this.handlePartnerForm}>
        {formatGlobalMsg(intl, 'nextStep')}
        </Button>,
        <Button key="cancel" onClick={this.handleCancel}>
        {formatGlobalMsg(intl, 'cancel')}
        </Button>
      ];
    } else if (stepView === 'invite-offline') {
      footer = [
        <Button key="offline-invite" type="primary" size="large" onClick={this.handleOfflineInvite}>
        {this.msg('sendInvitation')}
        </Button>,
        <Button key="cancel" onClick={this.handleCancel}>
        {formatGlobalMsg(intl, 'cancel')}
        </Button>
      ];
    } else if (stepView === 'invite-sent') {
      footer = [
        <Button key="send-invite" type="primary" size="large" onClick={this.handleCancel}>
        {this.msg('iknow')}
        </Button>
      ];
    }
    return (
      <Modal title={this.msg('newPartner')} visible={visible} closable={false} footer={footer}
        className="partner-modal"
      >
        <Form horizontal className={stepView === 'invite-initial' ? '' : 'hide'}>
          <Form.Item label={this.msg('partner')} labelCol={{ span: 7 }} wrapperCol={{ span: 14 }}>
            <Select combobox style={{ width: '100%' }} filterOption={this.getTenantFilterOption}
              searchPlaceholder={this.msg('companyNamePlaceholder')}
              onChange={this.handleTenantInputChange} value={tenantInput}
            >
            {this.getTenantOptions()}
            </Select>
          </Form.Item>
          <Form.Item label={this.msg('partnerCode')} labelCol={{span: 7}} wrapperCol={{span: 14}}>
            <Input placeholder={this.msg('partnerCodePlaceholder')} value={tenantCode}
              disabled={tenantSelected} onChange={this.handleTenantCodeChange}
            />
          </Form.Item>
          <Form.Item label={this.msg('partnership')} labelCol={{ span: 7 }}
            wrapperCol={{ span: 14 }}
          >
            <Radio.Group onChange={this.handlePartnershipRadioChange}
              defaultValue={!isProviderPartner ? 'client' : 'provider'}
            >
              <Radio.Button value="client">{this.msg('customer')}</Radio.Button>
              <Radio.Button value="provider">{this.msg('provider')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          { isProviderPartner &&
          <Form.Item wrapperCol={{ span: 12, offset: 7 }}>
            <div className="ant-checkbox-group">
            {
              partnershipTypes.filter(pst => pst.code !== PARTNERSHIP_TYPE_INFO.customer)
              .map(pst =>
                <label className="ant-checkbox-group-item" key={pst.code}>
                  <Checkbox checked={checkedProviderTypes.indexOf(pst.code) !== -1}
                    onChange={() => this.handlePartnerProviderTypeChange(pst.code)}
                  />
                  {formatGlobalMsg(intl, pst.code)}
                </label>
                  )
            }
            </div>
          </Form.Item>
          }
        </Form>
        <div className={`partner-modal-offline-body
          ${stepView === 'invite-offline' ? '' : ' hide'}`}
        >
          <i className="anticon anticon-info-circle" />
          <span>
          {this.msg('invitationForOffline')}
          </span>
          <div className="partner-modal-content">
            <Input placeholder={this.msg('contactPlaceholder')} onChange={this.handleContactInputChange}
              value={offlineContact}
            />
          </div>
        </div>
        <div className={`partner-modal-confirm-body
          ${stepView === 'invite-sent' ? '' : ' hide'}`}
        >
          <i className="anticon anticon-info-circle" />
          <span className="partner-modal-title">{this.msg('invitationSent')}</span>
          <div className="partner-modal-content">
            {this.msg('invitationSentNotice', { isPlatformTenant })}
          </div>
        </div>
      </Modal>
    );
  }
}
