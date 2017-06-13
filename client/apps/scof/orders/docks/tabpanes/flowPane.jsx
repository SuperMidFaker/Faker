import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import moment from 'moment';
import { Timeline, Card } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { loadOrderNodes } from 'common/reducers/crmOrders';
import { MdIcon } from 'client/components/FontIcon';
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
              this.props.kinds.map((item) => {
                if (item.kind === 'import' || item.kind === 'export') {
                  return (
                    <Timeline.Item dot={<MdIcon mode="ikons" type="login" />} key={item.name}>
                      <CMSNodeCard uuid={item.uuid} name={item.name} declWayCode={item.decl_way_code}
                        kind={item.kind} transMode={item.trans_mode} blWbNo={item.bl_wb_no} in_degree={item.in_degree}
                      />
                    </Timeline.Item>
                  );
                } else if (item.kind === 'tms') {
                  return (
                    <Timeline.Item dot={<MdIcon type="truck" />} key={item.name}>
                      <TMSNodeCard uuid={item.uuid} name={item.name} consigneeName={item.consignee_name}
                        consignerName={item.consigner_name} trsMode={item.trs_mode} in_degree={item.in_degree}
                        pod={!!item.pod}
                      />
                    </Timeline.Item>
                  );
                } else {
                  return (
                    <Timeline.Item dot={<MdIcon type="layers" />} key={item.name}>
                      <CWMNodeCard uuid={item.uuid} title={item.name} in_degree={item.in_degree} />
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
