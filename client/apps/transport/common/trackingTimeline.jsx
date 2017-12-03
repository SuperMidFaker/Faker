import React from 'react';
import PropTypes from 'prop-types';
import { Timeline, Icon } from 'antd';
import moment from 'moment';
import * as Location from 'client/util/location';

const TimelineItem = Timeline.Item;
export default class TrackingTimeline extends React.Component {
  static propTypes = {
    points: PropTypes.array.isRequired,
    type: PropTypes.string,
  }
  render() {
    const { type } = this.props;
    const points = [];
    this.props.points.forEach((item) => {
      points.push({
        id: item.id,
        date: `${moment(item.location_time || item.created_date).format('YYYY-MM-DD')}`,
        time: `${moment(item.location_time || item.created_date).format('HH:mm')}`,
        title: `${Location.renderLocation(item, 'province', 'city', 'district') || ''} ${item.address || ''}`,
        description: `${moment(item.location_time || item.created_date).format('YYYY-MM-DD HH:mm')}`,
      });
    });
    const trackingSteps = points.map((s, i) => {
      const key = `${s.id}${s.title}`;
      if (type === 'small') {
        if (i === 0) {
          return (<TimelineItem key={key} color="green">{s.description} {s.title}</TimelineItem>);
        } else {
          return (<TimelineItem key={key}>{s.description} {s.title}</TimelineItem>);
        }
      } else {
        let color = 'green';
        let dotType = (<Icon type="environment-o" style={{ fontSize: '14px', backgroundColor: '#fff' }} />);
        if (i === 0) {
          color = 'blue';
          dotType = (<Icon type="environment" style={{ fontSize: '20px', backgroundColor: '#fff' }} />);
        }
        return (
          <TimelineItem dot={dotType} key={key} color={color}>
            <span style={{ marginLeft: -100 }}>{s.date}</span>
            <span style={{ marginLeft: 34 }}>
              {s.title}
            </span>
            <div>{s.time}</div>
          </TimelineItem>
        );
      }
    });
    if (type === 'small') {
      return (
        <Timeline>{trackingSteps}</Timeline>
      );
    } else {
      return (
        <Timeline style={{ marginLeft: 100 }}>{trackingSteps}</Timeline>
      );
    }
  }
}
