import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Avatar, List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { format } from 'client/common/i18n/helpers';
import { hideActivitiesDock } from 'common/reducers/activities';
import { loadRecentActivities } from 'common/reducers/operationLog';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar,
    visible: state.activities.dockVisible,
    recentActivities: state.operationLog.userActivities,
  }),
  { loadRecentActivities, hideActivitiesDock }
)
export default class CusDeclLogsPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.loadRecentActivities(50, { user: nextProps.loginId });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { avatar, visible, recentActivities } = this.props;
    return (
      <DockPanel
        size="small"
        visible={visible}
        onClose={this.props.hideActivitiesDock}
        title={<span>{this.msg('activities')}</span>}
      >
        <List
          itemLayout="horizontal"
          dataSource={recentActivities}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={avatar} />}
                title={<a>{item.op_behavior}</a>}
                description={item.created_date && moment(item.created_date)}
              />
              <div>{item.op_content}</div>
            </List.Item>
          )}
        />
      </DockPanel>
    );
  }
}
