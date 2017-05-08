import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import moment from 'moment';
import { Timeline, Card } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { loadOrderNodes } from 'common/reducers/crmOrders';
import MdIcon from 'client/components/MdIcon';
import CMSNodeCard from './cards/cmsNodeCard';
import TMSNodeCard from './cards/tmsNodeCard';
import CWMNodeCard from './cards/cwmNodeCard';
import messages from '../../message.i18n';
const formatMsg = format(messages);

// const timeFormat = 'YYYY-MM-DD HH:mm';

@injectIntl
@connect(
  state => ({
    order: state.crmOrders.dock.order,
    kinds: state.crmOrders.kinds,
  }),
  { loadOrderNodes }
)
export default class FlowPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kinds: PropTypes.array.isRequired,
    order: PropTypes.object.isRequired,
  }
  componentWillMount() {
    const { shipmt_order_no } = this.props.order;
    this.props.loadOrderNodes(shipmt_order_no);
  }
  componentWillReceiveProps(nextProps) {
    const { shipmt_order_no } = nextProps.order;
    if (nextProps.order.shipmt_order_no !== this.props.order.shipmt_order_no) {
      this.props.loadOrderNodes(shipmt_order_no);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    return (
      <div className="pane-content tab-pane">
        <Card>
          <Timeline>
            {
              this.props.kinds.map((item, index) => {
                if (item.kind === 'import' || item.kind === 'export') {
                  return (
                    <Timeline.Item dot={<MdIcon mode="ikons" type="login" key={index} />} key={item.name}>
                      <CMSNodeCard {...item} />
                    </Timeline.Item>
                  );
                } else if (item.kind === 'tms') {
                  return (
                    <Timeline.Item dot={<MdIcon type="truck" key={index} />} key={item.name}>
                      <TMSNodeCard {...item} />
                    </Timeline.Item>
                  );
                } else {
                  return (
                    <Timeline.Item dot={<MdIcon type="layers" key={index} />} key={item.name}>
                      <CWMNodeCard uuid={item.uuid} title={item.name} />
                    </Timeline.Item>
                  );
                }
              })
            }
          </Timeline>
        </Card>
      </div>);
  }
}
