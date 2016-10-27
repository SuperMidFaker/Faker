import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Timeline, Icon, Popconfirm } from 'antd';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { renderLoc } from '../../../common/consignLocation';
import { removeShipmtPoint } from 'common/reducers/shipment';
import './pane.less';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    points: state.shipment.previewer.points,
    dispatch: state.shipment.previewer.dispatch,
  }),
  { removeShipmtPoint }
)
export default class TrackingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    removeShipmtPoint: PropTypes.func.isRequired,
    dispatch: PropTypes.object.isRequired,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleRemovePoint = (pointId, content) => {
    this.props.removeShipmtPoint(pointId, content, this.props.dispatch.id);
  }
  render() {
    const points = [];
    this.props.points.forEach((item) => {
      points.push({
        ...item,
        title: `${renderLoc(item, 'province', 'city', 'district') || ''} ${item.address || ''}`,
        description: `${moment(item.location_time || item.created_date).format('YYYY-MM-DD HH:mm')}`,
      });
    });
    const trackingSteps = points.map((s, i) => {
      let color = 'green';
      let dotType = (<Icon type="environment-o" style={{ fontSize: '14px' }} />);
      if (i === 0) {
        color = 'blue';
        dotType = (<Icon type="environment" style={{ fontSize: '20px' }} />);
      }
      return (
        <Timeline.Item dot={dotType} key={i} color={color}>
          {s.title} {s.description}
          <Popconfirm title="确定删除这条位置信息？" onConfirm={() => this.handleRemovePoint(s.id, s.title)}>
            <Icon type="close" className="timeline-remove" />
          </Popconfirm>
        </Timeline.Item>
      );
    });

    return (
      <Card>
        <Timeline>{trackingSteps}</Timeline>
      </Card>
    );
  }
}
