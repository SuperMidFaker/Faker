import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Timeline } from 'antd';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { },
)
export default class LogsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  msg = formatMsg(this.props.intl)
  render() {
    const { customer } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Timeline>
          <Timeline.Item>Create a services site 2015-09-01</Timeline.Item>
          <Timeline.Item>Solve initial network problems 2015-09-01</Timeline.Item>
          <Timeline.Item>Technical testing 2015-09-01</Timeline.Item>
          <Timeline.Item>Network problems being solved 2015-09-01</Timeline.Item>
        </Timeline>
      </div>
    );
  }
}
