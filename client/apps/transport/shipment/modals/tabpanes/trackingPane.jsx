import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Steps } from 'ant-ui';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const Step = Steps.Step;

const timeFormat = 'YYYY-MM-DD HH:mm';
function PaddingSpan() {
  return <div style={{ marginBottom: '20px' }} />;
}
@injectIntl
@connect(
  state => ({
    tracking: state.shipment.previewer.tracking,
  })
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tracking: PropTypes.object.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  render() {
    const { tracking } = this.props;
    const trackingSteps = [{
      title: this.msg('trackCreate'),
      desc: tracking.created_date ?
        moment(tracking.created_date).format(timeFormat) : <PaddingSpan />,
    }, {
      title: this.msg('trackAccept'),
      desc: tracking.acpt_time ?
        moment(tracking.acpt_time).format(timeFormat) : <PaddingSpan />,
    }, {
      title: this.msg('trackDispatch'),
      desc: tracking.disp_time && tracking.status === SHIPMENT_TRACK_STATUS.undelivered ?
        moment(tracking.disp_time).format(timeFormat) : <PaddingSpan />,
    }, {
      title: this.msg('trackPickup'),
      desc: tracking.pickup_act_time ?
        moment(tracking.pickup_act_time).format(timeFormat) : <PaddingSpan />,
    }, {
      title: this.msg('trackDeliver'),
      desc: tracking.deliver_act_time ?
        moment(tracking.deliver_act_time).format(timeFormat) : <PaddingSpan />,
    }, {
      title: this.msg('trackPod'),
      desc: tracking.pod_recv_date ?
        moment(tracking.pod_recv_date).format(timeFormat) : <PaddingSpan />,
    }];
    return (
      <div>
        <Col offset={1} span={5}>
          <h3>{this.msg('trackingStepTitle')}</h3>
          <Steps current={tracking.status - 1} direction="vertical">
          {
            trackingSteps.map(ts => <Step key={ts.title} title={ts.title} description={ts.desc} />)
          }
          </Steps>
        </Col>
      </div>
    );
  }
}
