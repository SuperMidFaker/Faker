import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Timeline } from 'antd';
import UserAvatar from 'client/components/UserAvatar';
import { formatMsg } from '../message.i18n';
import './style.less';

export function LogItem(props) {
  const {
    timestamp, loginId, content,
  } = props;
  return (
    <div className="log-item">
      <div className="log-item-l">
        <div>{moment(timestamp).format('HH:mm:ss')}</div>
        <div>{moment(timestamp).format('YYYY.MM.DD')}</div>
      </div>
      <div className="log-item-r">
        <UserAvatar size="small" loginId={loginId} showName />
        <div className="log-item-r-content">{content}</div>
      </div>
    </div>
  );
}
LogItem.propTypes = {
  timestamp: PropTypes.string,
  loginId: PropTypes.number,
  content: PropTypes.string,
};

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
    // const { logs } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16, paddingTop: 32 }}>
          <Timeline>
            <Timeline.Item><LogItem timestamp="2018-05-28T02:37:11.000Z" loginId={308} content="新建" /></Timeline.Item>
            <Timeline.Item><LogItem timestamp="2018-05-28T02:37:11.000Z" loginId={308} content="新建" /></Timeline.Item>
            <Timeline.Item><LogItem timestamp="2018-05-28T02:37:11.000Z" loginId={308} content="新建" /></Timeline.Item>
          </Timeline>
        </Card>
      </div>
    );
  }
}
