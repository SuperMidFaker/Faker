import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import UserAvatar from 'client/components/UserAvatar';
import { hideDeclLog, loadDeclLogs } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

function getBehavior(code) {
  if (code === 'CREATE') {
    return '创建了';
  } else if (code === 'SEND') {
    return '发送了';
  }
  return '';
}

@injectIntl
@connect(
  state => ({
    visible: state.cmsDeclare.declLogPanel.visible,
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

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    const { logs } = this.state;
    return (
      <DockPanel
        visible={visible}
        onClose={this.props.hideDeclLog}
        title={<span>操作记录</span>}
      >
        <List
          itemLayout="horizontal"
          dataSource={logs}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<UserAvatar loginId={item.login_id} />}
                title={(<span>
                  {this.getUser(item.login_id).name} <a>{getBehavior(item.op_behavior)}</a>
                </span>)}
                description={item.created_date && moment(item.created_date).format('YYYY-MM-DD hh:mm')}
              />
              <div>{item.op_content}</div>
            </List.Item>
          )}
        />
      </DockPanel>
    );
  }
}
