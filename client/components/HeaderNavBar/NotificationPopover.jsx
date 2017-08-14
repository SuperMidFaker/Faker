/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button, Popover, Badge, notification, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import NavLink from '../NavLink';
import { countMessages, messageBadgeNum, showNotificationDock, loadMessages, markMessages, markMessage } from 'common/reducers/notification';
import { prompt } from 'common/reducers/shipment';
import { getDriver } from 'common/reducers/transportResources';
import io from 'socket.io-client';
import { PROMPT_TYPES, MESSAGE_STATUS } from 'common/constants';

const formatMsg = format(messages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(countMessages(cookie, {
    loginId: state.account.loginId,
    status: 0,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  loginName: state.account.username,
  tenantName: state.account.tenantName,
  logo: state.account.logo,
  unreadMessagesNum: state.notification.unreadMessagesNum,
  newMessage: state.notification.newMessage,
  messages: state.notification.messages,
}), {
  messageBadgeNum, prompt, showNotificationDock, loadMessages, markMessages, markMessage
})
export default class NotificationPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    logo: PropTypes.string,
    newMessage: PropTypes.object.isRequired,
    prompt: PropTypes.func.isRequired,
    loadMessages: PropTypes.func.isRequired,
    messages: PropTypes.object.isRequired,
    markMessages: PropTypes.func.isRequired,
    markMessage: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
    messages: [],
  }
  componentDidMount() {
    const { tenantId, loginId, loginName } = this.props;
    if (("Notification" in window) && Notification.permission !== 'granted') {
      Notification.requestPermission(status => {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
      });
    }
    
    const socket = io(`${API_ROOTS.notify}notify`);
    socket.on('connect', () => {
      socket.emit('login', {login_id: loginId});
    });
    socket.on('message', (data) => {
      this.notif({
        content: data.content,
        body: data.content,
        icon: data.logo,
        url: data.url,
      });
      this.props.messageBadgeNum(this.props.unreadMessagesNum + 1);
    });
    if (__DEV__) {
      socket.on('connect_error', (error) => {
        socket.close();
      });
    }
    this.setState({ socket });
  }

  componentWillReceiveProps(nextProps) {
    const { messages } = nextProps;
    let tempMessages = messages.data.filter(item => item.status === MESSAGE_STATUS.notRead.key);
    if (tempMessages.length > 3) {
      tempMessages = tempMessages.slice(0, 3);
    }
    this.setState({ messages: tempMessages });
  }
  markAllRead = () => {
    const { loginId } = this.props;
    const promises = this.state.messages.map(item => this.props.markMessage({id: item.id, status: MESSAGE_STATUS.read.key}));
    Promise.all(promises).then(this.handleLoad);
  }
  handleCloseMessage = (record) => {
    this.props.markMessage({
      id: record.id,
      status: MESSAGE_STATUS.read.key,
    }).then(this.handleLoad);
  }
  handleReadMessage = (record) => {
    this.props.markMessage({
      id: record.id,
      status: MESSAGE_STATUS.read.key,
    }).then(this.handleLoad);
    this.context.router.push(record.url);
  }
  // handleSendMessage(data) {

  // }
  notif(data) {
    // console.log(data);
    if (("Notification" in window) && Notification.permission === 'granted') {
      const n = new Notification(data.content, data);
      n.onclick = () => {
        // this.handleNavigationTo(data.url);
        n.close();
      };
    } else {
      const key = `open${Date.now()}`;
      const btnClick = () => {
        this.handleNavigationTo(data.url);
        notification.close(key);
      };
      const btn = (
        <Button type="primary" size="small" onClick={btnClick}>
          {formatMsg(this.props.intl, 'detail')}
        </Button>
      );
      notification.open({
        message: '消息',
        description: data.content,
        btn,
        key,
      });
    }
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleLoad = () => {
    const { loginId, messages } = this.props;
    this.props.loadMessages(null, {
      loginId,
      pageSize: messages.pageSize,
      currentPage: 1,
    });
  }
  handleVisibleChange = (visible) => {
    const { loginId } = this.props;
    if (visible) {
      this.handleLoad();
    }
    this.setState({ visible });
  }
  handleShowDock = () => {
    this.setState({ visible: false, });
    this.props.showNotificationDock();
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { unreadMessagesNum } = this.props;
    const notificationContent = (<div className="navbar-popover" style={{ width: 360 }}>
      <div className="popover-header">
        <div className="toolbar-right">
          <a role="presentation" onClick={this.markAllRead}><i className="zmdi zmdi-check-all zmdi-hc-lg" /></a>
        </div>
        <span>{this.msg('notification')}</span>
      </div>
      <div className="popover-body">
      {this.state.messages.map(item => (
        <Alert
          message={<a onClick={() => this.handleReadMessage(item)} >{item.content}</a>}
          type="info"
          showIcon
          closable
          onClose={() => this.handleCloseMessage(item)}
          key={item.id}
        />
      ))}
      </div>
      <div className="popover-footer">
        <a onClick={this.handleShowDock}>{this.msg('seeAll')}</a>
      </div>
    </div>);

    return (
      <Popover content={notificationContent} placement="bottomLeft" trigger="click"
        visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <div>
            <Badge count={unreadMessagesNum} overflowCount={99}>
                <i className="icon s7-bell" />
            </Badge>
        </div>
      </Popover>
    );
  }
}
