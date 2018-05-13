import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Steps } from 'antd';
import { loadOrderProgress } from 'common/reducers/sofOrders';
import { CRM_ORDER_STATUS, NODE_BIZ_OBJECTS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import './style.less';

const formatMsg = format(messages);
const { Step } = Steps;

@injectIntl
@connect()
export default class ProgressColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
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
    const stepWidth = 120;
    const gapWidth = 80;
    let progWidth = '';
    switch (progress.length) {
      case 1:
        progWidth = stepWidth;
        break;
      case 2:
        progWidth = (stepWidth * 2) + gapWidth;
        break;
      case 3:
        progWidth = (stepWidth * 3) + (gapWidth * 2);
        break;
      case 4:
        progWidth = (stepWidth * 4) + (gapWidth * 3);
        break;
      default:
        progWidth = '100%';
        break;
    }
    return (
      <div className="order-progress" style={{ width: progWidth }}>
        {this.props.order.order_status !== CRM_ORDER_STATUS.created &&
        <Steps size="small" current={currentStep}>
          {progress.map((prog) => {
            let endDesc;
            if (prog.end && NODE_BIZ_OBJECTS[prog.kind]) {
              const bizObject = NODE_BIZ_OBJECTS[prog.kind].filter(nbo =>
                nbo.key === prog.end.biz_object)[0];
              if (bizObject) {
                const trigger = bizObject.triggers.filter(tr =>
                  tr.key === prog.end.trigger_name)[0];
                if (trigger && trigger.actionText) {
                  endDesc = this.msg(trigger.actionText);
                }
              }
            }
            return (<Step
              title={prog.name}
              key={prog.key}
              description={(
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
