import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { closeLocModal, updateLoc } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.trackingLandStatus.locModal.visible,
    dispId: state.trackingLandStatus.locModal.dispId,
    shipmtNo: state.trackingLandStatus.locModal.shipmtNo,
  }),
  { closeLocModal, updateLoc }
)
export default class LocationUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  render() {
    return (
      <Modal title={title} onCancel={this.handleCancel} onOk={this.handleOk}
      visible={this.props.visible}
      >
      </Modal>
    );
  }
}
