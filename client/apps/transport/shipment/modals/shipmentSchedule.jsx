/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Steps } from 'antd';
import moment from 'moment';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
const Step = Steps.Step;

@connect(
  state => ({
    shipmt: state.shipment.previewer.shipmt,
    dispatch: state.shipment.previewer.dispatch,
  }),
  { }
)
export default class ShipmentSchedule extends React.Component {
  static propTypes = {
    shipmt: PropTypes.object.isRequired,
    dispatch: PropTypes.object.isRequired,
  }

  render() {
    const { shipmt, dispatch } = this.props;
    let statusDes = [];
    let statusPos = 0;
    if (shipmt.status < SHIPMENT_TRACK_STATUS.intransit) {
      statusDes = [{
        status: 'wait',
        title: '未提货',
        description: `预计时间:${shipmt.pickup_est_date ? moment(shipmt.pickup_est_date).format('YYYY.MM.DD') : ''}`,
      }, {
        status: 'wait',
        title: '待运输',
        description: '',
      }, {
        status: 'wait',
        title: '未送货',
        description: `预计时间:${shipmt.deliver_est_date ? moment(shipmt.deliver_est_date).format('YYYY.MM.DD') : ''}`,
      }];
      statusPos = 0;
    } else if (shipmt.status === SHIPMENT_TRACK_STATUS.intransit) {
      statusDes = [{
        status: 'finish',
        title: '已提货',
        description: `实际时间:${dispatch.pickup_act_date ? moment(dispatch.pickup_act_date).format('YYYY.MM.DD') : ''}`,
      }, {
        status: 'process',
        title: '运输中',
        description: '',
      }, {
        status: 'wait',
        title: '未送货',
        description: `预计时间:${shipmt.deliver_est_date ? moment(shipmt.deliver_est_date).format('YYYY.MM.DD') : ''}`,
      }];
      statusPos = 1;
    } else if (shipmt.status > SHIPMENT_TRACK_STATUS.intransit) {
      statusDes = [{
        status: 'finish',
        title: '已提货',
        description: `实际时间:${dispatch.pickup_act_date ? moment(dispatch.pickup_act_date).format('YYYY.MM.DD') : ''}`,
      }, {
        status: 'finish',
        title: '运输完成',
        description: '',
      }, {
        status: 'finish',
        title: '已送货',
        description: `实际时间:${dispatch.deliver_act_date ? moment(dispatch.deliver_act_date).format('YYYY.MM.DD') : ''}`,
      }];
      statusPos = 2;
    }
    const steps = statusDes.map((s, i) => <Step key={i} status={s.status} title={s.title} description={s.description} />);
    return (
      <Steps size="small" style={{ padding: 0 }} current={statusPos}>{steps}</Steps>
    );
  }
}
