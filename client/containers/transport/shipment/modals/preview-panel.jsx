import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Tag/* , message */ } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import DetailPane from './tabpanes/detail-pane';
import { SHIPMENT_TRACK_STATUS } from 'universal/constants';
import { hidePreviewer } from 'universal/redux/reducers/shipment';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
import './preview-panel.less';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function getTrackStatusMsg(status) {
  let msg = 'trackDraft';
  if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
    msg = 'trackUnaccept';
  } else if (status === SHIPMENT_TRACK_STATUS.undispatched) {
    msg = 'trackUndispatched';
  } else if (status === SHIPMENT_TRACK_STATUS.undelivered) {
    msg = 'trackUndelivered';
  } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
    msg = 'trackIntransit';
  } else if (status === SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackDelivered';
  }
  return msg;
}
@injectIntl
@connect(
  state => ({
    visible: state.shipment.previewer.visible,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    status: state.shipment.previewer.shipmt.status,
  }),
  { hidePreviewer }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    shipmtNo: PropTypes.string,
    status: PropTypes.number,
    hidePreviewer: PropTypes.func.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleClose = () => {
    this.props.hidePreviewer();
  }
  render() {
    const { visible, shipmtNo, status } = this.props;
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`}>
        <div className="activity-panel">
          <div className="header">
            <span className="title">{shipmtNo}</span>
            <Tag color="blue">{this.msg(getTrackStatusMsg(status))}</Tag>
            <div className="pull-right">
              <Button type="ghost" shape="circle-outline"><Icon type="export" /></Button>
              <Button type="ghost" shape="circle-outline"><Icon type="share-alt" /></Button>
              <Button type="ghost" shape="circle-outline" onClick={this.handleClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <div className="body">
            <Tabs defaultActiveKey="detail">
              <TabPane tab={this.msg('shipmtDetail')} key="detail">
                <DetailPane />
              </TabPane>
              <TabPane tab={this.msg('shipmtDynamic')} key="dynamic">
              动态
              </TabPane>
              <TabPane tab={this.msg('shipmtTracking')} key="tracking">
              追踪
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
