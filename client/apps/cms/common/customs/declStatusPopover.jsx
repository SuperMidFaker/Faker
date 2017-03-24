import React, { PropTypes } from 'react';
import moment from 'moment';
import { Timeline, Popover } from 'antd';

const TimelineItem = Timeline.Item;

export default class DeclStatusPopover extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.shape({
      channel_status: PropTypes.bool.isRequired,
      channel: PropTypes.oneOf(['hg', 'edi']),
      process_note: PropTypes.string.isRequired,
      processed_date: PropTypes.object.isRequired,
    })),
    entryId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  }
  render() {
    const { results = [], entryId, children } = this.props;
    const overlay = (
      <div>
        <Timeline>
          {
            results.map((res) => {
              let channelText;
              if (res.channel === 'hg') {
                channelText = '海关信息网';
              } else if (res.channel === 'edi') {
                channelText = 'EDI回执';
              }
              return (
                <TimelineItem key={res.process_note} color={res.channel_status ? 'green' : 'blue'}>
                  <p>{res.process_note}</p>
                  <p>{`${moment(res.process_date).format('YYYY-MM-DD HH:mm')} ${channelText}`}</p>
                </TimelineItem>
              );
            })
          }
        </Timeline>
      </div>
    );
    return (
      <Popover placement="topRight" content={overlay} title={entryId}>
        {children}
      </Popover>
    );
  }
}
