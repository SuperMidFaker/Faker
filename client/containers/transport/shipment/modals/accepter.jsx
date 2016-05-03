import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Select } from 'ant-ui';
import { closeAcceptModal } from 'universal/redux/reducers/transport-accept';

const Option = Select.Option;
@connect(
  state => ({
    visible: state.transportAccept.acceptModal.visible,
    shipmtDispId: state.transportAccept.acceptModal.dispatchId,
    dispatchers: state.transportAccept.acceptModal.dispatchers,
  }),
  { closeAcceptModal }
)
export default class AccepterModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    shipmtDispId: PropTypes.number.isRequired,
    dispatchers: PropTypes.array.isRequired,
    closeAcceptModal: PropTypes.func.isRequired,
  }
  state = {
    disperId: -1,
    disperName: '',
  }
  handleAccept = () => {
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
  render() {
    const { visible, dispatchers } = this.props;
    return (
      <Modal onOk={this.handleAccept} onCancel={this.handleCancel}>
        <Select onChange={this.handleSelect}>
        {
          dispatchers.map(
            disp =>
            <Option key={`${disp.id}${disp.name}`} value={disp.id}>
            {disp.name}
            </Option>
          )
        }
        </Select>
      </Modal>
    );
  }
}
