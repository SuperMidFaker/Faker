import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, notification } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import io from 'socket.io/node_modules/socket.io-client';
import { countMessages, messageBadgeNum } from 'common/reducers/corps';
const formatMsg = format(messages);
let socket = null;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(countMessages(cookie, {
    loginId: state.account.loginId,
    status: 0,
  }));
}

@connectFetch()(fetchData)

@injectIntl
@connect(
  state => {
    return {
      tenantId: state.account.tenantId,
      loginId: state.account.loginId,
      corps: state.corps,
    };
  }, { messageBadgeNum })
export default class MessagePrompt extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    if (socket === null) {
      socket = io.connect(API_ROOTS.default);
      socket.on('connect', () => {
        const { tenantId, loginId } = this.props;
        socket.emit('room', { tenantId, loginId });
      });
      socket.on('message', (data) => {
        this.notif(data.title, {
          body: data.content,
          icon: data.logo,
          url: data.url,
        });
        this.props.messageBadgeNum(this.props.corps.notReadMessagesNum + 1);
      });
    }
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission(status => {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
      });
    }
  }
  notif(title, data) {
    if (Notification && Notification.permission === 'granted') {
      const n = new Notification(title, data);
      n.onclick = () => {
        this.handleNavigationTo(data.url);
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
    return null;
  }
}
