import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import Table from 'client/components/remoteAntTable';
import { format } from 'client/common/i18n/helpers';
import { hideActivitiesDock, loadRecentActivities } from 'common/reducers/activities';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.activities.dockVisible,
    loginId: state.account.loginId,
    recentActivities: state.activities.recentActivities,
  }),
  { loadRecentActivities, hideActivitiesDock }
)
export default class ActivitiesDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { visible } = this.props;
    const columns = [
      {
        title: this.msg('content'),
        dataIndex: 'content',
        render: (text, record) => this.renderColumnText(record.status, text, record),
      }, {
        title: this.msg('from_name'),
        dataIndex: 'from_name',
        width: 30,
        render: o => <Avatar size="small" >{o}</Avatar>,
      }, {
        title: this.msg('time'),
        dataIndex: 'time',
        width: 80,
        render: o => moment(o).fromNow(),
      },
    ];
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadMessages(null, params),
      resolve: result => result.data,
      getPagination: (result, resolve) => {
        const pagination = {
          total: result.totalCount,
          // 删除完一页时返回上一页
          current: resolve(result.totalCount, result.currentPage, result.pageSize),
          showSizeChanger: true,
          showQuickJumper: false,
          pageSize: result.pageSize,
          showTotal: total => `共 ${total} 条`,
        };
        return pagination;
      },
      getParams: (pagination, filters, sorter) => {
        const params = {
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        return params;
      },
      remotes: this.props.recentActivities,
    });
    return (
      <DockPanel size="small" visible={visible} onClose={this.props.hideActivitiesDock}
        title={<span>{this.msg('activities')}</span>}
      >
        <Table columns={columns} dataSource={dataSource} locale={{ emptyText: this.msg('emptyActivities') }} showHeader={false} scrollOffset={170} />
      </DockPanel>
    );
  }
}
