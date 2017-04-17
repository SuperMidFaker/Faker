import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Timeline, Popover, Icon } from 'antd';
import { loadCustomsResults, clearCustomsResults } from 'common/reducers/cmsDeclare';

const TimelineItem = Timeline.Item;

@connect(
  state => ({
    results: state.cmsDeclare.customsResults,
  }),
  { loadCustomsResults, clearCustomsResults })
export default class DeclStatusPopover extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.shape({
      channel_status: PropTypes.number.isRequired,
      channel: PropTypes.oneOf(['hg', 'edi']),
      process_note: PropTypes.string.isRequired,
      processed_date: PropTypes.object,
    })),
    entryId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  }
  handleViewResult = (visible) => {
    if (visible) {
      this.props.loadCustomsResults(this.props.entryId);
    } else {
      this.props.clearCustomsResults();
    }
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
                <TimelineItem key={res.process_note} color={res.channel_status === 1 ? 'green' : 'blue'}>
                  <p>{res.process_note}</p>
                  <p>{`${moment(res.process_date).format('YYYY-MM-DD HH:mm')}`} <span className="mdc-text-grey">{channelText}</span></p>
                </TimelineItem>
              );
            })
          }
        </Timeline>
      </div>
    );
    return (
      <Popover placement="topRight" content={overlay} title={<span><Icon type="file" /> {entryId}</span>}
        onVisibleChange={this.handleViewResult}
      >
        {children}
      </Popover>
    );
  }
}
