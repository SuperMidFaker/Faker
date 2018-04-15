import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button, Popconfirm, Tooltip } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import DataTable from 'client/components/DataTable';
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
  {
    hideNotificationDock, loadMessages, markMessages, markMessage,
  }
)
export default class NotificationDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    messages: PropTypes.shape({ status: PropTypes.number }).isRequired,
    loadMessages: PropTypes.func.isRequired,
    markMessages: PropTypes.func.isRequired,
    markMessage: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.handleLoad();
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleReadMessage = (record) => {
    this.props.markMessage({
      id: record.id,
      status: MESSAGE_STATUS.read.key,
    }).then(this.handleLoad);
    this.props.hideNotificationDock();
    this.context.router.push(record.url);
  }

  markAllRead = () => {
    const { loginId } = this.props;
    this.props.markMessages({ loginId, status: MESSAGE_STATUS.read.key }).then(this.handleLoad);
  }
  deleteAllRead = () => {
    const { loginId } = this.props;
    this.props.markMessages({ loginId, status: MESSAGE_STATUS.delete3.key }).then(this.handleLoad);
  }
  handleLoad = () => {
    const { loginId } = this.props;
    this.props.loadMessages(null, {
      loginId,
      pageSize: this.props.messages.pageSize,
      currentPage: this.props.messages.currentPage,
    });
  }
  renderColumnText(status, text, record) {
    if (status === MESSAGE_STATUS.read.key) {
      return <a onClick={() => this.context.router.push(record.url)} style={{ color: '#CCC' }}>{text}</a>;
    }
    return <a onClick={() => this.handleReadMessage(record)} >{text}</a>;
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
        render: o => <Avatar size="small" >{o}</Avatar>,
      }, {
        title: this.msg('time'),
        dataIndex: 'time',
        width: 80,
        render: o => moment(o).fromNow(),
      },
    ];
    const dataSource = new DataTable.DataSource({
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
          showTotal: total => `共 ${total} 条`,
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
    const toolbarActions = (<span>
      <Tooltip title={this.msg('markAllRead')}>
        <Button shape="circle" icon="check" onClick={this.markAllRead} />
      </Tooltip>
      <Popconfirm placement="bottomRight" title={this.msg('confirmDeleteAllRead')} onConfirm={this.deleteAllRead}>
        <Tooltip title={this.msg('deleteAllRead')}>
          <Button shape="circle" icon="delete" />
        </Tooltip>
      </Popconfirm>
    </span>);
    return (
      <DockPanel
        visible={visible}
        onClose={this.props.hideNotificationDock}
        title={<span>{this.msg('notification')}</span>}
      >
        <DataTable
          noSetting
          toolbarActions={toolbarActions}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          locale={{ emptyText: this.msg('emptyNew') }}
          showHeader={false}
          scrollOffset={170}
        />
      </DockPanel>
    );
  }
}
