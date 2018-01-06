import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import moment from 'moment';
import { Timeline } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { loadOrderNodes } from 'common/reducers/crmOrders';
import { Logixon } from 'client/components/FontIcon';
import CMSNodeCard from './cards/cmsNodeCard';
import TMSNodeCard from './cards/tmsNodeCard';
import CWMInboundNodeCard from './cards/cwmInboundNodeCard';
import CWMOutboundNodeCard from './cards/cwmOutboundNodeCard';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    shipmtOrderNo: state.crmOrders.dock.order.shipmt_order_no,
    bizObjects: state.crmOrders.orderBizObjects,
  }),
  { loadOrderNodes }
)
export default class FlowPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    bizObjects: PropTypes.arrayOf(PropTypes.shape({ kind: PropTypes.oneOf(['import', 'export', 'cwmrec', 'tms', 'cwmship']) })).isRequired,
    shipmtOrderNo: PropTypes.string.isRequired,
  }
  componentDidMount() {
    const { shipmtOrderNo } = this.props;
    this.props.loadOrderNodes(shipmtOrderNo);
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
                  return (
                    <Timeline.Item dot={<Logixon type="import" />} key={item.uuid}>
                      <CMSNodeCard node={item} />
                      {item.children.map(subitem =>
                        (<Timeline.Item dot={<Logixon type="import" />} key={subitem.biz_no}>
                          <CMSNodeCard node={subitem} />
                        </Timeline.Item>))}
                    </Timeline.Item>
                  );
                  case 'export':
                  return (
                    <Timeline.Item dot={<Logixon type="export" />} key={item.uuid}>
                      <CMSNodeCard node={item} />
                      {item.children.map(subitem =>
                        (<Timeline.Item dot={<Logixon type="export" />} key={subitem.biz_no}>
                          <CMSNodeCard node={subitem} />
                        </Timeline.Item>))}
                    </Timeline.Item>
                  );
                  case 'tms':
                  return (
                    <Timeline.Item dot={<Logixon type="truck" />} key={item.uuid}>
                      <TMSNodeCard node={item} />
                      {item.children.map(subitem =>
                        (<Timeline.Item dot={<Logixon type="truck" />} key={subitem.biz_no}>
                          <TMSNodeCard node={subitem} />
                        </Timeline.Item>))}
                    </Timeline.Item>
                  );
                  case 'cwmrec':
                  return (
                    <Timeline.Item dot={<Logixon type="receiving" />} key={item.uuid}>
                      <CWMInboundNodeCard node={item} />
                      {item.children.map(subitem =>
                        (<Timeline.Item dot={<Logixon type="receiving" />} key={subitem.biz_no}>
                          <CWMInboundNodeCard node={subitem} />
                        </Timeline.Item>))}
                    </Timeline.Item>
                  );
                  case 'cwmship':
                  return (
                    <Timeline.Item dot={<Logixon type="shipping" />} key={item.uuid}>
                      <CWMOutboundNodeCard node={item} />
                      {item.children.map(subitem =>
                        (<Timeline.Item dot={<Logixon type="shipping" />} key={subitem.biz_no}>
                          <CWMOutboundNodeCard node={subitem} />
                        </Timeline.Item>))}
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
