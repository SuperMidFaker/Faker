import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Select, Row, Col, message } from 'antd';
import { closeAcceptModal, acceptDispShipment } from 'common/reducers/transport-acceptance';
import { loadServiceTeamMembers } from 'common/reducers/crmCustomers';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    acpterId: state.account.loginId,
    acpterName: state.account.username,
    visible: state.transportAcceptance.acceptModal.visible,
    shipmtDispIds: state.transportAcceptance.acceptModal.dispatchIds,
    serviceTeamMembers: state.crmCustomers.serviceTeamMembers,
  }),
  { closeAcceptModal, acceptDispShipment, loadServiceTeamMembers }
)
export default class AccepterModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    acpterId: PropTypes.number.isRequired,
    acpterName: PropTypes.string.isRequired,
    shipmtDispIds: PropTypes.array.isRequired,
    closeAcceptModal: PropTypes.func.isRequired,
    acceptDispShipment: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
    clearSelection: PropTypes.func.isRequired,
    partnerId: PropTypes.number.isRequired,
  }
  state = {
    disperId: -1,
    disperName: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.partnerId !== this.props.partnerId) {
      this.props.loadServiceTeamMembers(nextProps.partnerId);
    }
  }
  handleAccept = () => {
    this.props.acceptDispShipment(
      this.props.shipmtDispIds,
      this.props.acpterId, this.props.acpterName,
      this.state.disperId, this.state.disperName
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.clearSelection();
        this.props.reload();
      }
    });
  }
  handleCancel = () => {
    this.props.closeAcceptModal();
    this.props.clearSelection();
  }
  handleSelect = ({ key, label }) => {
    this.setState({
      disperId: key,
      disperName: label,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, serviceTeamMembers } = this.props;
    return (
      <Modal title={this.msg('accepterModalTitle')} visible={visible}
        onOk={this.handleAccept} onCancel={this.handleCancel}
      >
        <Row>
          <Col span="18" offset="3">
            <Select labelInValue style={{ width: '90%' }} onChange={this.handleSelect}>
              {
                serviceTeamMembers.map(
                member =>
                  (<Option key={`${member.lid}${member.name}`} value={member.lid}>
                    {member.name}
                  </Option>)
              )
            }
            </Select>
          </Col>
        </Row>
      </Modal>
    );
  }
}
