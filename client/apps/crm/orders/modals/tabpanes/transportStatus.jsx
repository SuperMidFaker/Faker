/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { Steps, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
export default class TransportStatus extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    status: PropTypes.number.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { status } = this.props;
    let statusDes = [];
    let statusPos = 0;
    if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'wait',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'wait',
        title: this.msg('deliveredShipmt'),
      }];
      statusPos = 0;
    } else if (status === SHIPMENT_TRACK_STATUS.accepted) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'finish',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'wait',
        title: this.msg('deliveredShipmt'),
      }];
      statusPos = 1;
    } else if (status === SHIPMENT_TRACK_STATUS.dispatched) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'finish',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'wait',
        title: this.msg('deliveredShipmt'),
      }];
      statusPos = 2;
    } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'finish',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'wait',
        title: this.msg('deliveredShipmt'),
      }];
      statusPos = 3;
    } else if (status === SHIPMENT_TRACK_STATUS.delivered) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'finish',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'finish',
        title: this.msg('deliveredShipmt'),
      }];
      statusPos = 4;
    } else if (status === SHIPMENT_TRACK_STATUS.podsubmit) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'finish',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'finish',
        title: this.msg('deliveredShipmt'),
      }, {
        status: 'finish',
        title: this.msg('podsubmit'),
      }, {
        status: 'wait',
        title: this.msg('podaccept'),
      }];
      statusPos = 5;
    } else if (status === SHIPMENT_TRACK_STATUS.podaccept) {
      statusDes = [{
        status: 'finish',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'finish',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'finish',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'finish',
        title: this.msg('deliveredShipmt'),
      }, {
        status: 'finish',
        title: this.msg('podsubmit'),
      }, {
        status: 'finish',
        title: this.msg('podaccept'),
      }];
      statusPos = 6;
    } else {
      statusDes = [{
        status: 'wait',
        title: this.msg('pendingShipmt'),
      }, {
        status: 'wait',
        title: this.msg('acceptedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('dispatchedShipmt'),
      }, {
        status: 'wait',
        title: this.msg('intransitShipmt'),
      }, {
        status: 'wait',
        title: this.msg('deliveredShipmt'),
      }, {
        status: 'wait',
        title: this.msg('podsubmit'),
      }, {
        status: 'wait',
        title: this.msg('podaccept'),
      }];
      statusPos = -1;
    }
    const steps = statusDes.map((s, i) => <Step key={i} status={s.status} title={s.title} />);
    return (
      <Card>
        <Steps current={statusPos}>{steps}</Steps>
      </Card>
    );
  }
}
