import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, notification } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import io from 'socket.io/node_modules/socket.io-client';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => {
    return {
    tenantId: state.account.tenantId,
    loginId: state.account.loginId
  };
})
export default class MessagePrompt extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  componentDidMount() {
    const socket = io.connect();
    socket.on('connect', () => {
      const {tenantId, loginId} = this.props;
      socket.emit('room', {tenantId, loginId});
    });
    socket.on('message', (data) => {
      this.notif(data.title, {
        body: data.content,
        icon: data.logo,
        url: data.url
      });
    });
    if (Notification && Notification.permission != 'granted') {
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
