import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Steps, Card } from 'antd';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const Step = Steps.Step;

const timeFormat = 'YYYY-MM-DD HH:mm';

function StepDesc(props) {
  const texts = props.texts.filter(txt => txt);
  return texts.length > 0 ? (
    <div>
    {
    texts.map(
      (txt, i) => (
        <div key={`${txt}${i}`}>
          <span>{txt}</span>
          <br />
        </div>
      )
    )
    }
    </div>
  ) : <div style={{ marginBottom: '20px' }} />;
}

StepDesc.propTypes = {
  texts: PropTypes.array.isRequired,
};
@injectIntl
@connect(
  state => ({
    tracking: state.shipment.previewer.tracking,
    logs: state.shipment.previewer.logs,
  })
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tracking: PropTypes.object.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  stepIcon = (step) => {
    switch (step.type) {
      case 'created': return 'check-circle-o';
      case 'accepted': return 'check-circle-o';
      case 'sent': return 'check-circle-o';
      case 'pickedup': return 'info-circle-o';
      case 'delivered': return 'info-circle-o';
      case 'completed': return 'check-circle-o';
      case 'revoked': return 'cross-circle-o';
      case 'returned': return 'exclamation-circle-o';
      case 'withdrew': return 'exclamation-circle-o';
      case 'podUploaded': return 'check-circle-o';
      case 'podPassed': return 'check-circle-o';
      case 'podReturned': return 'exclamation-circle-o';
      case 'vehicleUpdated': return 'info-circle-o';
      default : return '';
    }
  }
  render() {
    const { tracking, logs } = this.props;
    const logSteps = logs.map(item => ({
      ...item,
      title: this.msg(item.type),
      desc: (
        <StepDesc texts={[
          item.content,
          `操作人员: ${item.login_name}`,
          item.created_date && moment(item.created_date).format(timeFormat),
        ]} />
      ),
    }));

    let trackingSteps = [{
      title: this.msg('trackCreate'),
      desc: (
        <StepDesc texts={[
          tracking.creator,
          tracking.created_date && moment(tracking.created_date).format(timeFormat),
        ]} />
      ),
    }];
    let currentStep = 0;
    if (tracking.upstream_status >= SHIPMENT_TRACK_STATUS.unaccepted) {
      trackingSteps.push({
        title: this.msg('trackAccept'),
        desc: (
          <StepDesc texts={[
            tracking.upstream_name,
            tracking.upstream_acpt_time && moment(tracking.upstream_acpt_time).format(timeFormat),
          ]} />
        ),
      });
      currentStep = tracking.upstream_status - 1; // -1: Step index begin at 0;
      if (tracking.upstream_status >= SHIPMENT_TRACK_STATUS.dispatched) {
        currentStep -= 1; // remove the dispatch step
      }
    }
    if (tracking.downstream_status >= SHIPMENT_TRACK_STATUS.unaccepted) {
      trackingSteps.push({
        title: this.msg('trackAccept'),
        desc: (
          <StepDesc texts={[
            tracking.downstream_name,
            tracking.downstream_acpt_time && moment(tracking.downstream_acpt_time).format(timeFormat),
          ]} />
        ),
      });
      if (tracking.upstream_status < SHIPMENT_TRACK_STATUS.unaccepted) {
        // 客户查看没有上游
        currentStep = tracking.downstream_status - 1;
      } else {
        currentStep = (tracking.downstream_status - 1) + 1; // +1: upstream accept step
      }
      if (tracking.downstream_status >= SHIPMENT_TRACK_STATUS.dispatched) {
        currentStep -= 1;
      }
    }
    trackingSteps.push(
      {
        title: this.msg('trackPickup'),
        desc: (
        <StepDesc texts={[
          tracking.vehicle,
          tracking.pickup_act_date && moment(tracking.pickup_act_date).format(timeFormat),
        ]} />
      ),
      }, {
        title: this.msg('trackDeliver'),
        desc: (
        <StepDesc texts={[
          tracking.vehicle,
          tracking.deliver_act_date && moment(tracking.deliver_act_date).format(timeFormat),
        ]} />
      ),
      }, {
        title: this.msg('trackPod'),
        desc: (
        <StepDesc texts={[
          tracking.poder,
          tracking.pod_recv_date && moment(tracking.pod_recv_date).format(timeFormat),
        ]} />
      ),
      });
    // 由于时间原因，之前的运单并没有log，如果运单是在记录log之后创建的的，则使用logs，否则使用原来的, 过一段时间后删除原来的代码，只使用logs
    if (logs.length !== 0 && logs[0].type === 'created') {
      currentStep = logs.length - 1;
      trackingSteps = logSteps;
    }
    return (
      <div className="pane-content tab-pane" style={{ paddingBottom: 60 }}>
        <Card>
          <Steps current={currentStep} direction="vertical">
            {
              trackingSteps.map(
                (ts, i) =>
                  <Step key={`${ts.title}${i}`} title={ts.title} description={ts.desc} icon={this.stepIcon(ts)} />
                )
            }
          </Steps>
        </Card>
      </div>
    );
  }
}
