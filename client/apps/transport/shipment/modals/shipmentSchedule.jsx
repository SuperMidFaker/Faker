/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Steps, Card } from 'antd';
const Step = Steps.Step;

@connect(
  state => ({
    shipmt: state.shipment.previewer.shipmt,
  }),
  { }
)
export default class ShipmentSchedule extends React.Component {
  static propTypes = {
    shipmt: PropTypes.object.isRequired,
  }

  render() {
    const { shipmt } = this.props;
    let statusDes = [];
    let statusPos = 0;
    if (shipmt.status < 4) {
      statusDes = [{
        status: 'wait',
        title: '未提货',
      }, {
        status: 'wait',
        title: '待运输',
        description: '',
      }, {
        status: 'wait',
        title: '未送货',
      }];
      statusPos = 0;
    } else if (shipmt.status === 4) {
      statusDes = [{
        status: 'finish',
        title: '已提货',
      }, {
        status: 'process',
        title: '运输中',
      }, {
        status: 'wait',
        title: '未送货',
      }];
      statusPos = 1;
    } else if (shipmt.status > 4) {
      statusDes = [{
        status: 'finish',
        title: '已提货',
      }, {
        status: 'finish',
        title: '运输完成',
      }, {
        status: 'finish',
        title: '已送货',
      }];
      statusPos = 2;
    }
    const steps = statusDes.map((s, i) => <Step key={i} status={s.status} title={s.title} />);
    return (
      <Card>
        <Steps current={statusPos}>{steps}</Steps>
      </Card>
    );
  }
}
