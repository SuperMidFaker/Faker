import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import Table from 'client/components/remoteAntTable';
import { format } from 'client/common/i18n/helpers';
import { hideActivitiesDock } from 'common/reducers/activities';
import { loadRecentActivities } from 'common/reducers/operationLog';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    visible: state.activities.dockVisible,
    recentActivities: state.operationLog.userActivities,
  }),
  { loadRecentActivities, hideActivitiesDock }
)
export default class ActivitiesDockPanel extends React.Component {
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
    const { visible, recentActivities } = this.props;
    const columns = [{
      title: '业务单号',
      dataIndex: 'op_ref_billno',
      width: 200,
    }, {
      title: '内容',
      dataIndex: 'op_content',
    }, {
      title: '时间',
      dataIndex: 'created_date',
      width: 100,
      render: o => o && moment(o).fromNow(),
    },
    ];
    return (
      <DockPanel size="small" visible={visible} onClose={this.props.hideActivitiesDock}
        title={<span>{this.msg('activities')}</span>}
      >
        <Table columns={columns} dataSource={recentActivities} rowKey="id" locale={{ emptyText: this.msg('emptyActivities') }}
          showHeader={false} scrollOffset={170} scroll={{ x: 400 }}
        />
      </DockPanel>
    );
  }
}
