import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { Logixon } from 'client/components/FontIcon';
import { formatMsg } from './message.i18n';

@injectIntl
export default class SettingMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  render() {
    return (
      <div>
        <Menu mode="inline" selectedKeys={[this.props.currentKey]}>
          <Menu.Item key="preferences">
            <NavLink to="/clearance/settings/preferences">
              <Logixon type="rule" /> {this.msg('preferences')}
            </NavLink>
          </Menu.Item>
          <Menu.Item key="brokers">
            <NavLink to="/clearance/settings/brokers"><Icon type="database" /> {this.msg('brokers')}</NavLink>
          </Menu.Item>
          <Menu.Item key="events">
            <NavLink to="/clearance/settings/events"><Icon type="calculator" /> {this.msg('events')}</NavLink>
          </Menu.Item>
        </Menu>
      </div>);
  }
}
