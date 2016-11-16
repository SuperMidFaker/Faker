/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Steps, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CRM_ORDER_STATUS, CRM_ORDER_MODE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    order: state.crmOrders.previewer.order,
  }),
  { }
)
export default class ShipmentSchedule extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { order } = this.props;
    let statusDes = [];
    let statusPos = 0;
    if (order.order_status === CRM_ORDER_STATUS.created) {
      if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'wait',
          title: this.msg('clearancing'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else if (order.shipmt_order_mode === CRM_ORDER_MODE.transport) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'wait',
          title: this.msg('transporting'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'wait',
          title: this.msg('clearancing'),
        }, {
          status: 'wait',
          title: this.msg('transporting'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      }
    } else if (order.order_status === CRM_ORDER_STATUS.clearancing) {
      if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'process',
          title: this.msg('clearancing'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else if (order.shipmt_order_mode === CRM_ORDER_MODE.transport) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'wait',
          title: this.msg('transporting'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'process',
          title: this.msg('clearancing'),
        }, {
          status: 'wait',
          title: this.msg('transporting'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      }
    } else if (order.order_status === CRM_ORDER_STATUS.transporting) {
      if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'finish',
          title: this.msg('clearancing'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else if (order.shipmt_order_mode === CRM_ORDER_MODE.transport) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'process',
          title: this.msg('transporting'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'finish',
          title: this.msg('clearancing'),
        }, {
          status: 'process',
          title: this.msg('transporting'),
        }, {
          status: 'wait',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      }
    } else if (order.order_status === CRM_ORDER_STATUS.finished) {
      if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'finish',
          title: this.msg('clearancing'),
        }, {
          status: 'finish',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else if (order.shipmt_order_mode === CRM_ORDER_MODE.transport) {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'finish',
          title: this.msg('transporting'),
        }, {
          status: 'finish',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      } else {
        statusDes = [{
          status: 'finish',
          title: this.msg('created'),
        }, {
          status: 'finish',
          title: this.msg('clearancing'),
        }, {
          status: 'finish',
          title: this.msg('transporting'),
        }, {
          status: 'finish',
          title: this.msg('finished'),
        }];
        statusPos = 0;
      }
    }
    const steps = statusDes.map((s, i) => <Step key={i} status={s.status} title={s.title} />);
    return (
      <Card>
        <Steps current={statusPos}>{steps}</Steps>
      </Card>
    );
  }
}
