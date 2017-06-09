/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button, Popover, Badge, notification, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import NavLink from './nav-link';
import { countMessages, messageBadgeNum, recordMessages, showNotificationDock } from 'common/reducers/notification';
import { prompt } from 'common/reducers/shipment';
import { getDriver } from 'common/reducers/transportResources';
import { PROMPT_TYPES } from 'common/constants';

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
}), {
  messageBadgeNum, recordMessages, prompt, showNotificationDock
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
    recordMessages: PropTypes.func.isRequired,
    prompt: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
  }
  easemob = {
    conn: null,
    WebIM: null,
  }
  componentDidMount() {
    const { tenantId, loginId, loginName } = this.props;
    if (!this.easemob.conn && window) {
      const WebIM = window.WebIM;
      WebIM.config = {
        xmppURL: 'im-api.easemob.com',
        apiURL: `${window.location.protocol === 'https:' ? 'https:' : 'http:'}//a1.easemob.com`,
        appkey: 'jiaojiao123#test',
        https: true,
        isMultiLoginSessions: true,
        isAutoLogin: true,
      };
      const conn = new WebIM.connection({
        https: WebIM.config.https,
        url: WebIM.config.xmppURL,
        isAutoLogin: WebIM.config.isAutoLogin,
        isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
      });
      conn.listen({
        onOpened: () => {          // 连接成功回调
          // 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
          conn.setPresence();
        },
        onClosed: () => {},         // 连接关闭回调
        onTextMessage: (msg) => {
          const data = JSON.parse(msg.data);
          this.notif(data.tenantName, {
            body: data.msg,
            icon: data.logo,
            url: '',
          });
          this.props.messageBadgeNum(this.props.unreadMessagesNum + 1);
        },
        onError: (msg) => { },           // 失败回调
      });

      const user = {
        apiUrl: WebIM.config.apiURL,
        user: `L_${loginId}`,
        pwd: `L_${loginId}`,
        appKey: WebIM.config.appkey,
      };

      conn.open(user);
      this.easemob.conn = conn;
      this.easemob.WebIM = WebIM;
    }

    if (("Notification" in window) && Notification.permission !== 'granted') {
      Notification.requestPermission(status => {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
      });
    }
  }
  componentWillUnmount() {
    this.easemob.conn.close();
  }
  componentWillReceiveProps(nextProps) {
    const { tenantId, loginId, loginName, tenantName, logo } = this.props;
    if (nextProps.newMessage.count !== this.props.newMessage.count) {
      const { module, promptType, shipment } = nextProps.newMessage;
    }
  }
  handleRecordMessage({ loginId, tenantId, loginName, messages }) {
    this.props.recordMessages({ loginId, tenantId, loginName, messages }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('催促成功');
      }
    });
  }
  handleSendMessage(data) {
    const id = this.easemob.conn.getUniqueId();// 生成本地消息id
    const msg = new this.easemob.WebIM.message('txt', id);// 创建文本消息

    msg.set({
      msg: data.content,
      to: data.to,
    });

    this.easemob.conn.send(msg.body);
  }
  notif(title, data) {
    if (("Notification" in window) && Notification.permission === 'granted') {
      const n = new Notification(title, data);
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
        message: title,
        description: data.body,
        btn,
        key,
      });
    }
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleVisibleChange = (visible) => {
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
          <a role="presentation" ><i className="zmdi zmdi-check-all zmdi-hc-lg" /></a>
        </div>
        <span>{this.msg('notification')}</span>
      </div>
      <div className="popover-body">
      <Alert
        message="Additional description and informations."
        type="info"
        showIcon
        closable
      />
      <Alert
        message="This is a warning notice about copywriting."
        type="warning"
        showIcon
        closable
      />
      <Alert
        message="This is an error message about copywriting."
        type="error"
        showIcon
        closable
      />
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
