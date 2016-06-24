import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, notification } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => {
    return {
    tenantId: state.account.tenantId,
    loginId: state.account.loginId
}})
export default class MessagePrompt extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  componentDidMount() {
    const socket = io.connect(window.location.host + '/corp');
    socket.on('connect', () => {
      const {tenantId, loginId} = this.props;
      socket.emit('room', {tenantId, loginId});
    });
    socket.on('message', (data) => {
      this.notif(data.from_name, {
        body: data.content,
        icon: data.logo,
        url: data.url
      });
    });
  }
  notif(title, data) {
    if (Notification) {
      Notification.requestPermission(status => {
        if (Notification.permission !== status) {
            Notification.permission = status;
        }
      });
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
    return <div></div>;
  }
}
