import React, { PropTypes } from 'react';
import { Steps, Popover } from 'antd';

const Step = Steps.Step;

export default class DeclStatusPopover extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.shape({
      channel: PropTypes.string.isRequired,
      processed_note: PropTypes.string.isRequired,
      processed_date: PropTypes.Date.isRequired,
    })),
    visible: PropTypes.bool.isRequired,
  }
  render() {
    const { results, visible, entryId } = this.props;
    const overlay = (
      <div>
        <span>{entryId}</span>
        <Steps direction="vertical" current={results.length - 1}>
          {
            results.map(res =>
              <Step title={res.processed_note} description={`${res.processed_date} ${res.channel}`} />
            )
          }
        </Steps>
      </div>
    );
    return (
      <Popover placement="bottomLeft" content={overlay} trigger="click"
        overlayStyle={{ left: 132 }}
        visible={visible} title="通关状态追踪"
      />
    );
  }
}
