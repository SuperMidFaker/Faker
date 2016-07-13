import React, { PropTypes } from 'react';
import { Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const MenuItem = Menu.Item;

@injectIntl
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'transportTracking'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
export default class TrackingMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentKey: ['land'],
  }
  componentWillMount() {
    if (this.props.location && this.props.location.pathname) {
      const paths = this.props.location.pathname.split('/');
      this.setState({ currentKey: [ paths[3] ] });
    }
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleMenuChange = (ev) => {
    const key = ev.key;
    if (key === 'land') {
      this.context.router.push('/transport/tracking/land/shipmt/status/all');
    } else if (key === 'air') {
      this.context.router.push('/transport/tracking/air');
    } else if (key === 'express') {
      this.context.router.push('/transport/tracking/express');
    }
    this.setState({ currentKey: [key] });
  }
  render() {
    return (
      <div>
        <Menu mode="horizontal" selectedKeys={this.state.currentKey}
        onClick={this.handleMenuChange}
        >
          <MenuItem key="land">{this.msg('landTransport')}</MenuItem>
          <MenuItem key="air">{this.msg('airTransport')}</MenuItem>
          <MenuItem key="express">{this.msg('expressTransport')}</MenuItem>
        </Menu>
        {this.props.children}
      </div>
    );
  }
}
