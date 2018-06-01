import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Timeline, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import UserAvatar from 'client/components/UserAvatar';
import { hideDeclLog, loadDeclLogs } from 'common/reducers/cmsCustomsDeclare';
import { formatMsg } from '../message.i18n';

function LogItem(props) {
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
    visible: state.cmsCustomsDeclare.declLogPanel.visible,
    userMembers: state.account.userMembers,
  }),
  { hideDeclLog, loadDeclLogs }
)
export default class CusDeclLogsPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    preEntrySeqNo: PropTypes.string,
  }
  state = {
    logs: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible && nextProps.visible) {
      this.props.loadDeclLogs(nextProps.preEntrySeqNo).then((result) => {
        if (!result.error) {
          this.setState({
            logs: result.data,
          });
        }
      });
    }
  }
  getUser(loginId) {
    const user = this.props.userMembers.filter(usm => usm.login_id === loginId)[0];
    return user || {};
  }

  msg = formatMsg(this.props.intl)
  render() {
    const { visible } = this.props;
    const { logs } = this.state;
    return (
      <DockPanel
        visible={visible}
        onClose={this.props.hideDeclLog}
        title={<span>操作记录</span>}
      >
        <div className="pane-content tab-pane">
          <Card bodyStyle={{ padding: 16, paddingTop: 32 }}>
            <Timeline>
              {logs.map(log =>
                (<Timeline.Item>
                  <LogItem
                    timestamp={log.created_date}
                    loginId={log.login_id}
                    content={log.op_content}
                  />
                </Timeline.Item>))}
            </Timeline>
          </Card>
        </div>
      </DockPanel>
    );
  }
}
