/* eslint-disable */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, notification, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { countMessages, messageBadgeNum } from 'common/reducers/corps';
const formatMsg = format(messages);
let conn;
let WebIM;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(countMessages(cookie, {
    loginId: state.account.loginId,
    status: 0,
  }));
}

@connectFetch()(fetchData)

@injectIntl
@connect(
  (state) => {
    return {
      tenantId: state.account.tenantId,
      loginId: state.account.loginId,
      loginName: state.account.username,
      tenantName: state.account.tenantName,
      logo: state.account.logo,
      corps: state.corps,
      newMessage: state.corps.newMessage,
    };
  }, { messageBadgeNum })
export default class MessagePrompt extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    newMessage: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { tenantId, loginId, loginName } = this.props;
    WebIM = window.WebIM;
    WebIM.config = {
      xmppURL: 'im-api.easemob.com',
      apiURL: `${window.location.protocol === 'https:' ? 'https:' : 'http:'}//a1.easemob.com`,
      appkey: 'jiaojiao123#test',
      https: true,
      isMultiLoginSessions: true,
      isAutoLogin: true,
    };
    conn = new WebIM.connection({
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
        // this.props.messageBadgeNum(this.props.corps.notReadMessagesNum + 1);
      },
      onError: (msg) => { },           // 失败回调
    });
    const options = {
      username: `tenantId_${tenantId}`,
      password: `${loginId}`,
      nickname: loginName,
      appKey: WebIM.config.appkey,
      success: () => { },
      error: () => { },
      apiUrl: WebIM.config.apiURL,
    };
    try {
      WebIM.utils.registerUser(options);
    } catch (e) {

    }
    const user = {
      apiUrl: WebIM.config.apiURL,
      user: options.username,
      pwd: options.password,
      appKey: WebIM.config.appkey,
    };

    conn.open(user);
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission(status => {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { tenantId, loginId, loginName, tenantName, logo } = this.props;
    if (nextProps.newMessage.count > 0) {
      const { notifyType, shipment } = nextProps.newMessage;
      let to = '';
      const content = {
        loginId,
        tenantId,
        loginName,
        tenantName,
        logo,
        msg: '',
      };
      if (notifyType === 'notifyAccept') {
        to = `tenantId_${shipment.sp_tenant_id}`;
        content.msg = '请尽快接单';
      } else if (notifyType === 'notifyDispatch') {
        to = `tenantId_${shipment.sp_tenant_id}`;
        content.msg = '请尽快调度';
      } else if (notifyType === 'notifyDriverPickup') {
        to = `driverId_${shipment.task_driver_id}`;
        content.msg = '请尽快提货';
      } else if (notifyType === 'notifySpPickup') {
        to = `tenantId_${shipment.sp_tenant_id}`;
        content.msg = '请尽快提货';
      } else if (notifyType === 'notifyDriverPod') {
        to = `driverId_${shipment.task_driver_id}`;
        content.msg = '请尽快上传回单';
      } else if (notifyType === 'notifySpPod') {
        to = `tenantId_${shipment.sp_tenant_id}`;
        content.msg = '请尽快上传回单';
      }
      this.handleSendMessage({ to, content: JSON.stringify(content) });
    }
  }
  handleSendMessage(data) {
    const id = conn.getUniqueId();// 生成本地消息id
    const msg = new WebIM.message('txt', id);// 创建文本消息

    msg.set({
      msg: data.content,
      to: data.to,
      success() {
        message.info('催促成功');
      },
    });

    conn.send(msg.body);
  }
  notif(title, data) {
    if (Notification && Notification.permission === 'granted') {
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
  render() {
    return (
      <div>
        <script src="/assets/lib/easemob/strophe.js" type="text/javascript"></script>
        <script src="/assets/lib/easemob/websdk-1.1.2.js" type="text/javascript"></script>
      </div>
    );
  }
}
