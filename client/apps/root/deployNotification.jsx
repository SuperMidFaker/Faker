import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import io from 'socket.io-client';

export default class DeployNotification extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const socket = io(`${API_ROOTS.notify}sysinfo`);
    socket.on('connect', () => {
      const { location } = this.context.router;
      socket.on('cihook', (data) => {
        if (data.message === 'new-web-version') {
          message.destroy();
          message.warn(
            <span>发现系统版本更新, 请<a href={location.pathname}>点击刷新</a></span>,
            0
          );
        }
      });
    });
    if (__DEV__) {
      socket.on('connect_error', () => {
        socket.close();
      });
    }
  }
  render() {
    return null;
  }
}

