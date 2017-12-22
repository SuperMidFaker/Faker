import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import moment from 'moment';
import { Timeline } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { loadOrderNodes } from 'common/reducers/crmOrders';
import { MdIcon, Ikons } from 'client/components/FontIcon';
import CMSNodeCard from './cards/cmsNodeCard';
import TMSNodeCard from './cards/tmsNodeCard';
import CWMInboundNodeCard from './cards/cwmInboundNodeCard';
import CWMOutboundNodeCard from './cards/cwmOutboundNodeCard';
import messages from '../../message.i18n';

const formatMsg = format(messages);

// const timeFormat = 'YYYY-MM-DD HH:mm';

@injectIntl
@connect(
  state => ({
    order: state.crmOrders.dock.order,
    bizObjects: state.crmOrders.orderBizObjects,
  }),
  { loadOrderNodes }
)
export default class FlowPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    bizObjects: PropTypes.arrayOf(PropTypes.shape({ kind: PropTypes.oneOf(['import', 'export', 'cwmrec', 'tms', 'cwmso']) })).isRequired,
    order: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
  }
  componentWillMount() {
    const { order } = this.props;
    this.props.loadOrderNodes(order.shipmt_order_no);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.order.shipmt_order_no !== this.props.order.shipmt_order_no) {
      this.props.loadOrderNodes(nextProps.order.shipmt_order_no);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    return (
      <div className="pane-content tab-pane">
        <Timeline>
          {
              this.props.bizObjects.map((item) => {
                switch (item.kind) {
                  case 'import':
                  case 'export':
                  return (
                    <Timeline.Item dot={<Ikons type="login" />} key={item.uuid}>
                      <CMSNodeCard node={item} />
                    </Timeline.Item>
                  );
                  case 'tms':
                  return (
                    <Timeline.Item dot={<MdIcon type="truck" />} key={item.uuid}>
                      <TMSNodeCard node={item} />
                    </Timeline.Item>
                  );
                  case 'cwmrec':
                  return (
                    <Timeline.Item dot={<MdIcon type="layers" />} key={item.uuid}>
                      <CWMInboundNodeCard node={item} />
                    </Timeline.Item>
                  );
                  case 'cwmso':
                  return (
                    <Timeline.Item dot={<MdIcon type="layers" />} key={item.uuid}>
                      <CWMOutboundNodeCard node={item} />
                    </Timeline.Item>
                  );
                  default:
                  return null;
              }
            })
          }
        </Timeline>
      </div>);
  }
}
