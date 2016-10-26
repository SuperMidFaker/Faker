import React, { PropTypes } from 'react';
import { Timeline } from 'antd';
import moment from 'moment';
import { renderLoc } from './consignLocation';

const TimelineItem = Timeline.Item;
export default class TrackingTimeline extends React.Component {
  static propTypes = {
    points: PropTypes.object.isRequired,
  }
  render() {
    const points = [];
    this.props.points.forEach((item) => {
      points.push({
        title: `${renderLoc(item, 'province', 'city', 'district') || ''} ${item.address || ''}`,
        description: `${moment(item.location_time || item.created_date).format('YYYY-MM-DD HH:mm')}`,
      });
    });
    const trackingSteps = points.map((s, i) => {
      if (i === 0) {
        return (<TimelineItem key={i} color="green">{s.title} {s.description}</TimelineItem>);
      } else {
        return (<TimelineItem key={i}>{s.title} {s.description}</TimelineItem>);
      }
    });
    return (
      <Timeline>{trackingSteps}</Timeline>
    );
  }
}
