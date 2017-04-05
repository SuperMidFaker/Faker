import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Steps } from 'antd';
import { loadOrderProgress } from 'common/reducers/crmOrders';
import { CRM_ORDER_STATUS, NODE_BIZ_OBJECTS } from 'common/constants';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import './orders.less';

const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
@connect()
export default class ProgressColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.object.isRequired,
  }
  state = { progress: [] }
  componentWillMount() {
    this.props.dispatch(loadOrderProgress(this.props.order.shipmt_order_no)).then((result) => {
      if (!result.error) {
        this.setState({ progress: result.data });
      }
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { progress } = this.state;
    let currentStep;
    progress.forEach((prog, index) => {
      if (prog.finished) {
        currentStep = index + 1;
      }
    });
    return (
      <div className="order-progress">
        {this.props.order.order_status !== CRM_ORDER_STATUS.created &&
        <Steps size="small" current={currentStep}>
          {progress.map((prog) => {
            let endDesc;
            if (prog.end && NODE_BIZ_OBJECTS[prog.kind]) {
              const bizObject = NODE_BIZ_OBJECTS[prog.kind].filter(nbo => nbo.key === prog.end.biz_object)[0];
              if (bizObject) {
                const trigger = bizObject.triggers.filter(tr => tr.key === prog.end.trigger_name)[0];
                if (trigger && trigger.actionText) {
                  endDesc = this.msg(trigger.actionText);
                }
              }
            }
            return (<Step title={prog.name} key={prog.name} description={(
              <span>
                {prog.start && <div className="mdc-text-grey table-font-small">开始: {prog.start.trigger_time && moment(prog.start.trigger_time).format('MM.DD HH:mm')}</div>}
                {prog.end && <div className="mdc-text-grey table-font-small">{endDesc}: {prog.end.trigger_time && moment(prog.end.trigger_time).format('MM.DD HH:mm')}</div>}
              </span>)}
            />);
          })}
        </Steps>}
      </div>
    );
  }
}
