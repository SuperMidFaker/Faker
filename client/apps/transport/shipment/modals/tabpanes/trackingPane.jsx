import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import TrackingTimeline from '../../../common/trackingTimeline';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    points: state.shipment.previewer.points,
  })
)
export default class TrackingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { points } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Card>
          <TrackingTimeline points={points} />
        </Card>
      </div>
    );
  }
}
