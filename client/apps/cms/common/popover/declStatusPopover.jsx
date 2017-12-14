import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Timeline, Popover, Spin } from 'antd';
import { loadClearanceResults, clearClearanceResults } from 'common/reducers/cmsDeclare';

const TimelineItem = Timeline.Item;

@connect(
  state => ({
    results: state.cmsDeclare.customsResults,
    loading: state.cmsDeclare.customsResultsLoading,
  }),
  { loadClearanceResults, clearClearanceResults }
)
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
      this.props.loadClearanceResults(this.props.entryId);
    } else {
      this.props.clearClearanceResults();
    }
  }
  render() {
    const { results = [], entryId, children } = this.props;
    const overlay = (
      <Spin spinning={this.props.loading}>
        <Timeline>
          {
            results.map((res) => {
              let channelText;
              let dateFormat;
              if (res.channel === 'hg') {
                channelText = '海关信息网';
                dateFormat = 'YYYY-MM-DD';
              } else if (res.channel === 'edi') {
                channelText = '亿通EDI回执';
                dateFormat = 'YYYY-MM-DD HH:mm';
              }
              return (
                <TimelineItem key={res.process_note} color={res.channel_status === 1 ? 'green' : 'blue'} style={{ width: 200 }}>
                  <h4>{res.process_note}</h4>
                  <p>{`${moment(res.process_date).format(dateFormat)}`} <span className="pull-right mdc-text-grey">{channelText}</span></p>
                </TimelineItem>
              );
            })
          }
        </Timeline>
      </Spin>
    );
    return (
      <Popover placement="topRight" content={overlay} title={<span>通关状态 {entryId}</span>}
        onVisibleChange={this.handleViewResult}
      >
        {children}
      </Popover>
    );
  }
}
