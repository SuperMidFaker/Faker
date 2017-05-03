import React, { PropTypes } from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import { connect } from 'react-redux';
import Avatar from 'react-avatar';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import Table from 'client/components/remoteAntTable';
import { hideNotificationDock, loadMessages, markMessages, markMessage } from 'common/reducers/notification';
import { MESSAGE_STATUS } from 'common/constants';
import DockPanel from 'client/components/DockPanel';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadMessages(cookie, {
    loginId: state.account.loginId,
    pageSize: state.notification.messages.pageSize,
    currentPage: state.notification.messages.currentPage,
    status: state.notification.messages.status,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    visible: state.notification.dockVisible,
    messages: state.notification.messages,
    loginId: state.account.loginId,
  }),
  { hideNotificationDock, loadMessages, markMessages, markMessage }
)
export default class NotificationDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadMessages: PropTypes.func.isRequired,
    markMessages: PropTypes.func.isRequired,
    markMessage: PropTypes.func.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleReadMessage = (record) => {
    this.props.markMessage({
      id: record.id,
      status: 1,
    });
    // this.handleNavigationTo(record.url);
  }

  renderColumnText(status, text, record) {
    let style = {};
    if (status === MESSAGE_STATUS.read.key) {
      style = { color: '#CCC' };
    }
    return <a onClick={() => this.handleReadMessage(record)} style={style}>{text}</a>;
  }

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
        render: o => <Avatar name={o} size={28} round />,
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
          status: this.props.messages.status,
          loginId: this.props.loginId,
          showSizeChanger: true,
          showQuickJumper: false,
          pageSize: result.pageSize,
        };
        return pagination;
      },
      getParams: (pagination, filters, sorter) => {
        const params = {
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          status: this.props.messages.status,
          loginId: this.props.loginId,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        return params;
      },
      remotes: this.props.messages,
    });
    return (
      <DockPanel visible={visible} onClose={this.props.hideNotificationDock}
        title={<span>{this.msg('notification')}</span>}
      >
        <div className="toolbar">
          <div className="toolbar-right">
            <Tooltip title={this.msg('markAllRead')}>
              <Button shape="circle" icon="check" onClick={this.markAllRead} />
            </Tooltip>
            <Popconfirm placement="bottomRight" title={this.msg('confirmDeleteAllRead')} onConfirm={this.deleteAllRead}>
              <Tooltip title={this.msg('deleteAllRead')}>
                <Button shape="circle" icon="delete" />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
        <Table columns={columns} dataSource={dataSource} locale={{ emptyText: this.msg('emptyNew') }} showHeader={false} scrollOffset={170} />
      </DockPanel>
    );
  }
}
