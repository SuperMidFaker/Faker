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
function StepDesc(props) {
  const texts = props.texts.filter(txt => txt);
  return texts.length > 0 ? (
    <div>
    {
    texts.map(
      (txt, i) => (
        <div>
          <span key={`stepdesc${i}`}>{txt}</span>
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
      desc: (
        <StepDesc texts={[
          tracking.created_date && moment(tracking.created_date).format(timeFormat),
        ]}
        />
      ),
    }];
    let currentStep = tracking.status - 1;
    if (tracking.upstream) {
      trackingSteps.push({
        title: this.msg('trackAccept'),
        desc: (
          <StepDesc texts={[
            tracking.upstream_acpt_time && moment(tracking.upstream_acpt_time).format(timeFormat),
            tracking.upstream_name,
          ]}
          />
        ),
      });
      trackingSteps.push({
        title: this.msg('trackDispatch'),
        desc: (
          <StepDesc texts={[
            tracking.upstream_disp_time && tracking.upstream_status === SHIPMENT_TRACK_STATUS.undelivered &&
              moment(tracking.upstream_disp_time).format(timeFormat),
          ]}
          />
        ),
      });
    }
    if (tracking.downstream) {
      trackingSteps.push({
        title: this.msg('trackAccept'),
        desc: (
          <StepDesc texts={[
            tracking.downstream_acpt_time && moment(tracking.downstream_acpt_time).format(timeFormat),
            tracking.downstream_name,
          ]}
          />
        ),
      });
      trackingSteps.push({
        title: this.msg('trackDispatch'),
        desc: (
          <StepDesc texts={[
            tracking.downstream_disp_time && tracking.downstream_status === SHIPMENT_TRACK_STATUS.undelivered &&
              moment(tracking.downstream_disp_time).format(timeFormat),
          ]}
          />
        ),
      });
      if (
        tracking.status === tracking.downstream_status
        || tracking.downstream_status > SHIPMENT_TRACK_STATUS.unaccepted
      ) {
        currentStep = currentStep + 2;
      }
    }
    trackingSteps.push(
     {
      title: this.msg('trackPickup'),
      desc: (
        <StepDesc texts={[
          tracking.pickup_act_time && moment(tracking.pickup_act_time).format(timeFormat),
        ]}
        />
      ),
    }, {
      title: this.msg('trackDeliver'),
      desc: (
        <StepDesc texts={[
          tracking.deliver_act_time && moment(tracking.deliver_act_time).format(timeFormat),
        ]}
        />
      ),
    }, {
      title: this.msg('trackPod'),
      desc: (
        <StepDesc texts={[
          tracking.pod_recv_date && moment(tracking.pod_recv_date).format(timeFormat),
        ]}
        />
      ),
    });
    return (
      <div>
        <Col offset={1} span={7}>
          <h3>{this.msg('trackingStepTitle')}</h3>
          <Steps current={currentStep} direction="vertical">
          {
            trackingSteps.map((ts, i) => <Step key={`${ts.title}${i}`} title={ts.title} description={ts.desc} />)
          }
          </Steps>
        </Col>
      </div>
    );
  }
}
