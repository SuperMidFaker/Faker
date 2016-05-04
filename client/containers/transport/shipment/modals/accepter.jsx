import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Select, Row, Col, message } from 'ant-ui';
import { closeAcceptModal, acceptDispShipment } from 'universal/redux/reducers/transport-acceptance';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    acpterId: state.account.loginId,
    acpterName: state.account.username,
    visible: state.transportAcceptance.acceptModal.visible,
    shipmtDispId: state.transportAcceptance.acceptModal.dispatchId,
    dispatchers: state.transportAcceptance.acceptModal.dispatchers,
  }),
  { closeAcceptModal, acceptDispShipment }
)
export default class AccepterModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    acpterId: PropTypes.number.isRequired,
    acpterName: PropTypes.string.isRequired,
    shipmtDispId: PropTypes.number.isRequired,
    dispatchers: PropTypes.array.isRequired,
    closeAcceptModal: PropTypes.func.isRequired,
    acceptDispShipment: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    disperId: -1,
    disperName: '',
  }
  handleAccept = () => {
    this.props.acceptDispShipment(
      this.props.shipmtDispId,
      this.props.acpterId, this.props.acpterName,
      this.state.disperId, this.state.disperName
    ).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.reload();
      }
    });
  }
  handleCancel = () => {
    this.props.closeAcceptModal();
  }
  handleSelect = (value, label) => {
    this.setState({
      disperId: value,
      disperName: label,
    });
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, dispatchers } = this.props;
    return (
      <Modal title={this.msg('accepterModalTitle')} visible={visible}
        onOk={this.handleAccept} onCancel={this.handleCancel}
      >
        <Row>
          <Col span="18" offset="3">
            <Select style={{width: '90%'}} onChange={this.handleSelect}>
            {
              dispatchers.map(
                disp =>
                <Option key={`${disp.lid}${disp.name}`} value={disp.lid}>
                {disp.name}
                </Option>
              )
            }
            </Select>
          </Col>
        </Row>
      </Modal>
    );
  }
}
